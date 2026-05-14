# MAASIK V1 — Final Onboarding Questionnaire
## Production-ready specification, merging best of Tally spec + DOCX draft

**Date:** 13 May 2026
**Version:** v1 (final, locked for first soft launch)
**Purpose:** This is the single source of truth for the 25-question onboarding questionnaire that will be implemented in the WebUI (not Tally). It blends the warmer wording and superior sequence from the earlier DOCX draft with the production-ready precision of the Tally spec, plus a critical Prakriti scoring upgrade.
**Status:** Locked. Any future change requires version bump.

---

## What changed vs. each prior version (audit trail)

| Question | Source | Why this version won |
|---|---|---|
| Sequence (Goal → About You → Prakriti → Health → Rhythm → Food → Identity) | DOCX | Goal-first creates commitment before asking sensitive data; identity-at-end converts better |
| Question wording (warm, narrative tone) | DOCX | Matches premium magazine aesthetic of landing page and PDF |
| Prakriti: 5 options per question (incl. dual doshas) | DOCX | Captures real human constitutions; 3-option Tally version was clinically over-simplified |
| Medical conditions as multi-select checkbox | DOCX | Structured data, easier UX, no fuzzy parsing |
| Food allergies as multi-select checkbox | DOCX | Same |
| Activity level separate from work type | DOCX | Two genuinely different signals; combining them lost detail |
| Age as numeric input (not range) | Tally | Downstream BMI / calorie logic needs actual age |
| Section count: 7 parts with section dividers | DOCX | Better pacing; 5-section version felt rushed |
| "Why we ask" hint text under each question | DOCX | Increases form trust and completion rate |
| Heights/weights with dual-unit support (cm/ft, kg/lb) | DOCX | Global users; expand-friendly |
| Welcome framing with "What you'll get" preview | DOCX | Magazine-quality intro reinforces value before friction |
| Field labels (machine-readable keys) | Tally | Already wired into webhook parser logic |
| Required vs optional, min/max validation | Tally | Production-grade input validation |

---

## ⚠️ Critical change required to Supabase schema

The DOCX version introduces **5-option Prakriti questions** (with two dual-dosha options like "Vata-Pitta" and "Pitta-Kapha"). The current `maasik_compute_prakriti()` SQL function in Deliverable A expects 3 pure values (`vata`, `pitta`, `kapha`).

**You must update this function before going live with the new form.** The migration is provided in Section 9 of this document. Run it in Supabase BEFORE the new form goes live, or Prakriti scoring will silently produce wrong labels.

---

## WELCOME SCREEN (shown before Q1)

```
MAASIK
Your Personalized Vedic Monthly Blueprint

What you'll get
A 4-page personalized PDF report every Vedic month
Built on Ritu-Charya (seasonal Ayurveda) + your unique profile
Delivered on Shukla Pratipada — the first day of each Vedic month

Time to complete: 3 minutes
Total questions: 25

How to answer
Most questions are single-select. Pick the option that fits you most of the time,
not your best day or your worst day. Be honest; this isn't a test.

For multi-select questions (medical conditions, allergies), check all that apply,
or select "None".

For free-text questions, a sentence or two is enough. Don't overthink.

If two options feel equally true, pick the one that's been true for the longest
stretch of your life.

There is no right answer. We use these inputs to compute a high-level estimate
of your Vedic constitution (Prakriti) and your current life context. The output
report will be calibrated to you, not a generic template.

[ Get started → ]
```

UX notes:
- This screen replaces the old "click Get Started" button on the landing page CTA
- Single CTA button at the bottom; user must explicitly start
- "Time to complete: 3 minutes" sets honest expectation (down from earlier "5 minutes")
- Use Fraunces serif for `MAASIK` and `What you'll get` heading; Inter Tight for body

---

## THE 25 QUESTIONS

Organized into 7 parts. Each part is one step in the multi-step wizard. Each question shows a "why we ask" subtitle in muted text below the question text.

---

### PART 1 — Your Goal (~30 sec, 2 questions)

Section header text: **"Start with the why — what do you want this monthly blueprint to do for you?"**

---

**Q1. What's your primary health goal right now?**

*Subtitle (why we ask):* "Choose the single outcome that matters most to you right now. We'll center the monthly recommendations on this goal."

- **Type:** Single-select (radio)
- **Field label:** `primary_goal`
- **Required:** yes
- **Options** (value → display):
  - `weight_loss` — "Weight loss — reduce body fat and lighten my frame"
  - `weight_gain` — "Weight gain or muscle building — add healthy mass and strength"
  - `energy` — "Sustained energy and vitality — feel less tired through the day"
  - `digestion` — "Better digestion and gut health — resolve bloating, irregularity, or discomfort"
  - `hormonal_balance` — "Hormonal balance / cycle health — support menstrual or hormonal regulation"
  - `stress_relief` — "Stress reduction and mental calm — feel less anxious or overwhelmed"
  - `general_wellness` — "General wellness and maintenance — stay healthy without a specific issue"
  - `other` — "Other — I'll describe in the next question"

