export const COPY = {
  brand: {
    name: 'MAASIK',
    parent: 'by NeoRishi',
    tagline: 'Your nutrition, aligned with the moon.',
  },

  nav: {
    cta: 'Get Your Blueprint',
    ctaMobile: 'Subscribe',
  },

  hero: {
    eyebrow: 'PERSONALIZED · MONTHLY · VEDIC',
    headlineLineOne: 'Your nutrition,',
    headlineLineTwoBefore: '',
    headlineLineTwoItalic: 'aligned',
    headlineLineTwoAfter: ' with the moon.',
    subheadline:
      'A premium monthly blueprint, built around your Ayurvedic constitution, your goals, and the season you are actually living in.',
    body: 'Every Shukla Pratipada, a four-page nutrition guide arrives in your inbox. Calibrated to your Prakriti, your city, your goals, and this exact Vedic month. Not a generic diet plan. A new one each month, as the season changes.',
    primaryCta: 'Get Your Blueprint — ₹99',
    secondaryCta: 'See a sample report ↓',
    trustLine:
      '₹99 first month · ₹499/month or ₹4,999/year after · Cancel anytime',
    monthMetaLabel:
      'THIS MONTH: JYESHTHA · GREESHMA RITU · 02 MAY TO 16 MAY 2026',
  },

  whatIsMaasik: {
    label: '01 — THE IDEA',
    sanskritVerse: 'ऋतुचर्या रसायनम्',
    sanskritTranslation: 'Seasonal living is the true rejuvenation.',
    heading: "Ayurveda's oldest insight, in your inbox each month.",
    body: [
      'Classical Ayurveda has always taught that what you eat in May should not match what you ate in November. Your digestive fire, your hydration needs, your dosha levels, all of these shift with the Vedic season. Most modern diets ignore this completely.',
      'MAASIK fixes that. Once each Vedic month, you receive a four-page PDF that maps the next 14 to 30 days of eating to four variables we calculate for you: your Prakriti (Ayurvedic constitution), your goals, your active health concerns, and the current Ritu. The output is a grocery list, a meal map, and a routine that all fit on a single document you can stick on your refrigerator.',
      'This is not a meal-kit subscription. There is no app to check daily. It is a quiet, monthly arrival of clarity, designed for people who want to eat well without thinking about it every day.',
    ],
  },

  howItWorks: {
    heading: 'Three steps. Once.',
    subheading:
      'Tell us about yourself once. Get personalized blueprints forever.',
    steps: [
      {
        number: '01',
        title: 'Answer 25 questions',
        description:
          'A three-minute onboarding. We learn your constitution, your goals, your city, your dietary preferences, and your active health concerns. No fluff.',
      },
      {
        number: '02',
        title: 'Pay ₹99 to start',
        description:
          "A simple Razorpay checkout. ₹99 for your first month's blueprint. Then ₹499/month or ₹4,999/year. Cancel any time, no questions.",
      },
      {
        number: '03',
        title: 'Receive every Shukla Pratipada',
        description:
          "Each new Vedic month, your fresh PDF arrives by email at 7:00 AM IST. Calibrated to that month's Ritu and your profile. Open, print, follow.",
      },
    ],
  },

  samplePreview: {
    label: '02 — WHAT YOU RECEIVE',
    heading: 'A real blueprint, blurred for privacy.',
    subheading:
      'This is the actual May 2026 issue for a Pitta-Vata user in Pune. Specific personal details are blurred. The structure and design are real.',
    pageAnnotations: [
      { label: 'PAGE 01', caption: 'Cover with your Vedic month, ritu, and dates' },
      { label: 'PAGE 02', caption: 'Month overview plus your personalized analysis' },
      { label: 'PAGE 03', caption: 'Diet blueprint, food categories, your ideal day' },
      { label: 'PAGE 04', caption: "Grocery list, do's and don'ts, your anchor" },
    ],
    scrollHint: 'swipe →',
  },

  fourSections: {
    label: '03 — THE FOUR SECTIONS, EXPLAINED',
    heading: 'Four sections. One coherent month.',
    cards: [
      {
        number: '01.',
        title: 'Your month overview',
        body: 'Each month, the report opens with what this Vedic month means in classical Ayurveda — the climate, the dominant dosha, the typical health risks. Then we connect that directly to your profile in a personalized callout that explains exactly why this month matters for you.',
      },
      {
        number: '02.',
        title: 'Your diet blueprint',
        body: "A full categorized food table — grains, pulses, vegetables, fruits, dairy, beverages, spices, snacks — split into 'favour' and 'avoid' columns. Plus an ideal-day meal map from 6:30 AM to 9:30 PM, with specific timing, portions, and substitutions for your constitution.",
      },
      {
        number: '03.',
        title: 'Your grocery list',
        body: 'A complete shopping list organized by category, calibrated to your meal map and dosha. Stick it on your fridge. Hand it to your house help. You will not need to think about what to buy for two weeks.',
      },
      {
        number: '04.',
        title: 'Your routine and anchor',
        body: "The non-food half of the report: a side-by-side do's and don'ts for the month, a Sanskrit verse to anchor your practice, and a personal closing paragraph that connects your specific symptoms to one root cause and one concrete action for this month.",
      },
    ],
  },

  pricing: {
    label: '04 — PRICING',
    heading: 'Less than a single dinner. Every month.',
    subheading:
      'Try MAASIK for ₹99. If the first blueprint changes how you eat, continue. If it does not, cancel in one click.',
    tiers: [
      {
        id: 'monthly',
        label: 'MONTHLY',
        price: '₹499',
        slash: 'per Vedic month',
        bullets: [
          'First month: ₹99 (instead of ₹499)',
          'New 4-page PDF every Shukla Pratipada',
          'Personalized to your Prakriti + city + goals',
          'Cancel any time, one click',
        ],
        cta: 'Start Monthly — ₹99 first month',
        badge: null as string | null,
      },
      {
        id: 'annual',
        label: 'ANNUAL',
        price: '₹4,999',
        slash: 'for 12 months · save ₹1,000',
        bullets: [
          'All 12 Vedic months delivered',
          'Includes Adhik Maas issues when they occur',
          'Priority email support',
          'First month still ₹99, then ₹4,999 covers months 2 to 13',
        ],
        cta: 'Start Annual — ₹99 first month',
        badge: 'BEST VALUE' as string | null,
      },
    ],
    caveat:
      'Payments handled by Razorpay. UPI, cards, and net banking accepted. No auto-debit without consent. We will email you before each renewal.',
  },

  faq: {
    label: '05 — QUESTIONS',
    heading: 'What people ask before signing up.',
    items: [
      {
        q: 'Is this Ayurvedic medicine? Will it replace my doctor?',
        a: 'No. MAASIK is a nutrition and lifestyle blueprint based on classical Ayurvedic seasonal wisdom (Ritucharya). It complements, never replaces, medical care. If you have an active medical condition, talk to your doctor before making changes.',
      },
      {
        q: "I don't know my Prakriti. Can I still subscribe?",
        a: 'Yes. The onboarding asks seven questions about your body, sleep, digestion, energy, and emotional patterns. We compute your Prakriti tendency from those. It is directional, not clinical, but accurate enough to personalize your blueprint with high confidence.',
      },
      {
        q: 'What if I have allergies or a medical condition?',
        a: 'Tell us in the onboarding. Your blueprint accounts for allergies, intolerances, and conditions like acidity, diabetes, hypertension, thyroid issues, IBS, and so on. Foods that aggravate your condition are explicitly avoided.',
      },
      {
        q: 'Is this vegetarian only?',
        a: 'We support vegetarian, eggetarian, non-vegetarian, and vegan diets. Your onboarding answer locks the diet type. The blueprint adapts.',
      },
      {
        q: 'When does the first report arrive?',
        a: 'Within 30 minutes of payment, you receive your first issue calibrated to the current Vedic month. From then on, a fresh blueprint arrives every Shukla Pratipada (the first day of each new Vedic lunar month) by 7:00 AM IST.',
      },
      {
        q: 'Can I cancel?',
        a: 'Yes, any time, one click. You will keep access to issues you have already paid for. We do not send a cancellation survey or ask why.',
      },
      {
        q: 'Why is the first month ₹99?',
        a: 'So you can read a full blueprint before committing. If the first issue does not feel like ₹499 of value, do not continue. Most users continue.',
      },
      {
        q: 'Who is behind MAASIK?',
        a: "MAASIK is built by NeoRishi, founded by Hrishikesh, who holds a Master's in Yoga Shastra. The blueprints are generated with AI calibrated to classical Ayurvedic texts (Charaka Samhita, Ashtanga Hridayam) and reviewed against a curated Ritucharya knowledge base. We aim to grow with a panel of Ayurvedic vaidyas advising us.",
      },
    ],
  },

  footer: {
    finalSub: 'Subscribe today and your first blueprint arrives on the day.',
    finalCta: 'Get Your Blueprint — ₹99',
    legalLeft: 'MAASIK · A NeoRishi product',
    legalCenter: ['Terms', 'Privacy', 'Contact: hello@neorishi.io'],
    legalRight: '© 2026 NeoRishi',
    closingSanskrit: 'सर्वे भवन्तु सुखिनः',
    closingTranslation: 'MAY ALL BE HEALTHY',
  },
};

export function finalHeadingDynamic(daysToNext: number): string {
  if (daysToNext <= 0) return 'Your next Shukla Pratipada is today.';
  if (daysToNext === 1) return 'Your next Shukla Pratipada is tomorrow.';
  return `Your next Shukla Pratipada is in ${daysToNext} days.`;
}

// Next Shukla Pratipada — Adhik Jyeshtha Shukla Pratipada
export const NEXT_SHUKLA_PRATIPADA = '2026-05-17';

// DEPRECATED: Tally onboarding replaced by the in-app /onboarding wizard on
// 2026-05-14. Kept defined but unused for rollback safety. Do not remove the
// NEXT_PUBLIC_TALLY_FORM_URL env var yet — schedule deletion with V1.1.
export const TALLY_URL =
  process.env.NEXT_PUBLIC_TALLY_FORM_URL ?? 'https://tally.so/r/REPLACE_ME';
