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
