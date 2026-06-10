/**
 * GET /api/backfill-content-json
 *
 * Backfills maasik_reports.content_json (schema maasik.content.v2) for
 * historical reports. Legacy HTML (pre template v4.1) has no data-slot hooks,
 * so the deterministic parser cannot run; this route uses the v1 LLM
 * transcription (extractContentJson) and lifts it to v2 with convertV1ToV2.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (same contract as the crons).
 *
 * Query params:
 *   limit=N       max reports per invocation (default 1, max 3; each costs
 *                 one Claude call of roughly 1-2 minutes)
 *   report_id=X   backfill exactly one report by id (overrides selection)
 *   all=true      include non-latest reports too (default: only the latest
 *                 report per user, which is what the app renders)
 *   dry=true      select and report what WOULD run, change nothing
 *
 * Idempotent: only touches rows whose content_schema_version is not v2.
 * Re-running after completion is a no-op.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { extractContentJson } from '@/lib/maasik/extract-content-json';
import { convertV1ToV2 } from '@/lib/maasik/v1-to-v2';
import { buildUserMessage } from '@/lib/maasik/user-message';
import type { MaasikUser, VedicMonth } from '@/lib/maasik/helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 800;

interface ReportRow {
  id: string;
  user_id: string;
  created_at: string;
  vedic_month: string;
  paksha: string;
  vikram_samvat: number | null;
  ritu: string | null;
  gregorian_start: string | null;
  gregorian_end: string | null;
  edition_number: number | null;
  issue_number: number | null;
  report_html: string | null;
  content_schema_version: string | null;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? '1') || 1, 1), 3);
  const onlyReportId = url.searchParams.get('report_id');
  const includeAll = url.searchParams.get('all') === 'true';
  const dryRun = url.searchParams.get('dry') === 'true';

  const supabase = getSupabaseAdmin();

  // ---- 1. Select candidates (newest first so "latest per user" wins).
  let query = supabase
    .from('maasik_reports')
    .select(
      'id, user_id, created_at, vedic_month, paksha, vikram_samvat, ritu, ' +
      'gregorian_start, gregorian_end, edition_number, issue_number, ' +
      'report_html, content_schema_version',
    )
    .order('created_at', { ascending: false });

  if (onlyReportId) {
    query = query.eq('id', onlyReportId);
  } else {
    query = query.or('content_schema_version.is.null,content_schema_version.neq.maasik.content.v2');
  }

  const { data: rows, error: qErr } = await query;
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  let candidates = (rows ?? []) as unknown as ReportRow[];

  if (!onlyReportId) {
    candidates = candidates.filter((r) => r.content_schema_version !== 'maasik.content.v2');
    if (!includeAll) {
      // Keep only each user's newest report; that is the row the app reads.
      // Skip users whose newest report already has v2 (handled upstream by
      // the not-v2 filter plus this latest-known check).
      const { data: v2Rows } = await supabase
        .from('maasik_reports')
        .select('id, user_id, created_at')
        .eq('content_schema_version', 'maasik.content.v2');
      const newestV2ByUser = new Map<string, string>();
      for (const r of v2Rows ?? []) {
        const prev = newestV2ByUser.get(r.user_id);
        if (!prev || r.created_at > prev) newestV2ByUser.set(r.user_id, r.created_at);
      }
      const seen = new Set<string>();
      candidates = candidates.filter((r) => {
        if (seen.has(r.user_id)) return false;
        seen.add(r.user_id);
        const newestV2 = newestV2ByUser.get(r.user_id);
        // If the user already has a v2 report newer than this one, the app
        // renders that; skip.
        return !(newestV2 && newestV2 >= r.created_at);
      });
    }
  }

  const batch = candidates.slice(0, limit);

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dry: true,
      pending_total: candidates.length,
      would_process: batch.map((r) => ({ id: r.id, user_id: r.user_id, month: r.vedic_month, created_at: r.created_at })),
    });
  }

  // ---- 2. Process the batch sequentially (each is a long Claude call).
  const results: Array<Record<string, unknown>> = [];
  for (const report of batch) {
    const started = Date.now();
    try {
      if (!report.report_html || report.report_html.length < 1000) {
        results.push({ id: report.id, ok: false, reason: 'no_report_html' });
        continue;
      }

      const { data: user, error: uErr } = await supabase
        .from('maasik_users')
        .select('*')
        .eq('id', report.user_id)
        .single();
      if (uErr || !user) {
        results.push({ id: report.id, ok: false, reason: 'user_not_found' });
        continue;
      }

      const month = {
        vedic_month: report.vedic_month,
        paksha: report.paksha,
        vikram_samvat: report.vikram_samvat ?? 0,
        ritu: report.ritu ?? '',
        gregorian_start: report.gregorian_start ?? '',
        gregorian_end: report.gregorian_end ?? '',
        is_adhik_maas: false,
      } as unknown as VedicMonth;

      const editionNumber = report.edition_number ?? report.issue_number ?? 1;
      const userMessage = buildUserMessage(user as MaasikUser, month, editionNumber, []);
      const cj = await extractContentJson(report.report_html, userMessage);

      if (!cj.ok) {
        await supabase.from('maasik_events').insert({
          user_id: report.user_id,
          email: (user as MaasikUser).email,
          event_type: 'content_json_backfill_failed',
          event_source: 'backfill-content-json',
          event_data: { report_id: report.id, reason: cj.error },
        });
        results.push({ id: report.id, ok: false, reason: cj.error });
        continue;
      }

      const v2 = convertV1ToV2(cj.contentJson, {
        sourceRef: `report:${report.id}`,
        generatedAt: new Date().toISOString(),
        paksha: report.paksha,
      });

      const { error: upErr } = await supabase
        .from('maasik_reports')
        .update({ content_json: v2, content_schema_version: 'maasik.content.v2' })
        .eq('id', report.id)
        .neq('content_schema_version', 'maasik.content.v2');
      if (upErr) {
        results.push({ id: report.id, ok: false, reason: upErr.message });
        continue;
      }

      await supabase.from('maasik_events').insert({
        user_id: report.user_id,
        email: (user as MaasikUser).email,
        event_type: 'content_json_backfilled',
        event_source: 'backfill-content-json',
        event_data: {
          report_id: report.id,
          schema_version: 'maasik.content.v2',
          path: 'v1_convert',
          tokens_output: cj.usage.output_tokens,
          duration_ms: Date.now() - started,
        },
      });
      results.push({ id: report.id, ok: true, month: report.vedic_month, duration_ms: Date.now() - started });
    } catch (err: any) {
      results.push({ id: report.id, ok: false, reason: err?.message || String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    remaining_estimate: Math.max(candidates.length - batch.length, 0),
    results,
  });
}
