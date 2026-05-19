import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { createOrder } from '@/lib/maasik/razorpay';
import { OnboardingSchema } from '@/app/onboarding/_lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 30;

function deriveRegion(city: string | null | undefined): string | null {
  if (!city) return null;
  const c = String(city).toLowerCase();
  if (['delhi', 'lucknow', 'jaipur', 'chandigarh', 'kanpur', 'amritsar', 'agra'].some((x) => c.includes(x))) {
    return 'North India';
  }
  if (['mumbai', 'pune', 'ahmedabad', 'goa', 'surat', 'nagpur', 'nashik', 'thane'].some((x) => c.includes(x))) {
    return 'West India';
  }
  if (['bangalore', 'bengaluru', 'chennai', 'hyderabad', 'kochi', 'mysore', 'coimbatore', 'madurai'].some((x) =>
    c.includes(x),
  )) {
    return 'South India';
  }
  if (['kolkata', 'bhubaneswar', 'patna', 'guwahati', 'ranchi', 'siliguri'].some((x) => c.includes(x))) {
    return 'East India';
  }
  if (['bhopal', 'raipur', 'indore', 'jabalpur'].some((x) => c.includes(x))) {
    return 'Central India';
  }
  if (['nanded', 'aurangabad', 'kolhapur', 'solapur'].some((x) => c.includes(x))) {
    return 'West India';
  }
  return null;
}

function toTimeWithSeconds(t: string): string {
  // "HH:MM" → "HH:MM:00" to match Supabase TIME columns
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
    }

    // Validate strictly against the Zod schema
    const parsed = OnboardingSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issues = parsed.error.issues.slice(0, 5).map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return NextResponse.json(
        { ok: false, error: 'Validation failed', issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const otherFields = {
      primary_goal_other:
        typeof (rawBody as Record<string, unknown>).primary_goal_other === 'string'
          ? ((rawBody as Record<string, unknown>).primary_goal_other as string)
          : null,
      gender_other: typeof (rawBody as Record<string, unknown>).gender_other === 'string'
        ? ((rawBody as Record<string, unknown>).gender_other as string)
        : null,
      medical_conditions_other:
        typeof (rawBody as Record<string, unknown>).medical_conditions_other === 'string'
          ? ((rawBody as Record<string, unknown>).medical_conditions_other as string)
          : null,
      allergies_other:
        typeof (rawBody as Record<string, unknown>).allergies_other === 'string'
          ? ((rawBody as Record<string, unknown>).allergies_other as string)
          : null,
    };

    const supabase = getSupabaseAdmin();

    const profile: Record<string, unknown> = {
      full_name: data.full_name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      gender_other: otherFields.gender_other,
      city: data.city,
      region: deriveRegion(data.city),
      country: 'India',

      height_cm: data.height_cm,
      weight_kg: data.weight_kg,

      // Q1 is multi-select; keep the scalar column populated with the first pick
      // and the array column with the full list for downstream helpers.
      // primary_goal_other is not stored on the profile (no column); it lives in events.event_data below.
      primary_goal: data.primary_goal[0],
      primary_goals: data.primary_goal,
      success_vision: data.success_vision,
      expectations: data.success_vision,

      prakriti_q_build: data.prakriti_q_build,
      prakriti_q_skin: data.prakriti_q_skin,
      prakriti_q_digestion: data.prakriti_q_digestion,
      prakriti_q_sleep: data.prakriti_q_sleep,
      prakriti_q_energy: data.prakriti_q_energy,
      prakriti_q_mind: data.prakriti_q_mind,
      prakriti_q_bowels: data.prakriti_q_bowels,

      medical_conditions: data.medical_conditions,
      medical_conditions_other: otherFields.medical_conditions_other,
      allergies: data.allergies,
      allergies_other: otherFields.allergies_other,
      activity_level: data.activity_level,

      sleep_time: toTimeWithSeconds(data.sleep_time),
      wake_time: toTimeWithSeconds(data.wake_time),
      work_life: data.work_life,
      meal_pattern: data.meal_pattern,

      diet_type: data.diet_type,
      favorite_foods: data.favorite_foods ?? null,
      disliked_foods: data.disliked_foods ?? null,

      subscription_status: 'pending',
      onboarding_completed_at: new Date().toISOString(),
    };

    // 1. Upsert user (by email)
    const { data: user, error: upsertError } = await supabase
      .from('maasik_users')
      .upsert(profile, { onConflict: 'email' })
      .select()
      .single();

    if (upsertError || !user) {
      console.error('Onboarding upsert error:', upsertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save user', details: upsertError?.message },
        { status: 500 },
      );
    }

    // 2. Compute Prakriti scores
    const { error: rpcError } = await supabase.rpc('maasik_compute_prakriti', {
      user_id_input: user.id,
    });
    if (rpcError) {
      console.error('Prakriti RPC error (non-fatal):', rpcError);
    }

    // 3. Log event
    await supabase.from('maasik_events').insert({
      user_id: user.id,
      email: user.email,
      event_type: 'form_submitted',
      event_source: 'onboarding_webui',
      event_data: {
        primary_goal: data.primary_goal[0],
        primary_goals: data.primary_goal,
        primary_goal_other: otherFields.primary_goal_other,
        phone: data.phone,
        activity_level: data.activity_level,
        diet_type: data.diet_type,
      },
    });

    // 4. Create Razorpay Order for inline Checkout
    try {
      const order = await createOrder({
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        amount_inr: 99,
      });

      await supabase.from('maasik_events').insert({
        user_id: user.id,
        email: user.email,
        event_type: 'order_created',
        event_source: 'onboarding_webui',
        event_data: {
          order_id: order.order_id,
          amount_inr: 99,
          currency: order.currency,
        },
      });

      return NextResponse.json({
        ok: true,
        user_id: user.id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        key_id: order.key_id,
      });
    } catch (err) {
      console.error('Failed to create Razorpay Order:', err);
      return NextResponse.json(
        {
          ok: false,
          error: 'Payment is temporarily unavailable. Please try again in a moment.',
          user_id: user.id,
        },
        { status: 502 },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('onboarding-submit error:', err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
