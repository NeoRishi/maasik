import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { verifyReportToken } from '@/lib/maasik/report-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /report/[id]?token=<sha256>
 *
 * Serves the personalised MAASIK HTML report as a standalone document.
 * The report_html column already contains a complete <!DOCTYPE html> ... </html>
 * page, so we return it verbatim with a download button injected before </body>.
 *
 * Reports use the same delivery_status values as the rest of the pipeline:
 * 'sent', 'delivered', and 'opened' are all valid ready states.
 */

const READY_STATUSES = new Set(['sent', 'delivered', 'opened']);

const DOWNLOAD_BUTTON_HTML = `
  <div id="maasik-download-btn" style="position:fixed;bottom:24px;right:24px;z-index:9999;">
    <button onclick="window.print()" style="
      font-family: 'Manrope', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #8E3F26;
      background: #F7F1E5;
      border: 1px solid rgba(26,22,17,0.12);
      padding: 12px 20px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-radius: 2px;
    ">Save as PDF</button>
  </div>
  <style>@media print { #maasik-download-btn { display: none !important; } }</style>
`;

const COMMON_HEADERS: Record<string, string> = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function errorPage(title: string, body: string, status: number): Response {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>
    body { font-family: 'Manrope', system-ui, sans-serif; background:#F7F1E5; color:#1A1611; margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .card { max-width:480px; text-align:center; }
    h1 { font-family: Georgia, serif; font-style: italic; font-size: 28px; margin:0 0 12px; color:#8E3F26; }
    p { font-size:15px; line-height:1.6; color:#3D332B; margin:0; }
  </style></head><body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`;
  return new Response(html, { status, headers: COMMON_HEADERS });
}

function injectDownloadButton(html: string): string {
  const closingBody = html.lastIndexOf('</body>');
  if (closingBody === -1) return html + DOWNLOAD_BUTTON_HTML;
  return html.slice(0, closingBody) + DOWNLOAD_BUTTON_HTML + html.slice(closingBody);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const reportId = params.id;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return errorPage('Unauthorized', 'This report requires an access token.', 401);
  }

  const supabase = getSupabaseAdmin();

  const { data: report, error } = await supabase
    .from('maasik_reports')
    .select('id, user_id, report_html, delivery_status, delivered_at')
    .eq('id', reportId)
    .maybeSingle();

  if (error || !report) {
    return errorPage('Report not found', 'We could not find a report with that link.', 404);
  }

  if (!report.report_html || !READY_STATUSES.has(report.delivery_status)) {
    return errorPage(
      'Report not ready',
      'Your blueprint is still being prepared. Please try again shortly.',
      404,
    );
  }

  const { data: user } = await supabase
    .from('maasik_users')
    .select('email')
    .eq('id', report.user_id)
    .maybeSingle();

  if (!user?.email) {
    return errorPage('Unauthorized', 'This report could not be verified.', 401);
  }

  if (!verifyReportToken(reportId, user.email, token)) {
    return errorPage('Unauthorized', 'This access token is invalid.', 401);
  }

  if (report.delivery_status !== 'delivered' && !report.delivered_at) {
    await supabase
      .from('maasik_reports')
      .update({ delivery_status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', reportId)
      .is('delivered_at', null);
  }

  const html = injectDownloadButton(report.report_html);
  return new Response(html, { status: 200, headers: COMMON_HEADERS });
}
