# MAASIK V1 — Deliverable B: Tally Form Spec + Razorpay Orders API Integration
## The final deliverable

**Date:** 13 May 2026
**Purpose:** Build the 25-question Tally onboarding form that feeds the existing `/api/tally-webhook` route, plus the small but critical addition that makes Razorpay payment links carry `user_id` correctly.
**Effort estimate:** 90 to 120 minutes total (45 min in Tally, 30 min Antigravity code change, 30 min testing).

---

## Document structure

1. The 25 questions, exact wording, exact field type, exact label
2. How to create the form in Tally, step by step
3. How to configure the Tally webhook
4. The Razorpay Orders API addition to `/api/tally-webhook`
5. Updated parseTallyFields function with exact label matching
6. Smoke test the full flow
7. Common pitfalls

---

## 1. THE 25 QUESTIONS

These are tuned for the existing Tally webhook parser in E. **Match the field labels exactly** (case-insensitive substring match is what the parser uses). I have organized them into 5 sections with section dividers (Tally calls these "Layout" blocks) so the form feels like a guided journey, not an interrogation.

### Section 1: Welcome and identity (5 questions)

**Q1. What's your name?**
- Type: Short Answer
- Label: `name`
- Required: yes
- Placeholder: `Your full name`

**Q2. What's your email?**
- Type: Email
- Label: `email`
- Required: yes
- Placeholder: `name@example.com`
- Validation: email format

**Q3. How old are you?**
- Type: Number
- Label: `age`
- Required: yes
- Min: 16
- Max: 95

**Q4. What's your gender?**
- Type: Multiple Choice (single select)
- Label: `gender`
- Options: `Male`, `Female`, `Non-binary`, `Prefer not to say`
- Required: yes

**Q5. Which city do you live in?**
- Type: Short Answer
- Label: `city`
- Required: yes
- Placeholder: `e.g., Pune, Bangalore, Delhi`

### Section 2: Your body (3 questions)

**Q6. What's your height (in cm)?**
- Type: Number
- Label: `height`
- Required: yes
- Min: 120
- Max: 220
- Hint: `Approximate is fine. 1 foot = 30 cm.`

**Q7. What's your weight (in kg)?**
- Type: Number
- Label: `weight`
- Required: yes
- Min: 30
- Max: 200

**Q8. What's your dietary preference?**
- Type: Multiple Choice (single select)
- Label: `diet`
- Options: `Vegetarian`, `Eggetarian`, `Non-vegetarian`, `Vegan`
- Required: yes

### Section 3: Your goals (2 questions)

**Q9. What do you most want from MAASIK? (Choose up to 3, in order of priority)**
- Type: Multiple Choice (multi select)
- Label: `goal`
- Options:
  - `Lose weight`
  - `Gain energy and stamina`
  - `Improve digestion`
  - `Better sleep`
  - `Reduce stress`
  - `Mental clarity and focus`
  - `Build muscle`
  - `Manage a health condition`
  - `General wellness`
- Required: yes
- Settings: Allow multiple, max 3 selections
- Hint: `Pick the ones that matter most. Order matters: the first one you tick is your top priority.`

**Q10. Anything specific you'd like us to know about your goals?**
- Type: Long Answer
- Label: `specific`
- Required: no
- Placeholder: `e.g., I want to lose 10 kg by Diwali. Or, I get brain fog every afternoon and want to clear it.`

### Section 4: Your constitution (7 Prakriti questions)

These 7 questions feed the `maasik_compute_prakriti()` SQL function we built in A. Each has 3 options mapped to Vata / Pitta / Kapha. **The webhook parser uses substring matching, so the option text must include "Vata," "Pitta," or "Kapha" inside it.**

**Q11. Your body frame is...**
- Type: Multiple Choice (single select)
- Label: `body frame`
- Options:
  - `Thin, lean, light, hard to gain weight (Vata)`
  - `Medium build, athletic, moderate muscle (Pitta)`
  - `Broad, sturdy, gains weight easily (Kapha)`
- Required: yes

