// Single typed source of truth for MAASIK V1 onboarding.
// Mirrors MAASIK_onboarding_questionnaire_final_v1.md.

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'short_answer'
  | 'long_answer'
  | 'number'
  | 'email'
  | 'dual_time'
  | 'height'
  | 'weight';

export interface Option {
  value: string;
  label: string;
  exclusive?: boolean;
}

export interface Question {
  id: string;
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  field: string;
  /** Second canonical field, used by dual_time (Q18 -> sleep_time + wake_time). */
  secondaryField?: string;
  type: QuestionType;
  prompt: string;
  subtitle?: string;
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: Option[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  maxSelections?: number;
  /** Reveals a free-text input when this option value is selected. */
  revealsTextOn?: string;
  /** Column name where the "Other (specify)" text is stored. */
  otherField?: string;
  /** Default value for the primary field (used at first load). */
  defaultValue?: string | number | string[] | null;
  /** dual_time: default for secondary field. */
  defaultSecondaryValue?: string | null;
  /** dual_time: small caption above each picker. */
  primaryLabel?: string;
  secondaryLabel?: string;
}

export interface Part {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  duration: string; // e.g. "~30 sec"
  intro: string;
}

export const PARTS: Part[] = [
  {
    number: 1,
    title: 'Your Goal',
    duration: '~30 sec',
    intro: 'Start with the why — what do you want this monthly blueprint to do for you?',
  },
  {
    number: 2,
    title: 'About You',
    duration: '~45 sec',
    intro: 'Basics that shape what foods are seasonal and locally available for you.',
  },
  {
    number: 3,
    title: 'Your Prakriti, Vedic Constitution',
    duration: '~90 sec',
    intro:
      'Seven quick questions to estimate your dosha tendency. This is a high-level read, not a clinical diagnosis. Pick the answer that has been most true for you over your lifetime — not based on recent diet, training, or stress.',
  },
  {
    number: 4,
    title: 'Your Health Context',
    duration: '~45 sec',
    intro:
      'Medical conditions, allergies, and activity level, so we never recommend something that could harm you or that you can’t eat.',
  },
  {
    number: 5,
    title: 'Your Daily Rhythm',
    duration: '~30 sec',
    intro:
      'Sleep, work, and meal patterns. These tell us when and how your body is operating, so the report can fit your real day.',
  },
  {
    number: 6,
    title: 'Your Food Preferences',
    duration: '~30 sec',
    intro: 'What you eat, what you love, and what you’d rather avoid. We’ll respect every one of these.',
  },
  {
    number: 7,
    title: 'Where to Send Your Report',
    duration: '~15 sec',
    intro:
      'Last two questions. Then your first MAASIK Blueprint will land in your inbox within minutes of payment.',
  },
];

// ── Prakriti options (Q8 – Q14) ─────────────────────────────────────────
// Each of the 7 Prakriti questions uses the same 5 dosha codes with
// question-specific labels. Values remain stable; only labels change.

const PRAKRITI_OPTIONS: Record<string, Option[]> = {
  build: [
    {
      value: 'vata',
      label:
        'Thin and lean — I find it hard to gain weight; prominent joints, narrow shoulders or hips',
    },
    {
      value: 'pitta',
      label: 'Medium and muscular — well-proportioned, athletic build with moderate weight',
    },
    {
      value: 'kapha',
      label: 'Solid and sturdy — broader frame; I gain weight easily; strong, well-built',
    },
    {
      value: 'vata_pitta',
      label: 'Mix of slim and athletic — can shift between thin and toned depending on the year',
    },
    {
      value: 'pitta_kapha',
      label: 'Athletic but with curves or padding — well-built with some softness',
    },
  ],
  skin: [
    {
      value: 'vata',
      label: 'Dry skin; thin, frizzy, or coarse hair — prone to dryness, roughness, cold extremities',
    },
    {
      value: 'pitta',
      label:
        'Sensitive skin (warm, sometimes flushed or breakout-prone); fine hair; prone to early greying or thinning',
    },
    {
      value: 'kapha',
      label: 'Smooth and slightly oily skin; thick, lustrous hair — rarely dry',
    },
    {
      value: 'vata_pitta',
      label: 'Dry skin with occasional sensitivity or breakouts',
    },
    {
      value: 'pitta_kapha',
      label: 'Combination skin (oily in some areas, dry in others); average hair thickness',
    },
  ],
  digestion: [
    {
      value: 'vata',
      label:
        'Irregular appetite — sometimes very hungry, sometimes not; prone to gas, bloating, or discomfort',
    },
    {
      value: 'pitta',
      label: 'Strong, sharp appetite — I get irritable if I miss a meal; sometimes acidity or heartburn',
    },
    {
      value: 'kapha',
      label: 'Slow digestion — I feel heavy after meals; I can comfortably skip meals',
    },
    {
      value: 'vata_pitta',
      label: 'Variable, sometimes irregular, sometimes intense hunger',
    },
    {
      value: 'pitta_kapha',
      label: 'Strong appetite but slow to digest — I eat a lot but feel heavy afterwards',
    },
  ],
  sleep: [
    {
      value: 'vata',
      label: 'Light sleeper — I wake easily; sometimes trouble falling asleep; vivid or active dreams',
    },
    {
      value: 'pitta',
      label: 'Moderate sleeper — 6 to 7 hours; mostly sound but occasionally wake at night',
    },
    {
      value: 'kapha',
      label: 'Deep sleeper — fall asleep easily; sleep long hours; can feel groggy or slow on waking',
    },
    {
      value: 'vata_pitta',
      label: 'Light to moderate sleeper — varies a lot with stress level',
    },
    {
      value: 'pitta_kapha',
      label: 'Generally deep sleep but occasionally restless',
    },
  ],
  energy: [
    {
      value: 'vata',
      label:
        'Energy comes in bursts — fluctuates through the day; I usually feel cold and dislike cold weather',
    },
    {
      value: 'pitta',
      label: 'Steady, high energy — I feel warm or hot, prefer cool weather, and sweat easily',
    },
    {
      value: 'kapha',
      label: 'Stable, steady energy — body feels cool to neutral; I tolerate most weather well',
    },
    {
      value: 'vata_pitta',
      label: 'Variable energy with a warm body',
    },
    {
      value: 'pitta_kapha',
      label: 'Strong stamina with a generally warm body',
    },
  ],
  mind: [
    {
      value: 'vata',
      label:
        'Quick, creative, restless — many thoughts at once; prone to worry, anxiety, or scattered focus',
    },
    {
      value: 'pitta',
      label:
        'Sharp, focused, determined — can be intense, competitive, or quick to anger when frustrated',
    },
    {
      value: 'kapha',
      label:
        'Calm, steady, patient — slow to anger, but also slow to change; sometimes feel sluggish or stuck',
    },
    {
      value: 'vata_pitta',
      label: 'Quick-thinking and sharp — switches between creative and laser-focused modes',
    },
    {
      value: 'pitta_kapha',
      label: 'Focused and calm — steady but firm, deliberate',
    },
  ],
  bowels: [
    {
      value: 'vata',
      label: 'Irregular or sometimes constipated — dry or hard stools; not always daily',
    },
    {
      value: 'pitta',
      label: 'Regular and frequent — sometimes loose or urgent; often more than once a day',
    },
    {
      value: 'kapha',
      label: 'Slow and steady — well-formed, may go once a day or less; rarely loose',
    },
    {
      value: 'vata_pitta',
      label: 'Variable, sometimes constipated, sometimes loose',
    },
    {
      value: 'pitta_kapha',
      label: 'Regular but tends to be slow or heavy',
    },
  ],
};

export const QUESTIONS: Question[] = [
  // ── PART 1 ── Your Goal ────────────────────────────────────────────────
  {
    id: 'Q1',
    part: 1,
    field: 'primary_goal',
    type: 'single_select',
    prompt: "What's your primary health goal right now?",
    subtitle:
      "Choose the single outcome that matters most to you right now. We'll center the monthly recommendations on this goal.",
    required: true,
    options: [
      { value: 'weight_loss', label: 'Weight loss — reduce body fat and lighten my frame' },
      {
        value: 'weight_gain',
        label: 'Weight gain or muscle building — add healthy mass and strength',
      },
      { value: 'energy', label: 'Sustained energy and vitality — feel less tired through the day' },
      {
        value: 'digestion',
        label:
          'Better digestion and gut health — resolve bloating, irregularity, or discomfort',
      },
      {
        value: 'hormonal_balance',
        label: 'Hormonal balance / cycle health — support menstrual or hormonal regulation',
      },
      {
        value: 'stress_relief',
        label: 'Stress reduction and mental calm — feel less anxious or overwhelmed',
      },
      {
        value: 'general_wellness',
        label: 'General wellness and maintenance — stay healthy without a specific issue',
      },
      { value: 'other', label: "Other — I'll describe in the next question" },
    ],
  },
  {
    id: 'Q2',
    part: 1,
    field: 'success_vision',
    type: 'long_answer',
    prompt: 'What does success look like for you?',
    subtitle:
      "In your own words, describe what you'd love to feel or experience after 3 months of following this blueprint. One to three sentences is enough.",
    required: true,
    minLength: 10,
    maxLength: 500,
    placeholder:
      'e.g., I want to lose 5 kg without giving up my favourite foods, and stop feeling sluggish in the afternoons.',
  },

  // ── PART 2 ── About You ────────────────────────────────────────────────
  {
    id: 'Q3',
    part: 2,
    field: 'age',
    type: 'number',
    prompt: 'Your age',
    subtitle:
      'Helps us calibrate recommendations by life stage (Ayurveda treats different decades differently).',
    required: true,
    min: 16,
    max: 95,
    placeholder: 'e.g., 32',
  },
  {
    id: 'Q4',
    part: 2,
    field: 'gender',
    type: 'single_select',
    prompt: 'Gender',
    subtitle:
      'Some Ayurvedic nutrition guidance varies by gender (especially around hormones and cycles).',
    required: true,
    revealsTextOn: 'other',
    otherField: 'gender_other',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
      { value: 'other', label: 'Other (please specify)' },
    ],
  },
  {
    id: 'Q5',
    part: 2,
    field: 'city',
    type: 'short_answer',
    prompt: 'City or region you live in',
    subtitle:
      'We recommend foods that are seasonally available and culturally familiar in your area. Please include city + state/country.',
    required: true,
    placeholder: 'e.g., Nanded, Maharashtra, India',
    maxLength: 120,
  },
  {
    id: 'Q6',
    part: 2,
    field: 'height_cm',
    type: 'height',
    prompt: 'Your current height',
    subtitle:
      'Used internally to compute your BMI. This number will not appear in your monthly report.',
    required: true,
    min: 120,
    max: 220,
    hint: '1 foot = 30 cm',
  },
  {
    id: 'Q7',
    part: 2,
    field: 'weight_kg',
    type: 'weight',
    prompt: 'Your current weight',
    subtitle:
      'Used internally with your height to compute BMI and calibrate goal-setting. Not shown in the report.',
    required: true,
    min: 30,
    max: 200,
  },

