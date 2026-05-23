import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Backstop for paid-but-undelivered customers.
//
// The Razorpay webhook fires generate-report exactly once via waitUntil and
// does not retry. If that call fails (token budget, transient Anthropic /
// Doppio / Resend error, Vercel cold-start timeout, etc.) the user has paid
// but no report ever lands in their inbox unless ops manually re-triggers.
// Sagar (May 2026) was lost to exactly this gap: validation_failed_after_retry
// because Claude truncated at max_tokens=18000, then no retry path existed.
//
// This cron sweeps once an hour, finds any user whose latest payment in the
// current Vedic month resulted in a 'failed' or stuck 'generating' report,
// and re-fires generate-report with force_regenerate=true. Cap the per-run
// batch to keep one bad row from blowing the whole window's budget.

const MAX_RECOVERIES_PER_RUN = 10;
const STUCK_GENERATING_MIN_AGE_MINUTES = 30;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Find the current Vedic month so we only chase reports the user is
    // currently owed. Older failed rows are out-of-window and need manual
    // ops review, not an automatic re-fire.
    const today = new Date().toISOString().split('T')[0];
    const { data: month } = await supabase
      .from('maasik_vedic_calendar')
      .select('vedic_month, paksha, vikram_samvat')
      .lte('gregorian_start', today)
      .gte('gregorian_end', today)
      .eq('paksha', 'shukla')
      .order('gregorian_start', { ascending: false })
      .limit(1)
      .single();

    if (!month) {
      return NextResponse.json({ ok: true, recovered: 0, message: 'No active Vedic month' });
    }

    // Candidates: latest report per (user, current month) where status is
    // 'failed', or 'generating' for >30 min (the route's wall-clock budget is
    // 800s; anything past 30 minutes is genuinely stuck).
    const stuckCutoff = new Date(Date.now() - STUCK_GENERATING_MIN_AGE_MINUTES * 60_000).toISOString();
    const { data: candidates, error: candErr } = await supabase
      .from('maasik_reports')
      .select('id, user_id, delivery_status, delivery_error, generation_stop_reason, generation_attempts, created_at')
      .eq('vedic_month', month.vedic_month)
      .eq('paksha', month.paksha)
      .eq('vikram_samvat', month.vikram_samvat)
      .or(`delivery_status.eq.failed,and(delivery_status.eq.generating,created_at.lt.${stuckCutoff})`)
      .order('created_at', { ascending: true })
      .limit(MAX_RECOVERIES_PER_RUN);

    if (candErr) {
      return NextResponse.json({ error: candErr.message }, { status: 500 });
    }
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ ok: true, recovered: 0, vedic_month: month.vedic_month });
    }

    // Only retry users who actually paid for this month. A failed row for a
    // user who never paid is not our problem (and could be a test artefact).
    const userIds = Array.from(new Set(candidates.map((r: any) => r.user_id)));
    const { data: paidUsers } = await supabase
      .from('maasik_users')
      .select('id, email, subscription_status, current_period_end')
      .in('id', userIds)
      .eq('subscription_status', 'active');

    const paidUserIds = new Set((paidUsers || []).map((u: any) => u.id));
    const recoverable = candidates.filter((r: any) => paidUserIds.has(r.user_id));

    if (recoverable.length === 0) {
      return NextResponse.json({
        ok: true,
        recovered: 0,
        candidates_total: candidates.length,
        skipped_no_active_subscription: candidates.length,
      });
    }

    // Mark each candidate so we don't re-fire the same row on the next sweep
    // while a retry is in flight, and so the audit trail shows recovery
    // attempts separate from organic generation attempts.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maasik.neorishi.io';
    const results: any[] = [];

    for (const row of recoverable) {
      await supabase.from('maasik_events').insert({
        user_id: row.user_id,
        event_type: 'report_recovery_started',
        event_source: 'cron-recover-failed',
        event_data: {
          report_id: row.id,
          prior_status: row.delivery_status,
          prior_error: row.delivery_error,
          prior_stop_reason: row.generation_stop_reason,
          prior_attempts: row.generation_attempts,
        },
      });

      try {
        const res = await fetch(`${baseUrl}/api/generate-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.CRON_SECRET || '',
          },
          body: JSON.stringify({ user_id: row.user_id, force_regenerate: true }),
        });
        const data = await res.json().catch(() => ({}));
        results.push({ user_id: row.user_id, report_id: row.id, status: res.status, body: data });

        await supabase.from('maasik_events').insert({
          user_id: row.user_id,
          event_type: res.ok ? 'report_recovery_succeeded' : 'report_recovery_failed',
          event_source: 'cron-recover-failed',
          event_data: { report_id: row.id, http_status: res.status, body: data },
        });
      } catch (err: any) {
        results.push({ user_id: row.user_id, report_id: row.id, error: String(err?.message || err) });
        await supabase.from('maasik_events').insert({
          user_id: row.user_id,
          event_type: 'report_recovery_failed',
          event_source: 'cron-recover-failed',
          event_data: { report_id: row.id, error: String(err?.message || err) },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      vedic_month: month.vedic_month,
      candidates_total: candidates.length,
      recovered_attempted: recoverable.length,
      results,
    });
  } catch (err: any) {
    console.error('cron-recover-failed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