---

**Q2. What does success look like for you?**

*Subtitle:* "In your own words, describe what you'd love to feel or experience after 3 months of following this blueprint. One to three sentences is enough."

- **Type:** Long-answer (textarea)
- **Field label:** `success_vision`
- **Required:** yes (minimum 10 characters)
- **Max length:** 500 characters
- **Placeholder:** "e.g., I want to lose 5 kg without giving up my favourite foods, and stop feeling sluggish in the afternoons."
- **Maps to:** `maasik_users.expectations`

---

### PART 2 — About You (~45 sec, 5 questions)

Section header text: **"Basics that shape what foods are seasonal and locally available for you."**

---

**Q3. Your age**

*Subtitle:* "Helps us calibrate recommendations by life stage (Ayurveda treats different decades differently)."

- **Type:** Number input
- **Field label:** `age`
- **Required:** yes
- **Min:** 16
- **Max:** 95
- **Placeholder:** "e.g., 32"
- **Validation:** Must be integer
- **UX:** show numeric stepper (+/-) on mobile

---

**Q4. Gender**

*Subtitle:* "Some Ayurvedic nutrition guidance varies by gender (especially around hormones and cycles)."

- **Type:** Single-select (radio)
- **Field label:** `gender`
- **Required:** yes
- **Options:**
  - `male` — "Male"
  - `female` — "Female"
  - `prefer_not_to_say` — "Prefer not to say"
  - `other` — "Other (please specify)" → reveals free-text input

---

**Q5. City or region you live in**

*Subtitle:* "We recommend foods that are seasonally available and culturally familiar in your area. Please include city + state/country."

- **Type:** Short answer
- **Field label:** `city`
- **Required:** yes
- **Placeholder:** "e.g., Nanded, Maharashtra, India"
- **Maps to:** `maasik_users.city` + derived `region` via `deriveRegion()` helper

---

**Q6. Your current height**

*Subtitle:* "Used internally to compute your BMI. This number will not appear in your monthly report."

- **Type:** Number with unit toggle
- **Field label:** `height_cm` (always store in cm regardless of input)
- **Required:** yes
- **Unit toggle:** `cm` (default) | `feet+inches`
- **Min (cm):** 120 — **Max (cm):** 220
- **Min (ft):** 4 — **Max (ft):** 7
- **Helper:** "1 foot = 30 cm"
- **Validation:** Show error if implausible (e.g., 50 cm or 8 ft)

---

**Q7. Your current weight**

*Subtitle:* "Used internally with your height to compute BMI and calibrate goal-setting. Not shown in the report."

- **Type:** Number with unit toggle
- **Field label:** `weight_kg` (always store in kg)
- **Required:** yes
- **Unit toggle:** `kg` (default) | `lbs`
- **Min (kg):** 30 — **Max (kg):** 200

---

### PART 3 — Your Prakriti, Vedic Constitution (~90 sec, 7 questions)

Section header text: **"Seven quick questions to estimate your dosha tendency. This is a high-level read, not a clinical diagnosis. Pick the answer that has been most true for you over your lifetime — not based on recent diet, training, or stress."**

UX note: Each Prakriti question shows the same 5-option pattern. The "value" stored in DB is one of: `vata`, `pitta`, `kapha`, `vata_pitta`, `pitta_kapha`. The display options below are intentionally diverse to capture real human variation.

---

**Q8. Your natural body frame and build**

*Subtitle:* "How would you describe your physique when you're not actively dieting or training? Think back to most of your adult life."

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_build`
- **Required:** yes
- **Options:**
  - `vata` — "Thin and lean — I find it hard to gain weight; prominent joints, narrow shoulders or hips"
  - `pitta` — "Medium and muscular — well-proportioned, athletic build with moderate weight"
  - `kapha` — "Solid and sturdy — broader frame; I gain weight easily; strong, well-built"
  - `vata_pitta` — "Mix of slim and athletic — can shift between thin and toned depending on the year"
  - `pitta_kapha` — "Athletic but with curves or padding — well-built with some softness"

---

**Q9. Your skin and hair quality**

*Subtitle:* "Consider your natural skin and hair, not on a single bad day, but how they typically behave."

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_skin`
- **Required:** yes
- **Options:**
  - `vata` — "Dry skin; thin, frizzy, or coarse hair — prone to dryness, roughness, cold extremities"
  - `pitta` — "Sensitive skin (warm, sometimes flushed or breakout-prone); fine hair; prone to early greying or thinning"
  - `kapha` — "Smooth and slightly oily skin; thick, lustrous hair — rarely dry"
  - `vata_pitta` — "Dry skin with occasional sensitivity or breakouts"
  - `pitta_kapha` — "Combination skin (oily in some areas, dry in others); average hair thickness"

