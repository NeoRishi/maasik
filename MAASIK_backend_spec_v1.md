# MAASIK V1 — Deliverable E: Backend Serverless Functions
## The complete backend engine

**Date:** 12 May 2026
**Purpose:** Wire up the entire backend so that Tally submission → payment → report generation → email delivery → monthly auto-renewal all work end-to-end.

---

## Document structure

1. New dependencies to install
2. Environment variables to add
3. Supporting modules (Supabase client, Resend wrapper, Doppio wrapper)
4. Route 1: `/api/tally-webhook` (form submission handler)
5. Route 2: `/api/razorpay-webhook` (payment confirmation handler)
6. Route 3: `/api/generate-report` (the heart, Claude → PDF → email)
7. Route 4: `/api/cron-monthly` (daily check for Shukla Pratipada)
8. Vercel configuration (`vercel.json` for cron + function timeouts)
9. The user message builder (the missing piece from D)
10. Email templates (HTML + plain text)
11. Deployment checklist

---

## 1. NEW DEPENDENCIES

Run in your `maasik-app` project root:

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js resend
npm install --save-dev @types/node
```

Verify your `package.json` shows these versions or newer:
- `@anthropic-ai/sdk`: ^0.30.0
- `@supabase/supabase-js`: ^2.45.0
- `resend`: ^4.0.0

---

## 2. ENVIRONMENT VARIABLES

Add to Vercel project settings → Environment Variables (Production + Preview + Development):

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...                    # (already added)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jhkoxgyxrihsuhpjqkxc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...                 # (service role, NOT anon)

# Resend
RESEND_API_KEY=re_...                            # from your existing Resend account
RESEND_FROM_EMAIL=contact@neorishi.io
RESEND_FROM_NAME=MAASIK by NeoRishi
RESEND_REPLY_TO=contact@neorishi.io

# Doppio (HTML to PDF)
DOPPIO_API_KEY=...                               # sign up at doppio.sh

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...                     # from Razorpay dashboard
RAZORPAY_KEY_SECRET=...                          # KEEP SECRET
RAZORPAY_WEBHOOK_SECRET=...                      # set when creating the webhook
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_URL=https://rzp.io/l/...   # from F

# Tally
NEXT_PUBLIC_TALLY_FORM_URL=https://tally.so/r/...
TALLY_WEBHOOK_SECRET=                            # optional, Tally signing secret

# Cron security
CRON_SECRET=                                     # random 32+ char string, used by Vercel cron auth

# App
NEXT_PUBLIC_APP_URL=https://maasik.neorishi.io
```

**To generate `CRON_SECRET`** locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. SUPPORTING MODULES

### 3.1 — `src/lib/maasik/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the service-role key.
 * NEVER expose this client to the browser.
 * Reuse across invocations within the same Vercel container (warm starts).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase env vars not set');
  }

  cachedClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}