  // ── PART 3 ── Your Prakriti (7 questions, 5-option pattern) ────────────
  {
    id: 'Q8',
    part: 3,
    field: 'prakriti_q_build',
    type: 'single_select',
    prompt: 'Your natural body frame and build',
    subtitle:
      "How would you describe your physique when you're not actively dieting or training? Think back to most of your adult life.",
    required: true,
    options: PRAKRITI_OPTIONS.build,
  },
  {
    id: 'Q9',
    part: 3,
    field: 'prakriti_q_skin',
    type: 'single_select',
    prompt: 'Your skin and hair quality',
    subtitle:
      "Consider your natural skin and hair, not on a single bad day, but how they typically behave.",
    required: true,
    options: PRAKRITI_OPTIONS.skin,
  },
  {
    id: 'Q10',
    part: 3,
    field: 'prakriti_q_digestion',
    type: 'single_select',
    prompt: 'Your digestion and appetite',
    subtitle: 'How does your stomach typically behave around meals?',
    required: true,
    options: PRAKRITI_OPTIONS.digestion,
  },
  {
    id: 'Q11',
    part: 3,
    field: 'prakriti_q_sleep',
    type: 'single_select',
    prompt: 'Your sleep pattern',
    subtitle: 'How would you describe your typical sleep when not under unusual stress?',
    required: true,
    options: PRAKRITI_OPTIONS.sleep,
  },
  {
    id: 'Q12',
    part: 3,
    field: 'prakriti_q_energy',
    type: 'single_select',
    prompt: 'Your energy and body temperature',
    subtitle:
      'Think about how your energy and body warmth feel through a typical day and across seasons.',
    required: true,
    options: PRAKRITI_OPTIONS.energy,
  },
  {
    id: 'Q13',
    part: 3,
    field: 'prakriti_q_mind',
    type: 'single_select',
    prompt: 'Your mind and emotional tendencies',
    subtitle: "Under your typical state, not just when you're stressed or relaxed.",
    required: true,
    options: PRAKRITI_OPTIONS.mind,
  },
  {
    id: 'Q14',
    part: 3,
    field: 'prakriti_q_bowels',
    type: 'single_select',
    prompt: 'Your bowel movements',
    subtitle: 'Under normal conditions, not during travel, illness, or major diet changes.',
    required: true,
    options: PRAKRITI_OPTIONS.bowels,
  },

