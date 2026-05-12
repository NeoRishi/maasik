import { Resend } from 'resend';

let cachedResend: Resend | null = null;

function getResend(): Resend {
  if (cachedResend) return cachedResend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  cachedResend = new Resend(key);
  return cachedResend;
}

export interface EmailReportArgs {
  to: string;
  firstName: string;
  vedicMonth: string;
  ritu: string;
  issueNumber: number;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

/**
 * Sends the MAASIK monthly report email with the PDF attached.
 * Returns the Resend message ID on success, throws on failure.
 */
export async function sendReportEmail(args: EmailReportArgs): Promise<string> {
  const resend = getResend();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@neorishi.io';
  const fromName = process.env.RESEND_FROM_NAME || 'MAASIK by NeoRishi';
  const replyTo = process.env.RESEND_REPLY_TO || fromEmail;

  const subject = `Your ${args.vedicMonth} Blueprint is here, ${args.firstName}`;
  const html = buildReportEmailHtml(args);
  const text = buildReportEmailText(args);

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: args.to,
    replyTo: replyTo,
    subject,
    html,
    text,
    attachments: [
      {
        filename: args.pdfFilename,
        content: args.pdfBuffer,
      },
    ],
    tags: [
      { name: 'product', value: 'maasik' },
      { name: 'type', value: 'monthly_report' },
      { name: 'vedic_month', value: args.vedicMonth.toLowerCase() },
    ],
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data?.id || '';
}

export interface EmailWelcomeArgs {
  to: string;
  firstName: string;
}

export async function sendWelcomeEmail(args: EmailWelcomeArgs): Promise<string> {
  const resend = getResend();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@neorishi.io';
  const fromName = process.env.RESEND_FROM_NAME || 'MAASIK by NeoRishi';

  const subject = `Welcome to MAASIK, ${args.firstName}`;
  const html = buildWelcomeEmailHtml(args);

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: args.to,
    subject,
    html,
    tags: [
      { name: 'product', value: 'maasik' },
      { name: 'type', value: 'welcome' },
    ],
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data?.id || '';
}

export interface EmailFailureArgs {
  userEmail: string;
  userId: string;
  reportId: string;
  reason: string;
}

/**
 * Internal alert email for the operations inbox when a report fails.
 */
export async function sendInternalFailureAlert(args: EmailFailureArgs): Promise<void> {
  const resend = getResend();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@neorishi.io';

  await resend.emails.send({
    from: `MAASIK Ops <${fromEmail}>`,
    to: 'contact@neorishi.io',
    subject: `[MAASIK] Report generation failed`,
    html: `<p>Report ${args.reportId} for user ${args.userId} (${args.userEmail}) failed.</p><p>Reason: ${args.reason}</p>`,
  });
}

// ============================================================================
// EMAIL TEMPLATES (HTML and plain text)
// ============================================================================

function buildReportEmailHtml(args: EmailReportArgs): string {
  const { firstName, vedicMonth, ritu, issueNumber } = args;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Your ${vedicMonth} Blueprint</title></head>
<body style="margin:0;padding:0;background:#FAF3E7;font-family:Georgia,serif;color:#2D2A26;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF3E7;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FAF3E7;">
      <tr><td style="padding:20px 30px;border-bottom:1px solid #d9c9a7;">
        <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#C84B31;">MAASIK &nbsp;|&nbsp; NeoRishi</div>
      </td></tr>

      <tr><td style="padding:48px 30px 24px 30px;">
        <h1 style="font-family:Georgia,serif;font-size:36px;line-height:1.1;margin:0 0 12px 0;color:#2D2A26;font-weight:normal;">${vedicMonth}</h1>
        <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#7A2818;margin:0 0 32px 0;">Your nutrition blueprint for ${ritu}</p>

        <p style="font-size:15px;line-height:1.6;color:#2D2A26;margin:0 0 16px 0;">${firstName},</p>

        <p style="font-size:15px;line-height:1.6;color:#2D2A26;margin:0 0 16px 0;">
          Issue ${String(issueNumber).padStart(2, '0')} of your MAASIK blueprint is attached. Four pages, calibrated to your constitution, your goals, and the current Vedic month.
        </p>

        <p style="font-size:15px;line-height:1.6;color:#2D2A26;margin:0 0 24px 0;">
          This month's report covers what to eat, what to avoid, your ideal daily meal schedule, a complete grocery list, and the routine that anchors all of it. Open the PDF when you have a quiet five minutes. Then print it, stick it on your refrigerator, and live by it for the next 14 to 30 days.
        </p>

        <div style="background:#f3e9d4;border-left:3px solid #C84B31;padding:16px 20px;margin:24px 0;">
          <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#4a3f31;margin:0;line-height:1.5;">
            One ritual that helps: read the report once on the morning of delivery, then keep it accessible through the month. Most subscribers reread it during week two when they need a reminder of the path.
          </p>
        </div>

        <p style="font-size:14px;line-height:1.6;color:#8a7d6a;margin:24px 0 0 0;">
          Your next blueprint arrives on the next Shukla Pratipada. Reply to this email if anything in the report needs adjusting, or if you have questions about a specific food or routine.
        </p>
      </td></tr>

      <tr><td style="padding:24px 30px;border-top:1px solid #d9c9a7;text-align:center;">
        <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#8a7d6a;margin:0 0 8px 0;">सर्वे भवन्तु सुखिनः</p>
        <p style="font-family:Georgia,serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8a7d6a;margin:0;">May all be healthy</p>
      </td></tr>

      <tr><td style="padding:16px 30px;text-align:center;font-size:11px;color:#8a7d6a;">
        <p style="margin:0;">MAASIK is a NeoRishi product. Reply to this email to reach us.</p>
        <p style="margin:8px 0 0 0;">© 2026 NeoRishi</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildReportEmailText(args: EmailReportArgs): string {
  return `${args.firstName},

Issue ${String(args.issueNumber).padStart(2, '0')} of your MAASIK blueprint is attached.

This is your ${args.vedicMonth} nutrition guide, four pages calibrated to your constitution, your goals, and the current Vedic month. Open the PDF when you have a quiet five minutes. Then print it, stick it on your refrigerator, and live by it for the next 14 to 30 days.

Your next blueprint arrives on the next Shukla Pratipada. Reply to this email if anything in the report needs adjusting.

MAASIK by NeoRishi`;
}

function buildWelcomeEmailHtml(args: EmailWelcomeArgs): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF3E7;font-family:Georgia,serif;color:#2D2A26;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF3E7;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="padding:20px 30px;border-bottom:1px solid #d9c9a7;">
        <div style="font-family:Georgia,serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#C84B31;">MAASIK &nbsp;|&nbsp; NeoRishi</div>
      </td></tr>
      <tr><td style="padding:48px 30px;">
        <h1 style="font-family:Georgia,serif;font-size:32px;color:#2D2A26;margin:0 0 16px 0;font-weight:normal;">Welcome, ${args.firstName}.</h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Your subscription is active. Your first blueprint is being generated now and will arrive in your inbox within 30 minutes.</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">From now on, a fresh four-page blueprint will arrive every Shukla Pratipada (the first day of each Vedic lunar month), calibrated to your profile and that month's Ritu.</p>
        <p style="font-size:14px;color:#8a7d6a;margin:24px 0 0 0;">Reply to this email any time. We read everything.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
