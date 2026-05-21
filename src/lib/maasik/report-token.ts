import { createHash, timingSafeEqual } from 'crypto';

/**
 * Generates a deterministic, unguessable token for a private report URL.
 * Format: hex-encoded SHA-256(report_id + user_email + MAASIK_REPORT_SECRET).
 *
 * The same inputs always produce the same token, so it can either be stored
 * in maasik_reports.access_token at generation time or recomputed at request
 * time. Email is lower-cased and trimmed so casing variations don't break
 * verification.
 */
export function getReportToken(reportId: string, userEmail: string): string {
  const secret = process.env.MAASIK_REPORT_SECRET;
  if (!secret) throw new Error('MAASIK_REPORT_SECRET not set');

  const normalisedEmail = userEmail.trim().toLowerCase();
  return createHash('sha256')
    .update(`${reportId}:${normalisedEmail}:${secret}`)
    .digest('hex');
}

/**
 * Constant-time comparison so token verification isn't vulnerable to
 * timing side-channels.
 */
export function verifyReportToken(
  reportId: string,
  userEmail: string,
  providedToken: string,
): boolean {
  const expected = getReportToken(reportId, userEmail);
  if (providedToken.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(providedToken));
  } catch {
    return false;
  }
}
