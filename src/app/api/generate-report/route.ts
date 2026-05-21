import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { getAnthropic } from '@/lib/maasik/anthropic-client';
import { htmlToPdfBuffer } from '@/lib/maasik/doppio';
import { sendReportEmail, sendInternalFailureAlert } from '@/lib/maasik/resend';
import { SYSTEM_PROMPT } from '@/lib/maasik/system-prompt';
import {
  computeReportCostInr,
  type MaasikUser,
  type VedicMonth,
} from '@/lib/maasik/helpers';
import { buildUserMessage } from '@/lib/maasik/user-message';
import { validateGeneratedHtml } from '@/lib/maasik/validate-html';

export const runtime = 'nodejs';
export const maxDuration = 800;  // Up to 13 minutes for Claude + Doppio + Resend

const GENERATION_PROMPT_VERSION = 'v4.0';

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

    // ---- 1. Fetch user
    const { data: user, error: userError } = await supabase
      .from('maasik_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ---- 2. Find current Vedic month
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

    if (monthError || !month) {
      return NextResponse.json({ error: 'No active Vedic month' }, { status: 404 });
    }

    console.log(`[generate-report v2.0] user_id=${user_id} month=${month.vedic_month}`);

    // ---- 3. Check for existing report (with usable HTML to skip Claude during testing)
    const { data: existing } = await supabase
      .from('maasik_reports')
      .select('id, delivery_status, report_html, issue_number, edition_number, report_pdf_storage_path')
      .eq('user_id', user_id)
      .eq('vedic_month', month.vedic_month)
      .eq('paksha', month.paksha)
      .eq('vikram_samvat', month.vikram_samvat)
      .maybeSingle();

    // A new payment landed for a month whose report was already generated and
    // shipped (common when a user re-pays after a prior test, or pays a second
    // time mid-month). Don't silently no-op, the user just paid and expects an
    // email. Re-download the existing PDF and re-send via Resend, no Claude/
    // Doppio cost. If the storage path is missing or download fails, log the
    // miss so ops can backfill manually.
    if (existing && ['sent', 'delivered', 'opened'].includes(existing.delivery_status) && !force_regenerate) {
      const existingEdition = existing.edition_number || existing.issue_number || 1;

      if (!existing.report_pdf_storage_path) {
        await supabase.from('maasik_events').insert({
          user_id,
          email: user.email,
          event_type: 'report_resend_skipped',
          event_source: 'generate-report',
          event_data: {
            report_id: existing.id,
            vedic_month: month.vedic_month,
            reason: 'no_storage_path',
          },
        });
        return NextResponse.json({
          ok: true,
          already_sent: true,
          resent: false,
          reason: 'no_storage_path',
          report_id: existing.id,
        });
      }

      const { data: pdfBlob, error: downloadError } = await supabase.storage
        .from('maasik-reports')
        .download(existing.report_pdf_storage_path);

      if (downloadError || !pdfBlob) {
        await supabase.from('maasik_events').insert({
          user_id,
          email: user.email,
          event_type: 'report_resend_skipped',
          event_source: 'generate-report',
          event_data: {
            report_id: existing.id,
            vedic_month: month.vedic_month,
            reason: 'storage_download_failed',
            error: downloadError?.message || 'no_blob',
          },
        });
        return NextResponse.json({
          ok: true,
          already_sent: true,
          resent: false,
          reason: 'storage_download_failed',
          report_id: existing.id,
        });
      }

      const safeName = user.full_name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const pdfFilename = `MAASIK_${month.vedic_month}_${safeName}_${month.gregorian_start}.pdf`;
      const resentBuffer = Buffer.from(await pdfBlob.arrayBuffer());

      let resentResendId = '';
      try {
        resentResendId = await sendReportEmail({
          to: user.email,
          firstName: user.full_name.split(' ')[0],
          vedicMonth: month.vedic_month,
          ritu: month.ritu,
          issueNumber: existingEdition,
          pdfBuffer: resentBuffer,
          pdfFilename,
        });
      } catch (emailErr: any) {
        await sendInternalFailureAlert({
          userEmail: user.email,
          userId: user.id,
          reportId: existing.id,
          reason: `Resend (re-send path) failed: ${emailErr.message}`,
        });
        return NextResponse.json(
          { error: 'Resend (re-send path) failed', details: emailErr.message },
          { status: 500 },
        );
      }

      await supabase.from('maasik_events').insert({
        user_id,
        email: user.email,
        event_type: 'report_resent',
        event_source: 'generate-report',
        event_data: {
          report_id: existing.id,
          vedic_month: month.vedic_month,
          edition_number: existingEdition,
          resend_message_id: resentResendId,
        },
      });

      return NextResponse.json({
        ok: true,
        already_sent: true,
        resent: true,
        report_id: existing.id,
        resend_message_id: resentResendId,
      });
    }

    // ---- 4. Determine edition number (only for new reports)
    let editionNumber: number;
    if (existing?.edition_number) {
      editionNumber = existing.edition_number;
    } else if (existing?.issue_number) {
      editionNumber = existing.issue_number;
    } else {
      const { count: priorCount } = await supabase
        .from('maasik_reports')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .in('delivery_status', ['sent', 'delivered', 'opened']);
      editionNumber = (priorCount || 0) + 1;
    }

    // ---- 5. Decide whether to reuse existing HTML or generate fresh
    let report: any;
    let html: string;

    const hasUsableHtml =
      existing &&
      existing.report_html &&
      existing.report_html.length > 5000 &&
      existing.report_html.startsWith('<!DOCTYPE html>');

    if (hasUsableHtml && !force_regenerate) {
      // -- Path A: REUSE existing HTML (zero Claude cost, fast)
      console.log('Reusing existing HTML from report', existing.id, 'skipping Claude');
      report = existing;
      html = existing.report_html;
    } else {
      // -- Path B: GENERATE fresh via Claude

      // 5B.1: Upsert the report row in 'generating' status
      const { data: newReport, error: reportError } = await supabase
        .from('maasik_reports')
        .upsert({
          user_id,
          vedic_month: month.vedic_month,
          paksha: month.paksha,
          vikram_samvat: month.vikram_samvat,
          ritu: month.ritu,
          gregorian_start: month.gregorian_start,
          gregorian_end: month.gregorian_end,
          issue_number: editionNumber,
          edition_number: editionNumber,
          delivery_status: 'generating',
          generation_prompt_version: GENERATION_PROMPT_VERSION,
          generation_model: 'claude-sonnet-4-6',
        }, { onConflict: 'user_id,vedic_month,paksha,vikram_samvat' })
        .select()
        .single();

      if (reportError || !newReport) {
        return NextResponse.json(
          { error: 'Failed to create report record', details: reportError },
          { status: 500 },
        );
      }
      report = newReport;

      // 5B.2: Fetch previous word origins (last 3 sent reports) to prevent repeats
      const { data: priorReports } = await supabase
        .from('maasik_reports')
        .select('word_origins_used, sent_at')
        .eq('user_id', user_id)
        .in('delivery_status', ['sent', 'delivered', 'opened'])
        .order('sent_at', { ascending: false })
        .limit(3);

      const previousWordOrigins = Array.from(
        new Set(
          (priorReports || [])
            .flatMap((r: any) => (Array.isArray(r.word_origins_used) ? r.word_origins_used : []))
            .filter((w: unknown): w is string => typeof w === 'string' && w.length > 0),
        ),
      );

      // 5B.3: Build the user message and call Claude
      const userMessage = buildUserMessage(
        user as MaasikUser,
        month as VedicMonth,
        editionNumber,
        previousWordOrigins,
      );
      const anthropic = getAnthropic();
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 18000,
        temperature: 0.4,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      });

      html = response.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n')
        .trim();

      // Strip any accidental preamble (HTTP-like text, "Here is the HTML:", code-fence markers)
      // before the doctype and any trailing content after </html>. Defense-in-depth so a viewer
      // or downstream PDF tool never sees stray text around the document.
      const doctypeIdx = html.indexOf('<!DOCTYPE html>');
      if (doctypeIdx > 0) html = html.slice(doctypeIdx);
      const htmlCloseIdx = html.lastIndexOf('</html>');
      if (htmlCloseIdx >= 0) html = html.slice(0, htmlCloseIdx + '</html>'.length);

      // 5B.4: Post-generation validation (Phase 7 stub: structure + placeholders)
      let validation = validateGeneratedHtml(html, user as MaasikUser);
      let generationAttempts = 1;
      let secondResponse: typeof response | null = null;

      if (!validation.valid) {
        // One repair attempt: re-ask Claude with the specific validator errors.
        // LLM slip-class failures (entity encoding, occasional disliked-food
        // leak) usually clear on retry. Two attempts cap the cost; if both
        // fail we mark the report failed as before.
        console.warn(
          `[generate-report v2.0] validation_failed_attempt_1 user_id=${user_id} errors=${validation.errors.join(' | ')}`,
        );

        const repairUserTurn = `Your previous draft failed these validation checks:
${validation.errors.map((e) => `- ${e}`).join('\n')}

Regenerate the FULL HTML report fixing every issue above. Critical rules:
- Use the literal middle-dot character "·" (Unicode U+00B7) directly in the HTML. NEVER escape it as "&#183;", "&#xb7;", or "&middot;".
- Before finalizing the Vegetables and Fruits grocery cards, cross-check every item against the user's <disliked_foods> list. If any item matches case-insensitively, replace it with a seasonally-appropriate alternative.
- Return ONLY the complete HTML document starting with <!DOCTYPE html> and ending with </html>. No preamble, no code fences.`;

        secondResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 18000,
          temperature: 0.4,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: html },
            { role: 'user', content: repairUserTurn },
          ],
        });

        let repairedHtml = secondResponse.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n')
          .trim();

        const doctypeIdx2 = repairedHtml.indexOf('<!DOCTYPE html>');
        if (doctypeIdx2 > 0) repairedHtml = repairedHtml.slice(doctypeIdx2);
        const htmlCloseIdx2 = repairedHtml.lastIndexOf('</html>');
        if (htmlCloseIdx2 >= 0) repairedHtml = repairedHtml.slice(0, htmlCloseIdx2 + '</html>'.length);

        validation = validateGeneratedHtml(repairedHtml, user as MaasikUser);
        generationAttempts = 2;

        if (validation.valid) {
          console.log(
            `[generate-report v2.0] validation_passed_on_retry user_id=${user_id}`,
          );
          html = repairedHtml;
        } else {
          console.error(
            `[generate-report v2.0] validation_failed_after_retry user_id=${user_id} errors=${validation.errors.join(' | ')}`,
          );
          await supabase.from('maasik_reports').update({
            delivery_status: 'failed',
            delivery_error: validation.errors.join('; '),
            report_html: repairedHtml.slice(0, 5000),
          }).eq('id', report.id);

          await sendInternalFailureAlert({
            userEmail: user.email,
            userId: user.id,
            reportId: report.id,
            reason: `Validation failed after retry: ${validation.errors.join('; ')}`,
          });

          return NextResponse.json(
            { error: 'Validation failed', details: validation.errors, attempts: 2 },
            { status: 500 },
          );
        }
      } else {
        console.log(`[generate-report v2.0] validation_passed_first_try user_id=${user_id}`);
      }

      // 5B.5: Extract v2 metadata from the HTML
      const archetypeMatch = html.match(/<h3 class="archetype-name">([^<]+)<\/h3>/);
      const archetypeName = archetypeMatch ? archetypeMatch[1].trim() : null;

      const wordOriginsUsed = Array.from(
        new Set(
          Array.from(html.matchAll(/<div class="wo-term">([^<]+)<\/div>/g)).map((m) =>
            m[1].trim(),
          ),
        ),
      );

      // 5B.6: Save the generated HTML and generation metadata. If a retry
      // happened, combine token usage and cost across both Claude calls.
      const combinedUsage = secondResponse
        ? {
            input_tokens: response.usage.input_tokens + secondResponse.usage.input_tokens,
            output_tokens: response.usage.output_tokens + secondResponse.usage.output_tokens,
            cache_creation_input_tokens:
              (response.usage.cache_creation_input_tokens || 0)
              + (secondResponse.usage.cache_creation_input_tokens || 0),
            cache_read_input_tokens:
              (response.usage.cache_read_input_tokens || 0)
              + (secondResponse.usage.cache_read_input_tokens || 0),
          }
        : response.usage;

      await supabase.from('maasik_reports').update({
        report_html: html,
        archetype_name: archetypeName,
        word_origins_used: wordOriginsUsed,
        generation_tokens_input: combinedUsage.input_tokens,
        generation_tokens_output: combinedUsage.output_tokens,
        generation_cost_inr: computeReportCostInr(combinedUsage as any),
        generation_duration_ms: Date.now() - startTime,
      }).eq('id', report.id);

      if (generationAttempts > 1) {
        console.log(`[generate-report v2.0] generation_attempts=${generationAttempts} user_id=${user_id}`);
      }
    }

    // ---- 6. Convert HTML to PDF via Doppio (applies to both paths)
    const pdfBuffer = await htmlToPdfBuffer(html);

    // ---- 7. Upload PDF to Supabase Storage
    const safeName = user.full_name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const pdfFilename = `MAASIK_${month.vedic_month}_${safeName}_${month.gregorian_start}.pdf`;
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

    // ---- 8. Generate signed URL (valid 30 days)
    const { data: signed } = await supabase.storage
      .from('maasik-reports')
      .createSignedUrl(storagePath, 30 * 24 * 60 * 60);

    await supabase.from('maasik_reports').update({
      report_pdf_storage_path: storagePath,
      report_pdf_url: signed?.signedUrl || null,
    }).eq('id', report.id);

    // ---- 9. Send the email
    let resendId = '';
    try {
      resendId = await sendReportEmail({
        to: user.email,
        firstName: user.full_name.split(' ')[0],
        vedicMonth: month.vedic_month,
        ritu: month.ritu,
        issueNumber: editionNumber,
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

      return NextResponse.json(
        { error: 'Email send failed', details: emailErr.message },
        { status: 500 },
      );
    }

    // ---- 10. Mark as sent
    await supabase.from('maasik_reports').update({
      delivery_status: 'sent',
      sent_at: new Date().toISOString(),
      resend_message_id: resendId,
    }).eq('id', report.id);

    // ---- 11. Update user.first_report_sent_at if this is edition 1
    if (editionNumber === 1) {
      await supabase.from('maasik_users').update({
        first_report_sent_at: new Date().toISOString(),
      }).eq('id', user_id);
    }

    // ---- 12. Log event
    await supabase.from('maasik_events').insert({
      user_id,
      email: user.email,
      event_type: 'report_sent',
      event_source: 'generate-report',
      event_data: {
        report_id: report.id,
        vedic_month: month.vedic_month,
        edition_number: editionNumber,
        issue_number: editionNumber,
        duration_ms: Date.now() - startTime,
        path: hasUsableHtml ? 'reused_html' : 'fresh_generation',
      },
    });

    return NextResponse.json({
      ok: true,
      report_id: report.id,
      duration_ms: Date.now() - startTime,
      resend_message_id: resendId,
      path: hasUsableHtml ? 'reused_html' : 'fresh_generation',
    });

  } catch (err: any) {
    console.error('Report generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