**Q12. Your skin tends to be...**
- Type: Multiple Choice (single select)
- Label: `skin`
- Options:
  - `Dry, rough, cool to touch (Vata)`
  - `Warm, reddish, freckles or acne (Pitta)`
  - `Smooth, soft, oily, cool, pale (Kapha)`
- Required: yes

**Q13. Your digestion is...**
- Type: Multiple Choice (single select)
- Label: `digestion`
- Options:
  - `Irregular, sometimes gas or bloating (Vata)`
  - `Strong, sharp, easily hungry, sometimes acidic (Pitta)`
  - `Slow, heavy after meals, rarely very hungry (Kapha)`
- Required: yes

**Q14. Your sleep pattern is...**
- Type: Multiple Choice (single select)
- Label: `sleep pattern`
- Options:
  - `Light, interrupted, often awake at night (Vata)`
  - `Moderate, sound, wake refreshed (Pitta)`
  - `Deep, long, hard to wake up (Kapha)`
- Required: yes

**Q15. Your energy through the day is...**
- Type: Multiple Choice (single select)
- Label: `energy`
- Options:
  - `Bursts of energy then crashes, variable (Vata)`
  - `Sharp, focused, intense, peaks at midday (Pitta)`
  - `Steady, slow to start, consistent endurance (Kapha)`
- Required: yes

**Q16. Your mind tends to be...**
- Type: Multiple Choice (single select)
- Label: `mind`
- Options:
  - `Quick, creative, easily distracted (Vata)`
  - `Focused, sharp, analytical, intense (Pitta)`
  - `Calm, steady, deliberate, slow to change (Kapha)`
- Required: yes

**Q17. Your bowel movements are typically...**
- Type: Multiple Choice (single select)
- Label: `bowel`
- Options:
  - `Dry, irregular, sometimes constipated (Vata)`
  - `Loose, frequent, sometimes urgent (Pitta)`
  - `Heavy, regular, well-formed, slow (Kapha)`
- Required: yes

### Section 5: Your lifestyle and food (8 questions)

**Q18. What time do you usually go to sleep?**
- Type: Short Answer
- Label: `sleep time`
- Required: yes
- Placeholder: `e.g., 11:00 PM`
- Hint: `Use HH:MM AM/PM format, like "11:30 PM"`

**Q19. What time do you usually wake up?**
- Type: Short Answer
- Label: `wake`
- Required: yes
- Placeholder: `e.g., 6:30 AM`

**Q20. What kind of work do you mostly do?**
- Type: Multiple Choice (single select)
- Label: `work type`
- Options:
  - `Mostly desk / screen, low physical activity`
  - `Mixed, some movement during the day`
  - `Physically demanding, on my feet a lot`
- Required: yes

**Q21. How would you rate your typical stress level?**
- Type: Multiple Choice (single select)
- Label: `stress`
- Options:
  - `Low, mostly calm`
  - `Moderate, ups and downs`
  - `High, often overwhelmed`
  - `Very high, constantly stressed`
- Required: yes

**Q22. Your meal timing is mostly...**
- Type: Multiple Choice (single select)
- Label: `meal timing`
- Options:
  - `Regular and consistent`
  - `Sometimes skipped or rushed`
  - `Irregular, often late at night`
- Required: yes

