import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { getAnthropic } from '@/lib/maasik/anthropic-client';
import { htmlToPdfBuffer } from '@/lib/maasik/doppio';
import { sendReportEmail, sendInternalFailureAlert } from '@/lib/maasik/resend';
import { SYSTEM_PROMPT } from '@/lib/maasik/system-prompt';
import { HTML_TEMPLATE } from '@/lib/maasik/html-template';
import {
  formatVedicDate,
  getBmiCategory,
  getMonthDescriptor,
  getRituDescriptor,
  humanisePaksha,
  humanisePrakriti,
  computeDoshaCellClasses,
  getDoshaLabel,
  getPrimaryGoalDisplay,
  getSecondaryGoalDisplay,
  getActiveConcernDisplay,
  formatIssueNumber,
  computeReportCostInr,
  type MaasikUser,
  type VedicMonth,
} from '@/lib/maasik/helpers';

export const runtime = 'nodejs';
export const maxDuration = 120;  // 2 minute budget for Claude + Doppio + Resend

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Internal-only endpoint, check secret
    const secret = req.headers.get('x-internal-secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, force_regenerate } = await req.json();
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // 1. Fetch user
    const { data: user, error: userError } = await supabase
      .from('maasik_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Find current Vedic month
    const today = new Date().toISOString().split('T')[0];
    const { data: month, error: monthError } = await supabase
      .from('maasik_vedic_calendar')
      .select('*')
      .lte('gregorian_start', today)
      .gte('gregorian_end', today)
      .eq('paksha', 'shukla')
      .order('gregorian_start', { ascending: false })
      .limit(1)
      .single();

    if (monthError || !month) return NextResponse.json({ error: 'No active Vedic month' }, { status: 404 });

    // 3. Check for existing report
    if (!force_regenerate) {
      const { data: existing } = await supabase
        .from('maasik_reports')
        .select('id, delivery_status')
        .eq('user_id', user_id)
        .eq('vedic_month', month.vedic_month)
        .eq('paksha', month.paksha)
        .eq('vikram_samvat', month.vikram_samvat)
        .maybeSingle();

      if (existing && ['sent', 'delivered', 'opened'].includes(existing.delivery_status)) {
        return NextResponse.json({ ok: true, already_sent: true, report_id: existing.id });
      }
    }

    // 4. Issue number
    const { count: priorCount } = await supabase
      .from('maasik_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .in('delivery_status', ['sent', 'delivered', 'opened']);
    const issueNumber = (priorCount || 0) + 1;

    // 5. Upsert report record
    const { data: report, error: reportError } = await supabase
      .from('maasik_reports')
      .upsert({
        user_id,
        vedic_month: month.vedic_month,
        paksha: month.paksha,
        vikram_samvat: month.vikram_samvat,
        ritu: month.ritu,
        gregorian_start: month.gregorian_start,
        gregorian_end: month.gregorian_end,
        issue_number: issueNumber,
        delivery_status: 'generating',
        generation_prompt_version: 'v1.0',
        generation_model: 'claude-sonnet-4-6',
      }, { onConflict: 'user_id,vedic_month,paksha,vikram_samvat' })
      .select()
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Failed to create report record', details: reportError }, { status: 500 });
    }

    // 6. Build the user message
    const userMessage = buildUserMessage(user as MaasikUser, month as VedicMonth, issueNumber);

    // 7. Call Claude
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const html = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('\n')
      .trim();

    // 8. Validate HTML
    if (!html.startsWith('<!DOCTYPE html>') || !html.endsWith('</html>')) {
      await supabase.from('maasik_reports').update({
        delivery_status: 'failed',
        delivery_error: 'Invalid HTML output from Claude',
        report_html: html.slice(0, 5000),
      }).eq('id', report.id);

      await sendInternalFailureAlert({
        userEmail: user.email,
        userId: user.id,
        reportId: report.id,
        reason: 'Claude returned malformed HTML',
      });

      return NextResponse.json({ error: 'Invalid HTML output' }, { status: 500 });
    }

    // 9. Check for unfilled placeholders
    const unfilled = html.match(/\[\[[A-Z_]+\]\]/g);
    if (unfilled && unfilled.length > 0) {
      await supabase.from('maasik_reports').update({
        delivery_status: 'failed',
        delivery_error: `Unfilled placeholders: ${unfilled.slice(0, 5).join(', ')}`,
        report_html: html,
      }).eq('id', report.id);

      await sendInternalFailureAlert({
        userEmail: user.email,
        userId: user.id,
        reportId: report.id,
        reason: `Unfilled placeholders: ${unfilled.join(', ')}`,
      });

      return NextResponse.json({ error: 'Template not fully filled', unfilled }, { status: 500 });
    }

    // 10. Save HTML and generation metadata
    await supabase.from('maasik_reports').update({
      report_html: html,
      generation_tokens_input: response.usage.input_tokens,
      generation_tokens_output: response.usage.output_tokens,
      generation_cost_inr: computeReportCostInr(response.usage),
      generation_duration_ms: Date.now() - startTime,
    }).eq('id', report.id);

    // 11. Convert HTML to PDF via Doppio
    const pdfBuffer = await htmlToPdfBuffer(html);

    // 12. Upload PDF to Supabase Storage
    const pdfFilename = `MAASIK_${month.vedic_month}_${user.full_name.replace(/\s+/g, '_')}_${month.gregorian_start}.pdf`;
    const storagePath = `${user.id}/${report.id}/${pdfFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('maasik-reports')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      // Non-fatal, we can still email it
    }

    // Get signed URL (valid 30 days)
    const { data: signed } = await supabase.storage
      .from('maasik-reports')
      .createSignedUrl(storagePath, 30 * 24 * 60 * 60);

    await supabase.from('maasik_reports').update({
      report_pdf_storage_path: storagePath,
      report_pdf_url: signed?.signedUrl || null,
    }).eq('id', report.id);

    // 13. Send the email
    let resendId = '';
    try {
      resendId = await sendReportEmail({
        to: user.email,
        firstName: user.full_name.split(' ')[0],
        vedicMonth: month.vedic_month,
        ritu: month.ritu,
        issueNumber,
        pdfBuffer,
        pdfFilename,
      });
    } catch (emailErr: any) {
      await supabase.from('maasik_reports').update({
        delivery_status: 'failed',
        delivery_error: `Resend failed: ${emailErr.message}`,
      }).eq('id', report.id);

      await sendInternalFailureAlert({
        userEmail: user.email,
        userId: user.id,
        reportId: report.id,
        reason: emailErr.message,
      });

      return NextResponse.json({ error: 'Email send failed', details: emailErr.message }, { status: 500 });
    }

    // 14. Mark sent
    await supabase.from('maasik_reports').update({
      delivery_status: 'sent',
      sent_at: new Date().toISOString(),
      resend_message_id: resendId,
    }).eq('id', report.id);

    // 15. Update user first_report_sent_at if this is issue 1
    if (issueNumber === 1) {
      await supabase.from('maasik_users').update({
        first_report_sent_at: new Date().toISOString(),
      }).eq('id', user_id);
    }

    // 16. Log event
    await supabase.from('maasik_events').insert({
      user_id,
      email: user.email,
      event_type: 'report_sent',
      event_source: 'generate-report',
      event_data: {
        report_id: report.id,
        vedic_month: month.vedic_month,
        issue_number: issueNumber,
        duration_ms: Date.now() - startTime,
      },
    });

    return NextResponse.json({
      ok: true,
      report_id: report.id,
      duration_ms: Date.now() - startTime,
      resend_message_id: resendId,
    });

  } catch (err: any) {
    console.error('Report generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildUserMessage(user: MaasikUser, month: VedicMonth, issueNumber: number): string {
  const firstName = user.full_name.split(' ')[0];
  const today = formatVedicDate(new Date().toISOString().split('T')[0]);

  // Pre-compute display values for the profile strip and template slots
  const prakritiDisplay = humanisePrakriti(user.prakriti_label);
  const cellClasses = computeDoshaCellClasses(user.vata_score, user.pitta_score, user.kapha_score);
  const primaryGoal = getPrimaryGoalDisplay(user.primary_goals);
  const secondaryGoal = getSecondaryGoalDisplay(user.primary_goals);
  const activeConcern = getActiveConcernDisplay(user.allergies, user.medical_conditions);

  // Prepare the user_profile, vedic_month_context, and output_template blocks
  return `Generate the MAASIK monthly blueprint for the following user.

<user_profile>
  <name>${user.full_name}</name>
  <first_name>${firstName}</first_name>
  <age>${user.age || 'not provided'}</age>
  <gender>${user.gender || 'not provided'}</gender>
  <city>${user.city || 'India'}</city>
  <region>${user.region || ''}</region>
  <height_cm>${user.height_cm || ''}</height_cm>
  <weight_kg>${user.weight_kg || ''}</weight_kg>
  <bmi>${user.bmi || ''}</bmi>
  <bmi_category>${getBmiCategory(user.bmi)}</bmi_category>

  <prakriti_label>${user.prakriti_label || ''}</prakriti_label>
  <prakriti_display>${prakritiDisplay}</prakriti_display>
  <vata_score>${user.vata_score}</vata_score>
  <pitta_score>${user.pitta_score}</pitta_score>
  <kapha_score>${user.kapha_score}</kapha_score>

  <primary_goals>${user.primary_goals.join(', ')}</primary_goals>
  <primary_goal_display>${primaryGoal}</primary_goal_display>
  <secondary_goal_display>${secondaryGoal}</secondary_goal_display>
  <goal_specifics>${user.goal_specifics || 'not specified'}</goal_specifics>

  <diet_type>${user.diet_type || 'unspecified'}</diet_type>
  <favorite_foods>${user.favorite_foods || 'not specified'}</favorite_foods>
  <disliked_foods>${user.disliked_foods || 'none'}</disliked_foods>
  <allergies>${user.allergies || 'none'}</allergies>
  <medical_conditions>${user.medical_conditions || 'none'}</medical_conditions>
  <active_concern_display>${activeConcern}</active_concern_display>

  <sleep_time>${user.sleep_time || '11:00 PM'}</sleep_time>
  <wake_time>${user.wake_time || '06:30 AM'}</wake_time>
  <work_type>${user.work_type || 'sedentary'}</work_type>
  <stress_level>${user.stress_level || 'moderate'}</stress_level>
  <meal_timing_pattern>${user.meal_timing_pattern || 'standard'}</meal_timing_pattern>

  <expectations>${user.expectations || 'general wellness'}</expectations>
</user_profile>

<vedic_month_context>
  <vedic_month>${month.vedic_month}</vedic_month>
  <paksha>${month.paksha}</paksha>
  <paksha_full>${humanisePaksha(month.paksha)}</paksha_full>
  <vikram_samvat>${month.vikram_samvat}</vikram_samvat>
  <ritu>${month.ritu}</ritu>
  <ritu_descriptor>${getRituDescriptor(month.ritu)}</ritu_descriptor>
  <gregorian_start>${month.gregorian_start}</gregorian_start>
  <gregorian_end>${month.gregorian_end}</gregorian_end>
  <gregorian_start_formatted>${formatVedicDate(month.gregorian_start)}</gregorian_start_formatted>
  <gregorian_end_formatted>${formatVedicDate(month.gregorian_end)}</gregorian_end_formatted>
  <is_adhik_maas>${month.is_adhik_maas || false}</is_adhik_maas>
  <month_descriptor>${getMonthDescriptor(month)}</month_descriptor>
</vedic_month_context>

<dosha_cell_classes>
  <vata>${cellClasses.vata}</vata>
  <pitta>${cellClasses.pitta}</pitta>
  <kapha>${cellClasses.kapha}</kapha>
  <vata_label>${getDoshaLabel(user.vata_score, cellClasses.vata)}</vata_label>
  <pitta_label>${getDoshaLabel(user.pitta_score, cellClasses.pitta)}</pitta_label>
  <kapha_label>${getDoshaLabel(user.kapha_score, cellClasses.kapha)}</kapha_label>
</dosha_cell_classes>

<issue_number>${formatIssueNumber(issueNumber)}</issue_number>
<generation_date_formatted>${today}</generation_date_formatted>

<output_template>
${HTML_TEMPLATE}
</output_template>

Produce the complete HTML now, replacing every [[SLOT_NAME]] placeholder with calibrated content. Return only the HTML, starting with <!DOCTYPE html> and ending with </html>. No preamble, no code fences, no commentary.`;
}
