import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';

export const runtime = 'nodejs';

/**
 * GET /api/report-status?payment_id=<razorpay_payment_id>
 *
 * Used by /payment-success to poll the generation pipeline so the user sees
 * progress instead of relying solely on email. No auth: the Razorpay payment
 * id is unguessable and the response carries no PII (status, pdf url, month,
 * edition number).
 *
 * States:
 *   - { status: 'pending' }     -> payment recorded but no report row yet
 *   - { status: 'generating' }  -> Claude generation in flight
 *   - { status: 'sent' | 'delivered' | 'opened', pdf_url, vedic_month, edition_number } -> ready
 *   - { status: 'failed' }      -> generation failed; ops alerted
 *   - { status: 'unknown' }     -> payment id not found
 */
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id');
  if (!paymentId) {
    return NextResponse.json({ error: 'payment_id required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: payment } = await supabase
    .from('maasik_payments')
    .select('user_id')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle();

  if (!payment?.user_id) {
    return NextResponse.json({ status: 'unknown' });
  }

  const { data: report } = await supabase
    .from('maasik_reports')
    .select('delivery_status, report_pdf_url, vedic_month, edition_number, generated_at')
    .eq('user_id', payment.user_id)
    .order('generated_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({ status: 'pending' });
  }

  return NextResponse.json({
    status: report.delivery_status,
    pdf_url: report.report_pdf_url,
    vedic_month: report.vedic_month,
    edition_number: report.edition_number,
  });
}