---

**Q10. Your digestion and appetite**

*Subtitle:* "How does your stomach typically behave around meals?"

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_digestion`
- **Required:** yes
- **Options:**
  - `vata` — "Irregular appetite — sometimes very hungry, sometimes not; prone to gas, bloating, or discomfort"
  - `pitta` — "Strong, sharp appetite — I get irritable if I miss a meal; sometimes acidity or heartburn"
  - `kapha` — "Slow digestion — I feel heavy after meals; I can comfortably skip meals"
  - `vata_pitta` — "Variable, sometimes irregular, sometimes intense hunger"
  - `pitta_kapha` — "Strong appetite but slow to digest — I eat a lot but feel heavy afterwards"

---

**Q11. Your sleep pattern**

*Subtitle:* "How would you describe your typical sleep when not under unusual stress?"

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_sleep`
- **Required:** yes
- **Options:**
  - `vata` — "Light sleeper — I wake easily; sometimes trouble falling asleep; vivid or active dreams"
  - `pitta` — "Moderate sleeper — 6 to 7 hours; mostly sound but occasionally wake at night"
  - `kapha` — "Deep sleeper — fall asleep easily; sleep long hours; can feel groggy or slow on waking"
  - `vata_pitta` — "Light to moderate sleeper — varies a lot with stress level"
  - `pitta_kapha` — "Generally deep sleep but occasionally restless"

---

**Q12. Your energy and body temperature**

*Subtitle:* "Think about how your energy and body warmth feel through a typical day and across seasons."

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_energy`
- **Required:** yes
- **Options:**
  - `vata` — "Energy comes in bursts — fluctuates through the day; I usually feel cold and dislike cold weather"
  - `pitta` — "Steady, high energy — I feel warm or hot, prefer cool weather, and sweat easily"
  - `kapha` — "Stable, steady energy — body feels cool to neutral; I tolerate most weather well"
  - `vata_pitta` — "Variable energy with a warm body"
  - `pitta_kapha` — "Strong stamina with a generally warm body"

---

**Q13. Your mind and emotional tendencies**

*Subtitle:* "Under your typical state, not just when you're stressed or relaxed."

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_mind`
- **Required:** yes
- **Options:**
  - `vata` — "Quick, creative, restless — many thoughts at once; prone to worry, anxiety, or scattered focus"
  - `pitta` — "Sharp, focused, determined — can be intense, competitive, or quick to anger when frustrated"
  - `kapha` — "Calm, steady, patient — slow to anger, but also slow to change; sometimes feel sluggish or stuck"
  - `vata_pitta` — "Quick-thinking and sharp — switches between creative and laser-focused modes"
  - `pitta_kapha` — "Focused and calm — steady but firm, deliberate"

---

**Q14. Your bowel movements**

*Subtitle:* "Under normal conditions, not during travel, illness, or major diet changes."

- **Type:** Single-select (radio)
- **Field label:** `prakriti_q_bowels`
- **Required:** yes
- **Options:**
  - `vata` — "Irregular or sometimes constipated — dry or hard stools; not always daily"
  - `pitta` — "Regular and frequent — sometimes loose or urgent; often more than once a day"
  - `kapha` — "Slow and steady — well-formed, may go once a day or less; rarely loose"
  - `vata_pitta` — "Variable, sometimes constipated, sometimes loose"
  - `pitta_kapha` — "Regular but tends to be slow or heavy"

---

### PART 4 — Your Health Context (~45 sec, 3 questions)

Section header text: **"Medical conditions, allergies, and activity level, so we never recommend something that could harm you or that you can't eat."**

---

**Q15. Active medical conditions**

*Subtitle:* "Check all that apply. If a condition is well-managed but ongoing, please still select it. If none, select 'None of the above'."

