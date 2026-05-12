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
          // Payment type bucketing assumes V1 pricing: 99/499/4999. Update when pricing changes.
          payment_type: amountInr === 99 ? 'first_month' : amountInr === 499 ? 'monthly_renewal' : amountInr === 4999 ? 'annual' : 'one_time',
          raw_webhook_payload: payload,
          webhook_received_at: new Date().toISOString(),
        },
        { onConflict: 'razorpay_payment_id' }
      );

      // 2. Update user subscription status
      if (userId) {
        // Read first_report_sent_at BEFORE updating so we can tell a true first-ever payment
        // from a renewal. Otherwise the post-update timestamp comparison falsely fires the
        // welcome email on every monthly/annual renewal.
        const { data: existingUser } = await supabase
          .from('maasik_users')
          .select('first_report_sent_at')
          .eq('id', userId)
          .single();
        const isFirstEverPayment = !existingUser?.first_report_sent_at;

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

        // 4. Send welcome email only on the user's first-ever payment.
        if (user && isFirstEverPayment) {
          sendWelcomeEmail({
            to: user.email,
            firstName: user.full_name.split(' ')[0],
          }).catch(err => console.error('Welcome email failed:', err));
        }

        // 5. Trigger report generation (fire and forget). Runs for both first payment and renewals.
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