```

### 3.2 — `src/lib/maasik/resend.ts`

```typescript
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
```

### 3.3 — `src/lib/maasik/doppio.ts`

```typescript
/**
 * Doppio.sh client for converting HTML to PDF.
 * V1 simple wrapper. Returns a Buffer of the PDF bytes.
 */
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const apiKey = process.env.DOPPIO_API_KEY;
  if (!apiKey) throw new Error('DOPPIO_API_KEY not set');

  const response = await fetch('https://api.doppio.sh/v1/render/pdf/direct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        setContent: { html, waitUntil: 'networkidle0' },
      },
      pdf: {
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        preferCSSPageSize: true,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Doppio failed: ${response.status} ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

### 3.4 — `src/lib/maasik/anthropic-client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  cached = new Anthropic({ apiKey: key });
  return cached;
}
```

---

## 4. ROUTE 1: `/api/tally-webhook` (Tally form submission handler)

**File:** `src/app/api/tally-webhook/route.ts`

**What it does:**
- Receives Tally's webhook POST when a user submits the onboarding form
- Validates the payload signature (if Tally signing secret is configured)
- Parses the field values into a structured user profile
- Computes the Prakriti scores using the SQL helper function
- Inserts/upserts into `maasik_users`
- Logs an event to `maasik_events`
- Returns a JSON response containing the Razorpay payment URL with `prefill` parameters and the `user_id` in `notes`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface TallyField {
  key: string;
  label: string;
  type: string;
  value: any;
}

interface TallyPayload {
  eventId: string;
  eventType: string;
  createdAt: string;
  formId: string;
  responseId: string;
  data: {
    fields: TallyField[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Optional signature verification (Tally signing secret)
    const tallySecret = process.env.TALLY_WEBHOOK_SECRET;
    if (tallySecret) {
      const signature = req.headers.get('tally-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const expected = crypto
        .createHmac('sha256', tallySecret)
        .update(rawBody)
        .digest('base64');
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: TallyPayload = JSON.parse(rawBody);

    if (payload.eventType !== 'FORM_RESPONSE') {
      return NextResponse.json({ ok: true, ignored: payload.eventType });
    }

    // 2. Parse Tally fields into our schema
    const profile = parseTallyFields(payload.data.fields);

    if (!profile.email) {
      return NextResponse.json({ error: 'Email missing' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 3. Upsert user
    const { data: user, error: upsertError } = await supabase
      .from('maasik_users')
      .upsert(
        {
          ...profile,
          subscription_status: 'pending',
          onboarding_completed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (upsertError || !user) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to save user', details: upsertError }, { status: 500 });
    }

    // 4. Compute Prakriti scores via SQL function
    await supabase.rpc('maasik_compute_prakriti', { user_id_input: user.id });

    // 5. Log event
    await supabase.from('maasik_events').insert({
      user_id: user.id,
      email: user.email,
      event_type: 'form_submitted',
      event_source: 'tally',
      event_data: { tally_response_id: payload.responseId, form_id: payload.formId },
    });

    // 6. Build the Razorpay payment URL with prefill
    const razorpayBaseUrl = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_URL;
    const paymentUrl = `${razorpayBaseUrl}?prefill[email]=${encodeURIComponent(user.email)}&prefill[name]=${encodeURIComponent(user.full_name)}&notes[user_id]=${user.id}`;

    return NextResponse.json({
      ok: true,
      user_id: user.id,
      payment_url: paymentUrl,
    });

  } catch (err: any) {
    console.error('Tally webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Parses Tally's `fields` array into our maasik_users schema.
 *
 * IMPORTANT: The exact field labels and types depend on how the Tally form
 * is built. The labels below are placeholders. After Deliverable B is built,
 * you will receive the exact mapping. For now, this uses label-matching as
 * a robust fallback.
 */
function parseTallyFields(fields: TallyField[]): any {
  const get = (labelContains: string): any => {
    const f = fields.find((x) => x.label.toLowerCase().includes(labelContains.toLowerCase()));
    return f?.value;
  };

  const getMultiSelect = (labelContains: string): string[] => {
    const v = get(labelContains);
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === 'string') return [v];
    return [];
  };

  // Prakriti question parser: maps the chosen option to a dosha code
  const parsePrakritiAnswer = (labelContains: string): string | null => {
    const v = get(labelContains);
    if (!v) return null;
    const lower = String(v).toLowerCase();
    if (lower.includes('vata-pitta') || lower.includes('vata pitta')) return 'vata_pitta';
    if (lower.includes('pitta-kapha') || lower.includes('pitta kapha')) return 'pitta_kapha';
    if (lower.includes('vata-kapha') || lower.includes('vata kapha')) return 'vata_kapha';
    if (lower.includes('vata')) return 'vata';
    if (lower.includes('pitta')) return 'pitta';
    if (lower.includes('kapha')) return 'kapha';
    return null;
  };

  return {
    full_name: get('name') || '',
    email: get('email') || '',
    age: Number(get('age')) || null,
    gender: String(get('gender') || '').toLowerCase().replace(/\s+/g, '_'),
    city: get('city') || '',
    region: get('region') || null,
    country: get('country') || 'India',

    height_cm: Number(get('height')) || null,
    weight_kg: Number(get('weight')) || null,

    primary_goals: getMultiSelect('goal'),
    goal_specifics: get('specific') || null,

    prakriti_q_build: parsePrakritiAnswer('body frame'),
    prakriti_q_skin: parsePrakritiAnswer('skin'),
    prakriti_q_digestion: parsePrakritiAnswer('digestion'),
    prakriti_q_sleep: parsePrakritiAnswer('sleep pattern'),
    prakriti_q_energy: parsePrakritiAnswer('energy'),
    prakriti_q_mind: parsePrakritiAnswer('mind'),
    prakriti_q_bowels: parsePrakritiAnswer('bowel'),

    sleep_time: parseTime(get('sleep time') || get('go to sleep')),
    wake_time: parseTime(get('wake')),
    work_type: get('work type') || null,
    stress_level: parseStressLevel(get('stress')),
    meal_timing_pattern: get('meal timing') || null,

    diet_type: parseDietType(get('diet')),
    favorite_foods: get('favorite') || null,
    disliked_foods: get('dislike') || null,
    allergies: get('allerg') || null,
    medical_conditions: get('medical') || null,
    expectations: get('expect') || null,
  };
}

function parseTime(s: any): string | null {
  if (!s) return null;
  const str = String(s).trim();
  // Accepts "HH:MM" or "HH:MM AM/PM"
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function parseStressLevel(s: any): string {
  if (!s) return 'moderate';
  const str = String(s).toLowerCase();
  if (str.includes('very high')) return 'very_high';
  if (str.includes('high')) return 'high';
  if (str.includes('low')) return 'low';
  if (str.includes('var')) return 'varies';
  return 'moderate';
}

function parseDietType(s: any): string {
  if (!s) return 'unspecified';
  const str = String(s).toLowerCase();
  if (str.includes('vegan')) return 'vegan';
  if (str.includes('eggetarian') || str.includes('egg')) return 'eggetarian';
  if (str.includes('non-veg') || str.includes('non veg')) return 'non_vegetarian';
  if (str.includes('veg')) return 'vegetarian';
  return 'unspecified';
}
```