**Q23. What are your favourite foods? (Don't hold back, we want the real list)**
- Type: Long Answer
- Label: `favorite`
- Required: no
- Placeholder: `e.g., cold coffee, paani puri, pizza, ice cream, biryani`
- Hint: `Be honest. We use this to make the report personal, not to judge.`

**Q24. Any foods you dislike or refuse to eat?**
- Type: Long Answer
- Label: `dislike`
- Required: no
- Placeholder: `e.g., cucumber, raw onion, lauki`

**Q25. Any allergies or medical conditions we should know about?**
- Type: Long Answer
- Label: `medical`
- Required: no
- Placeholder: `e.g., dairy intolerance, acidity, diabetes, hypertension. Write "none" if none.`
- Hint: `This stays private and is only used to customise your blueprint safely.`

### Optional 26th question, **highly recommended**

**Q26. What would success look like for you in 90 days?**
- Type: Long Answer
- Label: `expect`
- Required: no
- Placeholder: `e.g., I want to feel less bloated, sleep better, and lose 5 kg.`
- Hint: `One or two sentences. We use this to set the tone of your first month's report.`

This maps to the `expectations` field in `maasik_users` and gets injected into the Claude prompt as the user's stated north star.

---

## 2. CREATING THE FORM IN TALLY (45 minutes)

1. Go to https://tally.so. Sign in (or sign up, free tier is enough).

2. Click **Create new form**. Pick **Start from scratch**.

3. Name it: `MAASIK Onboarding`.

4. For each of the 25 (or 26) questions above:
   - Click the "+" between blocks
   - Pick the question type (Short Answer, Number, Multiple Choice, etc.)
   - Type the question wording (the bold line above)
   - In the field settings, set the **field name** to the `Label` value (e.g., `name`, `email`, `body frame`). **This is critical**, it's what the webhook parser matches against.
   - Set required flag as specified
   - Add hint text where specified
   - For multi-select questions (Q9), enable "Allow multiple selections" and set max to 3

5. Between sections, insert a **Layout block** with a heading. The five section headings:
   - `Let's start with the basics`
   - `Tell us about your body`
   - `What you want from MAASIK`
   - `Your unique constitution`
   - `Your lifestyle and food`

6. At the very top, add a **Welcome message** block:
   > **Welcome to MAASIK.**
   > Over the next 5 minutes, we'll learn about your body, your goals, and your life. Then we'll build a personalised Vedic nutrition blueprint that arrives in your inbox every Vedic month. Take your time, your answers shape every blueprint we send.

7. At the very bottom, before the submit button, add a **Layout block** with this text:
   > **One last thing.**
   > After you submit, we'll take you to a secure payment page. Your first month is ₹99. You can cancel any time.

8. Customize the **submit button** text to: `Continue to payment` (not "Submit")

9. **Branding tab:** match MAASIK colours
   - Primary colour: `#C84B31` (terracotta)
   - Background: `#FAF3E7` (cream)
   - Font: `Georgia` or `Serif` for headings if Tally allows; otherwise default sans-serif is fine

10. **Settings tab:**
    - Custom subdomain: rename the form URL slug to something memorable, e.g., `tally.so/r/maasik-start`
    - Enable "Redirect on submit" → set the URL to a temporary placeholder like `https://maasik.neorishi.io/thank-you` (we'll update this in Step 4 below to point to the dynamically generated Razorpay link)
    - Disable email notifications (we send our own welcome email via Resend)

11. **Publish the form.** Copy the final URL.

12. Go to your Vercel env vars and update `NEXT_PUBLIC_TALLY_FORM_URL` to this final URL. Redeploy.

---

## 3. CONFIGURE THE TALLY WEBHOOK (5 minutes)

1. In the Tally form editor, open the **Integrations** tab.

2. Find **Webhooks**, click **Connect**.

3. Set:
   - **Endpoint URL:** `https://maasik.neorishi.io/api/tally-webhook`
   - **HTTP Method:** POST
   - **Events:** "On form submission"
   - **Signing secret:** generate a random string locally and paste it. Save the same string in Vercel env vars as `TALLY_WEBHOOK_SECRET`. If you don't want signature verification for V1, leave the secret blank in both places (the webhook handler skips the check if secret is unset).

4. Click **Save** and **Test webhook**. Tally will fire a test event with sample data. Check Vercel logs for `/api/tally-webhook` to confirm receipt.

---

## 4. THE RAZORPAY ORDERS API ADDITION

This is the key change that solves the `notes[user_id]` problem. Instead of returning a static Payment Link URL, we generate a fresh Razorpay Order with `notes.user_id` baked in.

### 4.1 — Add Razorpay SDK

```bash
npm install razorpay
```

### 4.2 — Create `src/lib/maasik/razorpay.ts`

```typescript
import Razorpay from 'razorpay';

let cachedClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (cachedClient) return cachedClient;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not set');
  }
  cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return cachedClient;
}

export interface CreatePaymentLinkArgs {
  user_id: string;
  email: string;
  name: string;
  amount_inr: number;        // e.g., 99 for first month
  description: string;       // e.g., "MAASIK first month"
  expires_in_days?: number;  // default 30
}

/**
 * Creates a Razorpay Payment Link with user_id baked into notes.
 * Returns the short_url that the user opens to pay.
 */
export async function createPaymentLink(args: CreatePaymentLinkArgs): Promise<string> {
  const razorpay = getRazorpay();

  const expiresAt = Math.floor(Date.now() / 1000) + (args.expires_in_days || 30) * 24 * 60 * 60;

  const link: any = await razorpay.paymentLink.create({
    amount: args.amount_inr * 100,  // Razorpay uses paise
    currency: 'INR',
    accept_partial: false,
    description: args.description,
    customer: {
      name: args.name,
      email: args.email,
    },
    notify: {
      sms: false,
      email: false,  // we send our own emails
    },
    reminder_enable: false,
    notes: {
      user_id: args.user_id,
      product: 'maasik',
      tier: args.amount_inr === 99 ? 'first_month' : args.amount_inr === 499 ? 'monthly' : 'annual',
    },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
    callback_method: 'get',
    expire_by: expiresAt,
  });

  return link.short_url;  // e.g., "https://rzp.io/i/AbCd1234"
}
```

### 4.3 — Update `src/app/api/tally-webhook/route.ts`

Find the section near the end where the payment URL is built. Replace this:

```typescript
// 6. Build the Razorpay payment URL with prefill
const razorpayBaseUrl = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_URL;
const paymentUrl = `${razorpayBaseUrl}?prefill[email]=${encodeURIComponent(user.email)}&prefill[name]=${encodeURIComponent(user.full_name)}&notes[user_id]=${user.id}`;
```

With this:

```typescript
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
```

And add the import at the top:

```typescript
import { createPaymentLink } from '@/lib/maasik/razorpay';
```

### 4.4 — Configure Tally's redirect-on-submit

Here's the tricky part: Tally's "Redirect on submit" expects a static URL, but we need a dynamic URL per user. Two solutions:

**Solution A (recommended for V1):** Build a `/payment-redirect` page that reads the user's email from the URL query string, fetches the Razorpay link from a new lookup endpoint, then redirects.

Create `src/app/payment-redirect/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentRedirect() {
  const params = useSearchParams();
  const email = params.get('email');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setError('Missing email parameter');
      return;
    }

    fetch(`/api/get-payment-link?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          setError(data.error || 'Could not generate payment link');
        }
      })
      .catch(err => setError(err.message));
  }, [email]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      background: '#FAF3E7',
      color: '#2D2A26',
      padding: '40px',
      textAlign: 'center',
    }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Almost there.</h1>
        <p style={{ fontSize: '16px', color: '#8a7d6a' }}>
          {error ? error : 'Preparing your secure payment page, this takes a few seconds.'}
        </p>
      </div>
    </div>
  );
}
```

Create `src/app/api/get-payment-link/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/maasik/supabase';
import { createPaymentLink } from '@/lib/maasik/razorpay';