  // ── PART 4 ── Your Health Context ──────────────────────────────────────
  {
    id: 'Q15',
    part: 4,
    field: 'medical_conditions',
    type: 'multi_select',
    prompt: 'Active medical conditions',
    subtitle:
      "Check all that apply. If a condition is well-managed but ongoing, please still select it. If none, select 'None of the above'.",
    required: true,
    revealsTextOn: 'other',
    otherField: 'medical_conditions_other',
    options: [
      {
        value: 'diabetes',
        label: 'Diabetes or blood sugar issues (Type 1, Type 2, or pre-diabetic)',
      },
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
  {
    id: 'Q16',
    part: 4,
    field: 'allergies',
    type: 'multi_select',
    prompt: 'Food allergies or intolerances',
    subtitle:
      "Check all that apply. We will exclude these from every food recommendation. If none, select 'None of the above'.",
    required: true,
    revealsTextOn: 'other',
    otherField: 'allergies_other',
    options: [
      { value: 'dairy', label: 'Dairy or lactose' },
      { value: 'gluten', label: 'Gluten or wheat' },
      { value: 'tree_nuts', label: 'Tree nuts (almonds, cashews, walnuts, etc.)' },
      { value: 'peanuts', label: 'Peanuts' },
      { value: 'eggs', label: 'Eggs' },
      { value: 'soy', label: 'Soy' },
      { value: 'seafood', label: 'Seafood or shellfish' },
      { value: 'other', label: 'Other (please specify briefly)' },
      { value: 'none', label: 'None of the above', exclusive: true },
    ],
  },
  {
    id: 'Q17',
    part: 4,
    field: 'activity_level',
    type: 'single_select',
    prompt: 'Your physical activity level',
    subtitle: 'Across a typical week, not just a peak week or an off week.',
    required: true,
    options: [
      {
        value: 'sedentary',
        label: 'Sedentary, mostly sitting; minimal intentional exercise',
      },
      {
        value: 'light',
        label: 'Lightly active, short walks, light yoga, or 1 to 2 workout sessions a week',
      },
      {
        value: 'moderate',
        label:
          'Moderately active, regular workouts 3 to 4 times a week, or active daily routine',
      },
      {
        value: 'very_active',
        label: 'Very active, daily intense training, manual labour, or athletic performance',
      },
      {
        value: 'variable',
        label: 'Variable, depends heavily on the week or season',
      },
    ],
  },

  // ── PART 5 ── Your Daily Rhythm ────────────────────────────────────────
  {
    id: 'Q18',
    part: 5,
    field: 'sleep_time',
    secondaryField: 'wake_time',
    type: 'dual_time',
    prompt: 'Your typical sleep and wake times',
    subtitle: 'On a normal weekday, not weekends or holidays.',
    required: true,
    defaultValue: '22:30',
    defaultSecondaryValue: '06:30',
    primaryLabel: 'I sleep around',
    secondaryLabel: 'I wake up around',
  },
  {
    id: 'Q19',
    part: 5,
    field: 'work_life',
    type: 'single_select',
    prompt: 'Your work life and stress level',
    subtitle: 'Which best describes your typical day?',
    required: true,
    options: [
      {
        value: 'desk_high_stress',
        label: 'Desk-bound; high mental load; frequent deadlines; high stress',
      },
      {
        value: 'desk_moderate',
        label: 'Desk-bound; moderate intensity; steady pace; manageable stress',
      },
      {
        value: 'physical_work',
        label: 'Physically active work — field, lab, on-site, or trades',
      },
      {
        value: 'wfh_flexible',
        label: 'Work from home or flexible hours — mixed sitting and moving',
      },
      {
        value: 'not_working',
        label: 'Not currently working / homemaker / student / retired',
      },
    ],
  },
  {
    id: 'Q20',
    part: 5,
    field: 'meal_pattern',
    type: 'single_select',
    prompt: 'Your current meal timing pattern',
    subtitle: 'How do you eat on a normal day?',
    required: true,
    options: [
      {
        value: 'regular_3',
        label: 'Three regular meals with consistent timing (breakfast, lunch, dinner)',
      },
      {
        value: 'irregular_3',
        label: 'Three meals but irregular timing — I often skip or delay',
      },
      {
        value: 'meals_plus_snacks',
        label: 'Two main meals plus snacks throughout the day',
      },
      {
        value: 'intermittent_fasting',
        label: 'Intermittent fasting (e.g., 16:8) or one main meal a day (OMAD)',
      },
      {
        value: 'unstructured',
        label: 'Irregular, I snack frequently and meals are unstructured',
      },
    ],
  },

  // ── PART 6 ── Your Food Preferences ────────────────────────────────────
  {
    id: 'Q21',
    part: 6,
    field: 'diet_type',
    type: 'single_select',
    prompt: 'Your dietary preference',
    subtitle: 'Choose the option that best describes how you eat by default.',
    required: true,
    options: [
      { value: 'vegetarian', label: 'Pure vegetarian — no meat, no fish, no eggs' },
      {
        value: 'eggetarian',
        label: 'Lacto-ovo vegetarian — no meat or fish, but I eat eggs and dairy',
      },
      { value: 'vegan', label: 'Vegan — no animal products at all' },
      { value: 'non_vegetarian', label: 'Non-vegetarian — I eat meat or fish regularly' },
      { value: 'flexitarian', label: 'Flexitarian — mostly vegetarian, occasionally non-veg' },
    ],
  },
  {
    id: 'Q22',
    part: 6,
    field: 'favorite_foods',
    type: 'long_answer',
    prompt: 'Foods you genuinely love',
    subtitle:
      'List 3 to 5 foods, meals, or beverages you enjoy and would happily keep in your monthly plan. These will be prioritized in your recommendations.',
    required: false,
    maxLength: 300,
    placeholder: 'e.g., khichdi, fresh seasonal fruits, paneer, ragi roti, ginger tea, dal-rice',
  },
  {
    id: 'Q23',
    part: 6,
    field: 'disliked_foods',
    type: 'long_answer',
    prompt: 'Foods you dislike or want to avoid',
    subtitle:
      "List foods you find unpalatable, hard to digest, or simply prefer to skip, even if you're not allergic to them.",
    required: false,
    maxLength: 300,
    placeholder: 'e.g., bitter gourd, raw onions, very spicy food, mushrooms, processed sugar',
  },

  // ── PART 7 ── Where to Send Your Report ────────────────────────────────
  {
    id: 'Q24',
    part: 7,
    field: 'full_name',
    type: 'short_answer',
    prompt: 'Your name',
    subtitle:
      'How would you like us to address you in the report? Just a first name is fine.',
    required: true,
    minLength: 2,
    maxLength: 100,
    placeholder: 'e.g., Hrishikesh',
  },
  {
    id: 'Q25',
    part: 7,
    field: 'email',
    type: 'email',
    prompt: 'Your email address',
    subtitle:
      'This is where your monthly Vedic Blueprint PDF will be delivered, every Shukla Pratipada (first day of the Vedic month).',
    required: true,
    placeholder: 'e.g., yourname@example.com',
  },
];

export function questionsForPart(part: number): Question[] {
  return QUESTIONS.filter((q) => q.part === part);
}

export const TOTAL_PARTS = 7;