- **Type:** Multi-select (checkboxes)
- **Field label:** `medical_conditions`
- **Required:** yes (at least one selection, including "None")
- **Storage format:** array of values, e.g., `['acidity', 'thyroid']`, or `['none']`
- **Options:**
  - `diabetes` — "Diabetes or blood sugar issues (Type 1, Type 2, or pre-diabetic)"
  - `hypertension` — "Hypertension / high blood pressure"
  - `thyroid` — "Thyroid imbalance (hypothyroid or hyperthyroid)"
  - `acidity` — "Acid reflux / GERD / chronic acidity"
  - `heart` — "Heart condition (any kind)"
  - `pregnancy` — "Currently pregnant or breastfeeding"
  - `pcos` — "PCOS / PCOD"
  - `kidney_liver` — "Kidney or liver condition"
  - `other` — "Other (please specify)" → reveals free-text input
  - `none` — "None of the above" (mutually exclusive with all others)

UX behavior: if user clicks "None of the above," all other checkboxes auto-uncheck. If user clicks any other option after "None" was selected, "None" auto-unchecks.

---

**Q16. Food allergies or intolerances**

*Subtitle:* "Check all that apply. We will exclude these from every food recommendation. If none, select 'None of the above'."

- **Type:** Multi-select (checkboxes)
- **Field label:** `allergies`
- **Required:** yes (at least one selection, including "None")
- **Storage format:** array of values
- **Options:**
  - `dairy` — "Dairy or lactose"
  - `gluten` — "Gluten or wheat"
  - `tree_nuts` — "Tree nuts (almonds, cashews, walnuts, etc.)"
  - `peanuts` — "Peanuts"
  - `eggs` — "Eggs"
  - `soy` — "Soy"
  - `seafood` — "Seafood or shellfish"
  - `other` — "Other (please specify briefly)" → reveals free-text input
  - `none` — "None of the above" (mutually exclusive)

Same "None" exclusivity logic as Q15.

---

**Q17. Your physical activity level**

*Subtitle:* "Across a typical week, not just a peak week or an off week."

- **Type:** Single-select (radio)
- **Field label:** `activity_level`
- **Required:** yes
- **Options:**
  - `sedentary` — "Sedentary, mostly sitting; minimal intentional exercise"
  - `light` — "Lightly active, short walks, light yoga, or 1 to 2 workout sessions a week"
  - `moderate` — "Moderately active, regular workouts 3 to 4 times a week, or active daily routine"
  - `very_active` — "Very active, daily intense training, manual labour, or athletic performance"
  - `variable` — "Variable, depends heavily on the week or season"

---

### PART 5 — Your Daily Rhythm (~30 sec, 3 questions)

Section header text: **"Sleep, work, and meal patterns. These tell us when and how your body is operating, so the report can fit your real day."**

---

**Q18. Your typical sleep and wake times**

*Subtitle:* "On a normal weekday, not weekends or holidays."

- **Type:** Two time pickers in one question
- **Field labels:** `sleep_time` (e.g., "23:30:00") and `wake_time` (e.g., "06:30:00")
- **Required:** yes (both)
- **UX:** Two side-by-side time inputs labeled "I sleep around" and "I wake up around"
- **Mobile UX:** Use native time picker
- **Default values:** Sleep 22:30, Wake 06:30

---

**Q19. Your work life and stress level**

*Subtitle:* "Which best describes your typical day?"

- **Type:** Single-select (radio)
- **Field label:** `work_life`
- **Required:** yes
- **Options:**
  - `desk_high_stress` — "Desk-bound; high mental load; frequent deadlines; high stress"
  - `desk_moderate` — "Desk-bound; moderate intensity; steady pace; manageable stress"
  - `physical_work` — "Physically active work — field, lab, on-site, or trades"
  - `wfh_flexible` — "Work from home or flexible hours — mixed sitting and moving"
  - `not_working` — "Not currently working / homemaker / student / retired"

---

**Q20. Your current meal timing pattern**

*Subtitle:* "How do you eat on a normal day?"

- **Type:** Single-select (radio)
- **Field label:** `meal_pattern`
- **Required:** yes
- **Options:**
  - `regular_3` — "Three regular meals with consistent timing (breakfast, lunch, dinner)"
  - `irregular_3` — "Three meals but irregular timing — I often skip or delay"
  - `meals_plus_snacks` — "Two main meals plus snacks throughout the day"
  - `intermittent_fasting` — "Intermittent fasting (e.g., 16:8) or one main meal a day (OMAD)"
  - `unstructured` — "Irregular, I snack frequently and meals are unstructured"

---

### PART 6 — Your Food Preferences (~30 sec, 3 questions)

Section header text: **"What you eat, what you love, and what you'd rather avoid. We'll respect every one of these."**

---

**Q21. Your dietary preference**

*Subtitle:* "Choose the option that best describes how you eat by default."