---

## 5. ROUTE 2: `/api/razorpay-webhook` (Payment confirmation handler)

**File:** `src/app/api/razorpay-webhook/route.ts`

**What it does:**
- Receives Razorpay webhook on `payment.captured` event
- Verifies the HMAC-SHA256 signature using the webhook secret
- Inserts into `maasik_payments`
- Updates the user's `subscription_status` to `active`
- Triggers the first report generation immediately
- Sends a welcome email

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { sendWelcomeEmail } from '@/lib/maasik/resend';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    const supabase = getSupabaseAdmin();

    if (eventType === 'payment.captured' || eventType === 'payment_link.paid') {
      const payment = payload.payload?.payment?.entity || payload.payload?.payment_link?.entity;

      if (!payment) {
        return NextResponse.json({ error: 'No payment data' }, { status: 400 });
      }

      const userId = payment.notes?.user_id || payload.payload?.payment_link?.entity?.notes?.user_id;
      const customerEmail = payment.email || payload.payload?.payment_link?.entity?.customer?.email;
      const amountInr = (payment.amount || 0) / 100; // Razorpay uses paise

      // 1. Record the payment
      await supabase.from('maasik_payments').upsert(
        {
          user_id: userId || null,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          razorpay_payment_link_id: payment.payment_link_id || payload.payload?.payment_link?.entity?.id,
          amount_inr: amountInr,
          currency: payment.currency || 'INR',
          status: 'captured',
          customer_email: customerEmail,
          customer_phone: payment.contact,
          payment_type: amountInr === 99 ? 'first_month' : amountInr === 499 ? 'monthly_renewal' : amountInr === 4999 ? 'annual' : 'one_time',
          raw_webhook_payload: payload,
          webhook_received_at: new Date().toISOString(),
        },
        { onConflict: 'razorpay_payment_id' }
      );

      // 2. Update user subscription status
      if (userId) {
        const now = new Date();
        const periodEnd = new Date(now);
        if (amountInr === 4999) {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        const { data: user } = await supabase
          .from('maasik_users')
          .update({
            subscription_status: 'active',
            first_payment_at: now.toISOString(),
            current_period_start: now.toISOString().split('T')[0],
            current_period_end: periodEnd.toISOString().split('T')[0],
            razorpay_payment_id: payment.id,
          })
          .eq('id', userId)
          .select()
          .single();

        // 3. Log event
        await supabase.from('maasik_events').insert({
          user_id: userId,
          email: customerEmail,
          event_type: 'payment_completed',
          event_source: 'razorpay',
          event_data: { amount_inr: amountInr, payment_id: payment.id },
        });

        // 4. Send welcome email (fire and forget, do not block webhook response)
        if (user && user.first_payment_at === now.toISOString()) {
          sendWelcomeEmail({
            to: user.email,
            firstName: user.full_name.split(' ')[0],
          }).catch(err => console.error('Welcome email failed:', err));
        }

        // 5. Trigger the first report generation (fire and forget)
        triggerReportGeneration(userId).catch(err =>
          console.error('Report trigger failed:', err)
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Other event types: just acknowledge
    return NextResponse.json({ ok: true, event: eventType });

  } catch (err: any) {
    console.error('Razorpay webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Fires an internal HTTP POST to /api/generate-report for this user.
 * Uses the CRON_SECRET as auth.
 */
async function triggerReportGeneration(userId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maasik.neorishi.io';
  await fetch(`${baseUrl}/api/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.CRON_SECRET || '',
    },
    body: JSON.stringify({ user_id: userId }),
  });
}
```

---

## 6. ROUTE 3: `/api/generate-report` (the engine)

**File:** `src/app/api/generate-report/route.ts`

This is the full version of what was sketched in Deliverable D, now with PDF generation and email delivery wired in.

```typescript
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
```

---

## 7. ROUTE 4: `/api/cron-monthly` (daily Shukla Pratipada check)

**File:** `src/app/api/cron-monthly/route.ts`

**What it does:**
- Runs daily at 01:30 UTC (07:00 IST)
- Queries the `maasik_v_users_due_today` view (returns active users whose Shukla Pratipada is today and who have not yet received this month's report)
- On 364 days a year returns zero rows and does nothing
- On 1 day per Vedic month, fires `/api/generate-report` for each user in parallel

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300;  // 5 min budget for the whole batch

export async function GET(req: NextRequest) {
  try {
    // Verify Vercel cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Find users due today
    const { data: usersDue, error } = await supabase
      .from('maasik_v_users_due_today')
      .select('*');

    if (error) {
      console.error('View query failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!usersDue || usersDue.length === 0) {
      return NextResponse.json({ ok: true, due_count: 0, message: 'No users due today' });
    }

    // Fire generation for each user (parallel, but capped to avoid Doppio rate limits)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maasik.neorishi.io';
    const results: any[] = [];

    // Process in batches of 5
    for (let i = 0; i < usersDue.length; i += 5) {
      const batch = usersDue.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map(async (u: any) => {
          const res = await fetch(`${baseUrl}/api/generate-report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.CRON_SECRET || '',
            },
            body: JSON.stringify({ user_id: u.user_id }),
          });
          const data = await res.json();
          return { user_id: u.user_id, status: res.status, data };
        })
      );
      results.push(...batchResults.map((r, idx) => ({
        user_id: batch[idx].user_id,
        ...(r.status === 'fulfilled' ? r.value : { error: (r as PromiseRejectedResult).reason }),
      })));
    }

    return NextResponse.json({
      ok: true,
      due_count: usersDue.length,
      results,
    });

  } catch (err: any) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## 8. VERCEL CONFIGURATION

**File:** `vercel.json` (project root)

```json
{
  "crons": [
    {
      "path": "/api/cron-monthly",
      "schedule": "30 1 * * *"
    }
  ],
  "functions": {
    "src/app/api/generate-report/route.ts": {
      "maxDuration": 120
    },
    "src/app/api/cron-monthly/route.ts": {
      "maxDuration": 300
    },
    "src/app/api/tally-webhook/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/razorpay-webhook/route.ts": {
      "maxDuration": 30
    }
  }
}
```

Cron expression `30 1 * * *` = "every day at 01:30 UTC" = 07:00 IST.

---

## 9. DEPLOYMENT CHECKLIST

After all files are in place, deploy by pushing to GitHub. Vercel auto-deploys.

**Post-deploy verification (do every one of these before announcing to anyone):**

### Test 1: Health check
- Visit `https://maasik.neorishi.io/api/cron-monthly` in browser
- Expected: 401 Unauthorized (because no auth header). Confirms the route exists.

### Test 2: Manual report generation
```bash
curl -X POST https://maasik.neorishi.io/api/generate-report \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: <your CRON_SECRET>" \
  -d '{"user_id": "<your test user id from Supabase>"}'
```
Expected: 200 OK with `{ok: true, report_id, duration_ms, resend_message_id}` within 90 seconds. PDF arrives in `contact@neorishi.io` mailbox (or wherever the test user's email is).

### Test 3: Razorpay webhook signature
Create a test payment in Razorpay's test mode, with `notes: {user_id: "<test_user_id>"}`. Razorpay will fire the webhook. Check `maasik_payments` for the row, and `maasik_users.subscription_status` for `active`.

### Test 4: End-to-end
1. Open `https://maasik.neorishi.io`
2. Click "Get Your Blueprint"
3. Fill the Tally form completely
4. Submit
5. Pay ₹99 in Razorpay test mode
6. Within 2 minutes, the report email arrives
7. Open the PDF, verify it matches the Jyeshtha PDF quality

### Test 5: Cron simulation
```bash
curl https://maasik.neorishi.io/api/cron-monthly \
  -H "Authorization: Bearer <your CRON_SECRET>"
```
Expected: 200 OK with `{ok: true, due_count: 0, message: 'No users due today'}` if today is not Shukla Pratipada.

---

## 10. FILE INVENTORY

After E is complete, your `src/` directory adds these 8 files:

```
src/
├── app/
│   └── api/
│       ├── tally-webhook/route.ts
│       ├── razorpay-webhook/route.ts
│       ├── generate-report/route.ts
│       └── cron-monthly/route.ts
└── lib/
    └── maasik/
        ├── system-prompt.ts        (from D)
        ├── html-template.ts        (from D)
        ├── helpers.ts              (from D, expanded)
        ├── supabase.ts             (new)
        ├── resend.ts               (new)
        ├── doppio.ts               (new)
        └── anthropic-client.ts     (new)

vercel.json                          (new, root)
```

---

## 11. SECURITY NOTES

1. **`SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in any client-side code.** It's only in serverless functions. Vercel's env var system handles this automatically as long as you don't prefix it with `NEXT_PUBLIC_`.

2. **Webhook signatures are verified on every request.** Razorpay's HMAC-SHA256 and Tally's optional HMAC.

3. **The `/api/generate-report` endpoint is internal-only**, authenticated by `CRON_SECRET`. The Razorpay webhook and the cron both pass this header. Direct browser access returns 401.

4. **PDFs are private in Supabase Storage.** We generate signed URLs valid for 30 days. Even if the URL leaks, it expires.

5. **Rate limiting is not implemented in V1.** For V1.1, add a per-user rate limit on `/api/generate-report` so a compromised CRON_SECRET cannot mass-generate reports.

---

## 12. WHAT I OWE YOU NEXT

E completes the backend. To go live, the only remaining pieces are:

- **F: Razorpay setup checklist** — exact steps to create the payment link, configure the webhook, get the keys
- **B: Tally form spec** — exactly which fields to create in Tally with which labels (the parser in Route 1 expects specific label keywords)

Both are mostly "click and configure" tasks, no code. **Recommended next: F**, because the Razorpay payment link URL is needed in your Vercel env vars before E can be tested end-to-end.

Confirm "proceed to F" and I will build it.
