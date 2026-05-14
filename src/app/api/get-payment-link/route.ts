import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { createPaymentLink } from '@/lib/maasik/razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from('maasik_users')
      .select('id, full_name, email, subscription_status')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found, please complete the form first' }, { status: 404 });
    }

    // Generate a fresh payment link
    const payment_url = await createPaymentLink({
      user_id: user.id,
      email: user.email,
      name: user.full_name,
      amount_inr: 99,
      description: 'MAASIK first month, your personalised Vedic nutrition blueprint',
      expires_in_days: 7,
    });

    return NextResponse.json({ payment_url });

  } catch (err: any) {
    console.error('get-payment-link error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