- **Type:** Single-select (radio)
- **Field label:** `diet_type`
- **Required:** yes
- **Options:**
  - `vegetarian` — "Pure vegetarian — no meat, no fish, no eggs"
  - `eggetarian` — "Lacto-ovo vegetarian — no meat or fish, but I eat eggs and dairy"
  - `vegan` — "Vegan — no animal products at all"
  - `non_vegetarian` — "Non-vegetarian — I eat meat or fish regularly"
  - `flexitarian` — "Flexitarian — mostly vegetarian, occasionally non-veg"

---

**Q22. Foods you genuinely love**

*Subtitle:* "List 3 to 5 foods, meals, or beverages you enjoy and would happily keep in your monthly plan. These will be prioritized in your recommendations."

- **Type:** Long-answer (textarea)
- **Field label:** `favorite_foods`
- **Required:** no
- **Max length:** 300 characters
- **Placeholder:** "e.g., khichdi, fresh seasonal fruits, paneer, ragi roti, ginger tea, dal-rice"

---

**Q23. Foods you dislike or want to avoid**

*Subtitle:* "List foods you find unpalatable, hard to digest, or simply prefer to skip, even if you're not allergic to them."

- **Type:** Long-answer (textarea)
- **Field label:** `disliked_foods`
- **Required:** no
- **Max length:** 300 characters
- **Placeholder:** "e.g., bitter gourd, raw onions, very spicy food, mushrooms, processed sugar"

---

### PART 7 — Where to Send Your Report (~15 sec, 2 questions)

Section header text: **"Last two questions. Then your first MAASIK Blueprint will land in your inbox within minutes of payment."**

---

**Q24. Your name**

*Subtitle:* "How would you like us to address you in the report? Just a first name is fine."

- **Type:** Short answer
- **Field label:** `full_name`
- **Required:** yes
- **Min length:** 2
- **Max length:** 100
- **Placeholder:** "e.g., Hrishikesh"

---

**Q25. Your email address**

*Subtitle:* "This is where your monthly Vedic Blueprint PDF will be delivered, every Shukla Pratipada (first day of the Vedic month)."

- **Type:** Email
- **Field label:** `email`
- **Required:** yes
- **Validation:** valid email format
- **Placeholder:** "e.g., yourname@example.com"

---

## COMPLETION SCREEN (shown after Q25)

```
That's it, you're done.

Next: you'll see a quick preview of your personalized blueprint,
then a one-tap secure payment.

Introductory price: ₹99 for your first month.
₹499/month or ₹4,999/year thereafter.

[ Continue to payment → ]
```

UX notes:
- Same "Continue to payment" button copy as the original spec
- This button triggers the `onboarding-submit` API call, which creates the user in Supabase + generates the Razorpay link + redirects to payment
- Show a subtle loading state ("Preparing your secure payment page...") while the API processes

---

## SECTION 8: TYPE SCHEMA (questions.ts)

For the WebUI implementation, this is the single typed source of truth. All 25 questions in one file.

