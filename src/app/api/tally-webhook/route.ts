import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { createPaymentLink } from '@/lib/maasik/razorpay';
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

    // 6. Create a fresh Razorpay Payment Link with user_id baked into notes
    let paymentUrl: string;
    try {
      paymentUrl = await createPaymentLink({
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        amount_inr: 99,
        description: 'MAASIK first month, your personalised Vedic nutrition blueprint',
        expires_in_days: 7,
      });

      // Log the payment link in maasik_events for audit
      await supabase.from('maasik_events').insert({
        user_id: user.id,
        email: user.email,
        event_type: 'payment_link_created',
        event_source: 'tally-webhook',
        event_data: { payment_url: paymentUrl, amount_inr: 99 },
      });
    } catch (err: any) {
      console.error('Failed to create Razorpay Payment Link:', err);
      // Fallback to the static link if API call fails
      paymentUrl = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_URL || '';
    }

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

function parseTallyFields(fields: TallyField[]): any {
  // Helper: find a field by exact label match (case-insensitive substring)
  const get = (labelContains: string): any => {
    const f = fields.find((x) => x.label.toLowerCase().includes(labelContains.toLowerCase()));
    return f?.value;
  };

  const getMultiSelect = (labelContains: string): string[] => {
    const v = get(labelContains);
    if (Array.isArray(v)) {
      // Tally returns multi-select as array of option labels or option IDs.
      // Map them to our goal codes.
      return v.map(mapGoalCode);
    }
    if (typeof v === 'string') return [mapGoalCode(v)];
    return [];
  };

  const mapGoalCode = (label: string): string => {
    const l = String(label).toLowerCase();
    if (l.includes('lose weight') || l.includes('weight loss')) return 'weight_loss';
    if (l.includes('energy') || l.includes('stamina')) return 'energy';
    if (l.includes('digestion')) return 'digestion';
    if (l.includes('sleep')) return 'sleep';
    if (l.includes('stress')) return 'stress_relief';
    if (l.includes('clarity') || l.includes('focus') || l.includes('mental')) return 'mental_clarity';
    if (l.includes('muscle')) return 'muscle_gain';
    if (l.includes('condition') || l.includes('medical')) return 'medical_support';
    if (l.includes('wellness')) return 'general_wellness';
    return 'other';
  };

  const parsePrakritiAnswer = (labelContains: string): string | null => {
    const v = get(labelContains);
    if (!v) return null;
    const lower = String(v).toLowerCase();
    // Option strings contain "(Vata)", "(Pitta)", "(Kapha)" suffixes
    if (lower.includes('(vata)')) return 'vata';
    if (lower.includes('(pitta)')) return 'pitta';
    if (lower.includes('(kapha)')) return 'kapha';
    // Fallback for free-text or substring matching
    if (lower.includes('vata')) return 'vata';
    if (lower.includes('pitta')) return 'pitta';
    if (lower.includes('kapha')) return 'kapha';
    return null;
  };

  return {
    full_name: get('name') || '',
    email: get('email') || '',
    age: Number(get('age')) || null,
    gender: String(get('gender') || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''),
    city: get('city') || '',
    region: deriveRegion(get('city')),
    country: 'India',

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

    sleep_time: parseTime(get('sleep time')),
    wake_time: parseTime(get('wake')),
    work_type: parseWorkType(get('work type')),
    stress_level: parseStressLevel(get('stress')),
    meal_timing_pattern: parseMealTiming(get('meal timing')),

    diet_type: parseDietType(get('diet')),
    favorite_foods: get('favorite') || null,
    disliked_foods: get('dislike') || null,
    allergies: null,  // we combine medical and allergies into one field
    medical_conditions: get('medical') || null,
    expectations: get('expect') || null,
  };
}

function deriveRegion(city: any): string | null {
  if (!city) return null;
  const c = String(city).toLowerCase();
  if (['delhi', 'lucknow', 'jaipur', 'chandigarh', 'kanpur', 'amritsar', 'agra'].some(x => c.includes(x))) {
    return 'North India';
  }
  if (['mumbai', 'pune', 'ahmedabad', 'goa', 'surat', 'nagpur', 'nashik', 'thane'].some(x => c.includes(x))) {
    return 'West India';
  }
  if (['bangalore', 'bengaluru', 'chennai', 'hyderabad', 'kochi', 'mysore', 'coimbatore', 'madurai'].some(x => c.includes(x))) {
    return 'South India';
  }
  if (['kolkata', 'bhubaneswar', 'patna', 'guwahati', 'ranchi', 'siliguri'].some(x => c.includes(x))) {
    return 'East India';
  }
  if (['bhopal', 'raipur', 'indore', 'jabalpur'].some(x => c.includes(x))) {
    return 'Central India';
  }
  return null;
}

function parseWorkType(s: any): string | null {
  if (!s) return null;
  const str = String(s).toLowerCase();
  if (str.includes('desk') || str.includes('screen') || str.includes('low physical')) return 'sedentary';
  if (str.includes('mixed') || str.includes('some movement')) return 'moderate';
  if (str.includes('physically') || str.includes('on my feet')) return 'active';
  return 'sedentary';
}

function parseMealTiming(s: any): string | null {
  if (!s) return null;
  const str = String(s).toLowerCase();
  if (str.includes('regular') || str.includes('consistent')) return 'regular';
  if (str.includes('skipped') || str.includes('rushed')) return 'rushed';
  if (str.includes('irregular') || str.includes('late')) return 'irregular';
  return 'standard';
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