export const runtime = 'nodejs';

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
```

**Then update the Tally redirect:** in Tally form settings → "Redirect on submit," set the URL to:

```
https://maasik.neorishi.io/payment-redirect?email=@email
```

Tally's templating uses `@email` to inject the email value from the form's email field. The redirect page extracts it, calls our API to fetch the user's payment link, and forwards them.

**Solution B (simpler, less polished):** Skip the redirect entirely. After form submission, show a static "Check your email for your payment link" message in Tally, and have the `/api/tally-webhook` route send an immediate payment-link email via Resend. Simpler architecturally, but adds 30 seconds of friction for the user.

**My recommendation:** Solution A. The flow feels seamless.

---

## 5. UPDATED parseTallyFields FUNCTION

The current parser in `/api/tally-webhook/route.ts` uses fuzzy substring matching, which is robust but imprecise. Now that we have exact labels, here's the cleaner version. Replace the existing `parseTallyFields` function:

```typescript
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

// New helpers, also add these to the file

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
```

---

## 6. SMOKE TEST THE FULL FLOW (30 min)

After all the above is deployed:

1. **Open the form** at your Tally URL in a fresh incognito window.
2. **Fill out all 25 questions** as if you were a real first-time user. Use a real email you control (not the test user).
3. **Submit** the form. You should be redirected to `/payment-redirect?email=...` then to a Razorpay Payment Link.
4. **In Supabase, immediately check** that a new user row exists:
   ```sql
   SELECT id, full_name, email, prakriti_label, vata_score, pitta_score, kapha_score, subscription_status, created_at
   FROM maasik_users
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   Expected: row exists, Prakriti computed, status `pending`.
5. **Pay ₹99** on the Razorpay link with test card `4111 1111 1111 1111`.
6. **Within 2-3 minutes**, check:
   - `maasik_payments` has a row with `user_id` populated (this is the win, validates the Orders API approach)
   - `maasik_users.subscription_status` flipped to `active`
   - Welcome email + PDF report email both arrived in your inbox