```typescript
// src/app/onboarding/_lib/questions.ts

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'short_answer'
  | 'long_answer'
  | 'number'
  | 'email'
  | 'time'
  | 'dual_time'
  | 'height'
  | 'weight';

export interface Option {
  value: string;
  label: string;
  exclusive?: boolean;  // for "None of the above" in multi-select
}

export interface Question {
  id: string;                  // e.g., 'Q1'
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  field: string;               // DB column name
  type: QuestionType;
  prompt: string;              // the question text
  subtitle?: string;           // "why we ask" text
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: Option[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  maxSelections?: number;      // for multi_select
  revealsTextOn?: string;      // for "Other" options that reveal a text input
}

export const QUESTIONS: Question[] = [
  // PART 1 — Your Goal
  {
    id: 'Q1', part: 1, field: 'primary_goal', type: 'single_select',
    prompt: "What's your primary health goal right now?",
    subtitle: "Choose the single outcome that matters most to you right now. We'll center the monthly recommendations on this goal.",
    required: true,
    options: [
      { value: 'weight_loss', label: 'Weight loss — reduce body fat and lighten my frame' },
      { value: 'weight_gain', label: 'Weight gain or muscle building — add healthy mass and strength' },
      { value: 'energy', label: 'Sustained energy and vitality — feel less tired through the day' },
      { value: 'digestion', label: 'Better digestion and gut health — resolve bloating, irregularity, or discomfort' },
      { value: 'hormonal_balance', label: 'Hormonal balance / cycle health — support menstrual or hormonal regulation' },
      { value: 'stress_relief', label: 'Stress reduction and mental calm — feel less anxious or overwhelmed' },
      { value: 'general_wellness', label: 'General wellness and maintenance — stay healthy without a specific issue' },
      { value: 'other', label: "Other — I'll describe in the next question" },
    ],
  },
  {
    id: 'Q2', part: 1, field: 'success_vision', type: 'long_answer',
    prompt: "What does success look like for you?",
    subtitle: "In your own words, describe what you'd love to feel or experience after 3 months of following this blueprint. One to three sentences is enough.",
    required: true, minLength: 10, maxLength: 500,
    placeholder: 'e.g., I want to lose 5 kg without giving up my favourite foods, and stop feeling sluggish in the afternoons.',
  },

  // PART 2 — About You
  {
    id: 'Q3', part: 2, field: 'age', type: 'number',
    prompt: 'Your age',
    subtitle: 'Helps us calibrate recommendations by life stage (Ayurveda treats different decades differently).',
    required: true, min: 16, max: 95, placeholder: 'e.g., 32',
  },
  {
    id: 'Q4', part: 2, field: 'gender', type: 'single_select',
    prompt: 'Gender',
    subtitle: 'Some Ayurvedic nutrition guidance varies by gender (especially around hormones and cycles).',
    required: true,
    revealsTextOn: 'other',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
      { value: 'other', label: 'Other (please specify)' },
    ],
  },
  {
    id: 'Q5', part: 2, field: 'city', type: 'short_answer',
    prompt: 'City or region you live in',
    subtitle: 'We recommend foods that are seasonally available and culturally familiar in your area. Please include city + state/country.',
    required: true, placeholder: 'e.g., Nanded, Maharashtra, India',
  },
  {
    id: 'Q6', part: 2, field: 'height_cm', type: 'height',
    prompt: 'Your current height',
    subtitle: 'Used internally to compute your BMI. This number will not appear in your monthly report.',
    required: true, min: 120, max: 220,
    hint: '1 foot = 30 cm',
  },
  {
    id: 'Q7', part: 2, field: 'weight_kg', type: 'weight',
    prompt: 'Your current weight',
    subtitle: 'Used internally with your height to compute BMI and calibrate goal-setting. Not shown in the report.',
    required: true, min: 30, max: 200,
  },

  // PART 3 — Your Prakriti (7 questions)
  // All use 5-option single-select pattern
  // See full PRAKRITI_OPTIONS_BY_FIELD in next code block
  // ... (questions Q8–Q14 follow identical pattern, abbreviated here)

  // PART 4 — Your Health Context
  {
    id: 'Q15', part: 4, field: 'medical_conditions', type: 'multi_select',
    prompt: 'Active medical conditions',
    subtitle: "Check all that apply. If a condition is well-managed but ongoing, please still select it. If none, select 'None of the above'.",
    required: true,
    revealsTextOn: 'other',
    options: [
      { value: 'diabetes', label: 'Diabetes or blood sugar issues (Type 1, Type 2, or pre-diabetic)' },
      { value: 'hypertension', label: 'Hypertension / high blood pressure' },
      { value: 'thyroid', label: 'Thyroid imbalance (hypothyroid or hyperthyroid)' },
      { value: 'acidity', label: 'Acid reflux / GERD / chronic acidity' },
      { value: 'heart', label: 'Heart condition (any kind)' },
      { value: 'pregnancy', label: 'Currently pregnant or breastfeeding' },
      { value: 'pcos', label: 'PCOS / PCOD' },
      { value: 'kidney_liver', label: 'Kidney or liver condition' },
      { value: 'other', label: 'Other (please specify)' },
      { value: 'none', label: 'None of the above', exclusive: true },
    ],
  },
  // ... (Q16, Q17, etc., follow same pattern)

  // ... (full list continues for Q8–Q25, see spec sections above)
];

// Prakriti questions share the same 5 dosha options.
// To avoid 7×5 = 35 line repetition, use this helper:
export const PRAKRITI_OPTIONS: Option[] = [
  { value: 'vata', label: 'option text varies per question — see spec' },
  { value: 'pitta', label: 'option text varies per question' },
  { value: 'kapha', label: 'option text varies per question' },
  { value: 'vata_pitta', label: 'option text varies per question' },
  { value: 'pitta_kapha', label: 'option text varies per question' },
];
```

The full `questions.ts` will be ~600 lines after expansion. The pattern is uniform; the only variance is option text per Prakriti question. Antigravity can hydrate this from the spec above.

---

## SECTION 9: SQL MIGRATION (REQUIRED BEFORE LAUNCH)

The 5-option Prakriti requires updating the scoring function. Run this in Supabase SQL Editor:

```sql
-- ============================================================================
-- MAASIK Prakriti scoring update: support 5-option questions including dual doshas
-- Run BEFORE the new WebUI onboarding form goes live
-- ============================================================================

CREATE OR REPLACE FUNCTION maasik_compute_prakriti(user_id_input UUID)
RETURNS VOID AS $$
DECLARE
  v_vata INT := 0;
  v_pitta INT := 0;
  v_kapha INT := 0;
  v_label TEXT;
  rec RECORD;
  field_value TEXT;
BEGIN
  -- Fetch the 7 Prakriti question values for this user
  SELECT
    prakriti_q_build,
    prakriti_q_skin,
    prakriti_q_digestion,
    prakriti_q_sleep,
    prakriti_q_energy,
    prakriti_q_mind,
    prakriti_q_bowels
  INTO rec
  FROM maasik_users
  WHERE id = user_id_input;

  -- Loop through each of the 7 answers
  FOR field_value IN
    SELECT unnest(ARRAY[
      rec.prakriti_q_build,
      rec.prakriti_q_skin,
      rec.prakriti_q_digestion,
      rec.prakriti_q_sleep,
      rec.prakriti_q_energy,
      rec.prakriti_q_mind,
      rec.prakriti_q_bowels
    ])
  LOOP
    -- Each pure option gives 2 points to its dosha
    -- Each dual option gives 1 point to each of its two doshas
    CASE field_value
      WHEN 'vata' THEN v_vata := v_vata + 2;
      WHEN 'pitta' THEN v_pitta := v_pitta + 2;
      WHEN 'kapha' THEN v_kapha := v_kapha + 2;
      WHEN 'vata_pitta' THEN
        v_vata := v_vata + 1;
        v_pitta := v_pitta + 1;
      WHEN 'pitta_kapha' THEN
        v_pitta := v_pitta + 1;
        v_kapha := v_kapha + 1;
      WHEN 'vata_kapha' THEN  -- reserved for future use
        v_vata := v_vata + 1;
        v_kapha := v_kapha + 1;
      ELSE NULL;  -- skip nulls or unknown values
    END CASE;
  END LOOP;

  -- Compute the prakriti label
  -- Pure dominant: one dosha clearly ahead (>= 2 point gap)
  -- Dual: two doshas within 1 point of each other and both ahead of third
  -- Tri-doshic: all three within 2 points
  v_label := CASE
    -- Pure dominant
    WHEN v_vata >= v_pitta + 2 AND v_vata >= v_kapha + 2 THEN 'vata_dominant'
    WHEN v_pitta >= v_vata + 2 AND v_pitta >= v_kapha + 2 THEN 'pitta_dominant'
    WHEN v_kapha >= v_vata + 2 AND v_kapha >= v_pitta + 2 THEN 'kapha_dominant'
    -- Dual constitutions
    WHEN ABS(v_vata - v_pitta) <= 1 AND v_vata + v_pitta > v_kapha * 2 THEN 'vata_pitta'
    WHEN ABS(v_pitta - v_kapha) <= 1 AND v_pitta + v_kapha > v_vata * 2 THEN 'pitta_kapha'
    WHEN ABS(v_vata - v_kapha) <= 1 AND v_vata + v_kapha > v_pitta * 2 THEN 'vata_kapha'
    -- Tri-doshic
    ELSE 'tri_dosha'
  END;

  -- Update the user row with scores and label
  UPDATE maasik_users
  SET
    vata_score = v_vata,
    pitta_score = v_pitta,
    kapha_score = v_kapha,
    prakriti_label = v_label
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql;
```

**What changed in this version:**
- Accepts 5 input values (`vata`, `pitta`, `kapha`, `vata_pitta`, `pitta_kapha`) instead of just 3
- Each pure answer = 2 points to one dosha; each dual answer = 1 point each to two doshas
- Final label can now be one of 7 values: `vata_dominant`, `pitta_dominant`, `kapha_dominant`, `vata_pitta`, `pitta_kapha`, `vata_kapha`, `tri_dosha`
- This is more clinically accurate than the previous binary label

**Test the function after deploying:**
```sql
-- Insert a test user with mixed answers
SELECT maasik_compute_prakriti('dcbac230-18bb-4174-85f6-ba41d1848122');

SELECT vata_score, pitta_score, kapha_score, prakriti_label
FROM maasik_users
WHERE id = 'dcbac230-18bb-4174-85f6-ba41d1848122';
```

Expected: scores reflect 2-points-per-pure / 1-point-per-dual logic; label is one of the 7 values.

---

## SECTION 10: HELPER FUNCTION UPDATES

The `humanisePrakriti()` helper in `helpers.ts` must also handle the new label format. Update it:

```typescript
export function humanisePrakriti(label: string | null | undefined): string {
  if (!label) return 'Tri-doshic (assessment incomplete)';

  const map: Record<string, string> = {
    'tri_dosha': 'Tri-doshic',
    'vata_dominant': 'Vata-dominant',
    'pitta_dominant': 'Pitta-dominant',
    'kapha_dominant': 'Kapha-dominant',
    'vata_pitta': 'Vata-Pitta',
    'pitta_kapha': 'Pitta-Kapha',
    'vata_kapha': 'Vata-Kapha',
  };

  return map[label] || capitalize(label.replace(/_/g, ' '));
}
```

---

## SECTION 11: SMOKE TEST CHECKLIST (after WebUI is built)

After the WebUI onboarding form is built and deployed, run this test:

1. **Open** `https://maasik.neorishi.io/onboarding` in incognito
2. **Read** the welcome screen, click "Get started"
3. **Fill all 25 questions** with realistic mixed answers
   - Try answering Q8-Q14 with a mix of pure and dual options (e.g., 4 Pitta, 2 Pitta-Kapha, 1 Kapha)
4. **Submit** the form
5. **Verify in Supabase:**
   ```sql
   SELECT id, full_name, email, primary_goal,
          vata_score, pitta_score, kapha_score, prakriti_label,
          medical_conditions, allergies,
          activity_level, work_life, meal_pattern
   FROM maasik_users
   WHERE email = '<your-test-email>';
   ```
   Expected: All fields populated, Prakriti scores reflect the 5-option scoring.
6. **Verify Razorpay link** was generated and you were redirected to payment
7. **Pay ₹99** in test mode
8. **Confirm** PDF email arrives within 3 minutes
9. **Open the PDF.** Verify the personalisation reflects the form inputs (especially the dual-dosha prakriti and the medical conditions)

---

## SECTION 12: FUTURE ITERATIONS (V1.1+)

Once you have 10-20 paying users, things to consider:

1. **Add a "back" button on each step** so users can review/edit prior answers without losing form state
2. **Add conditional logic:** if user picks "non-vegetarian" in Q21, ask a follow-up about meat preferences
3. **Add a progress bar** showing "Section 3 of 7" at the top
4. **Add micro-animations** when transitioning between sections (subtle fade or slide)
5. **Add a "Save and continue later" link** that emails the user a resume link with their progress preserved
6. **Localize** to Hindi/Marathi for broader India reach
7. **Add an "estimated reading time"** on the welcome screen ("Your blueprint typically takes 8 minutes to read")
8. **Pre-fill name and email** if the user came from a paid ad campaign with UTM params

---

## SECTION 13: WHAT'S LOCKED AND WHAT CAN STILL CHANGE

**Locked (do not modify without version bump):**
- The 25 questions, their wording, their field labels
- The Prakriti scoring algorithm (5-option, dual-dosha aware)
- The Supabase schema additions
- The completion screen copy

**Can still change without version bump:**
- Visual styling (fonts, colors, spacing)
- Animation and transition speeds
- Section progress indicators
- Error message wording
- Helper text styling

---

## SECTION 14: CHANGES NEEDED IN SUPABASE SCHEMA

In addition to the function update in Section 9, the `maasik_users` table may need column additions to store the richer dataset from this form. Check existing schema:

```sql
-- Verify these columns exist; add if missing
ALTER TABLE maasik_users 
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS success_vision TEXT,
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS work_life TEXT,
  ADD COLUMN IF NOT EXISTS meal_pattern TEXT,
  ADD COLUMN IF NOT EXISTS medical_conditions_other TEXT,
  ADD COLUMN IF NOT EXISTS allergies_other TEXT,
  ADD COLUMN IF NOT EXISTS gender_other TEXT;

-- If medical_conditions and allergies are currently text fields, 
-- convert to text arrays:
-- (Only run if your existing schema has them as TEXT, not TEXT[])
-- ALTER TABLE maasik_users 
--   ALTER COLUMN medical_conditions TYPE TEXT[] USING ARRAY[medical_conditions],
--   ALTER COLUMN allergies TYPE TEXT[] USING ARRAY[allergies];
```

Run this BEFORE deploying the new WebUI.

---

## END OF SPEC

This is the final, production-locked onboarding questionnaire for MAASIK V1.

**Next steps after this is approved:**
1. Apply SQL migrations (Section 9 + Section 14)
2. Update `humanisePrakriti()` helper (Section 10)
3. Build the WebUI per Deliverable B-v2 (separate spec, to be generated)
4. Run smoke test (Section 11)
5. Soft launch to first 5 friends

When you fork this for the next product (TATTVA, LunarSprints, etc.), the patterns to reuse:
- 7-part section structure with pacing estimates
- "Why we ask" subtitles under every question
- 5-option psychometric questions with dual-state options
- Multi-select with mutually-exclusive "None of the above"
- Goal-first sequence with identity-at-end
- Numeric inputs with dual-unit toggles