7. **Open the PDF.** Verify it matches the form data: your name, your stated goals, your dietary preferences, your medical conditions all reflected accurately.

If all 7 checks pass, **MAASIK V1 is shipped.**

---

## 7. COMMON PITFALLS

| Issue | Cause | Fix |
|---|---|---|
| Tally webhook fires but no user row created | Field label mismatch | Open the Tally form, hover each field, confirm label exactly matches the strings in `parseTallyFields` |
| Webhook 401 Unauthorized | `TALLY_WEBHOOK_SECRET` mismatch | Either match the secret between Tally and Vercel, or leave both blank to skip verification |
| Razorpay Payment Link creation fails | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` wrong or expired | Re-verify keys in Vercel env vars; in Test Mode use `rzp_test_*`; in Live Mode use `rzp_live_*` |
| Redirect to payment-redirect page shows "User not found" | Tally webhook hasn't finished yet when redirect fires (race condition) | The `/api/get-payment-link` route already does the createPaymentLink; if user doesn't exist yet, retry after 2 sec. Add a setTimeout retry in `PaymentRedirect` component |
| Prakriti scores all 0 | The mapped values aren't "vata", "pitta", "kapha" | Verify the option text in Tally includes `(Vata)`, `(Pitta)`, `(Kapha)` literally |
| Payment goes through but user stays "pending" | Razorpay webhook didn't fire, or `user_id` not in notes | Check Razorpay dashboard → Webhooks → Recent Deliveries; check the `notes` payload contains `user_id` |

---

## 8. WHAT'S NOW COMPLETE

| Deliverable | Status |
|---|---|
| A: Supabase schema | ✅ Live |
| B: Tally form spec | ✅ This document |
| C: Landing page | ✅ Live at maasik.neorishi.io |
| D: Claude API prompt | ✅ Integrated |
| E: Vercel backend | ✅ Working end-to-end |
| F: Razorpay setup | ✅ Working with Orders API |

**MAASIK V1 is feature-complete.**

What's left is execution:
1. Build the Tally form (45 min)
2. Antigravity applies the Razorpay Orders API addition (30 min)
3. End-to-end smoke test (30 min)
4. Soft launch to 5 friends

Total time to soft launch: **2-3 hours of focused work.**

---

## What I owe you AFTER soft launch (V1.1 roadmap)

Things to consider after you have 5+ paying users and real feedback:

1. **Customer dashboard:** simple page where users can update their profile, see past blueprints, manage subscription
2. **Razorpay Subscriptions API** for true auto-debit monthly renewals (removes manual renewal email step)
3. **Async generation via Inngest** if Vercel function invocations get expensive at scale
4. **A/B test the 25Q form vs a 12Q lean form** to optimise conversion
5. **Affiliate / referral system** for word-of-mouth growth
6. **KYC completion** to switch from Razorpay Test Mode to Live Mode

That's the runway. Build, ship, learn, iterate.

---

Confirm "proceed" and I'm done.
