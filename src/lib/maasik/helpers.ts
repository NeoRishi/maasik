/**
 * src/lib/maasik/helpers.ts
 *
 * Helper functions for MAASIK report generation.
 * All formatters and humanisers used by both the report-generation Vercel
 * route and the user message builder.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type Ritu =
  | 'Shishira'
  | 'Vasanta'
  | 'Greeshma'
  | 'Varsha'
  | 'Sharad'
  | 'Hemanta';

export interface VedicMonth {
  vedic_month: string;
  paksha: 'shukla' | 'krishna';
  vikram_samvat: number;
  ritu: string;
  gregorian_start: string;  // YYYY-MM-DD
  gregorian_end: string;    // YYYY-MM-DD
  is_adhik_maas?: boolean;
  shukla_pratipada_date?: string;
  amavasya_date?: string;
}

export interface MaasikUser {
  id: string;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  region: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  primary_goals: string[];
  goal_specifics: string | null;
  prakriti_label: string | null;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  diet_type: string | null;
  favorite_foods: string | null;
  disliked_foods: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  sleep_time: string | null;
  wake_time: string | null;
  work_type: string | null;
  stress_level: string | null;
  meal_timing_pattern: string | null;
  expectations: string | null;
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format an ISO date string (YYYY-MM-DD) into a human-readable form.
 *
 * @param isoDate - ISO date string like "2026-05-02"
 * @param style - 'short' (default) like "02 May 2026", or 'long' like "02 May 2026"
 *                or 'compact' like "02 May"
 * @returns Formatted string. Returns the input unchanged if it cannot be parsed.
 *
 * @example
 *   formatVedicDate('2026-05-02')           // "02 May 2026"
 *   formatVedicDate('2026-05-02', 'long')   // "02 May 2026"
 *   formatVedicDate('2026-05-02', 'compact')// "02 May"
 */
export function formatVedicDate(
  isoDate: string | Date | null | undefined,
  style: 'short' | 'long' | 'compact' = 'short'
): string {
  if (!isoDate) return '';

  let d: Date;
  if (isoDate instanceof Date) {
    d = isoDate;
  } else {
    // Force UTC parsing to avoid timezone drift on the date boundary
    d = new Date(isoDate + 'T00:00:00Z');
  }

  if (isNaN(d.getTime())) return String(isoDate);

  const day = String(d.getUTCDate()).padStart(2, '0');
  const monthIndex = d.getUTCMonth();
  const year = d.getUTCFullYear();

  const monthShort = MONTH_NAMES_SHORT[monthIndex];
  const monthLong = MONTH_NAMES[monthIndex];

  switch (style) {
    case 'compact':
      return `${day} ${monthShort}`;
    case 'long':
      return `${day} ${monthLong} ${year}`;
    case 'short':
    default:
      return `${day} ${monthShort} ${year}`;
  }
}

// ============================================================================
// BMI CATEGORISATION (Indian / Asian-specific thresholds)
// ============================================================================

/**
 * Returns a BMI category string using Indian/South-Asian thresholds
 * (which are lower than WHO global thresholds because South Asians develop
 * metabolic risk at lower BMI levels).
 *
 * Thresholds source: Indian Council of Medical Research, 2009 consensus
 *   < 18.5      : Underweight
 *   18.5 - 22.9 : Normal
 *   23.0 - 24.9 : Overweight (at-risk)
 *   25.0 - 29.9 : Obese class I
 *   >= 30       : Obese class II
 */
export function getBmiCategory(bmi: number | null | undefined): string {
  if (bmi === null || bmi === undefined || isNaN(bmi)) return 'Not available';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal (Indian)';
  if (bmi < 25) return 'Overweight (Indian)';
  if (bmi < 30) return 'Obese Class I (Indian)';
  return 'Obese Class II (Indian)';
}

// ============================================================================
// VEDIC MONTH HUMAN DESCRIPTORS
// ============================================================================

const MONTH_DESCRIPTORS: Record<string, string> = {
  'Chaitra': 'The Vedic New Year, the awakening of spring',
  'Vaishakha': 'Late spring, warming, harvest of summer fruits begins',
  'Jyeshtha': 'The month of the eldest fire, peak summer arrives',
  'Nija Jyeshtha': 'The pure Jyeshtha following Adhik Maas, late summer',
  'Ashadha': 'High summer melting into early monsoon',
  'Shravana': 'The heart of monsoon, sacred to Lord Shiva',
  'Bhadrapada': 'Late monsoon, festivals of harvest and devotion',
  'Ashwina': 'Autumn begins, Navratri illuminates the air',
  'Ashvina': 'Autumn begins, Navratri illuminates the air',
  'Kartika': 'The month of Diwali, light returning, harvest gratitude',
  'Margashirsha': 'Early winter, the cold settles, agni rises',
  'Pausha': 'Deep winter, the body conserves and builds',
  'Magha': 'Late winter, the longest nights begin to shorten',
  'Phalguna': 'Pre-spring, Holi colours the cold, the year ends',
};

export function getMonthDescriptor(month: VedicMonth): string {
  return MONTH_DESCRIPTORS[month.vedic_month] || `The Vedic month of ${month.vedic_month}`;
}

// ============================================================================
// RITU DESCRIPTORS (cover-page tagline for the Ritu)
// ============================================================================

const RITU_DESCRIPTORS: Record<string, string> = {
  'Vasanta': 'Spring',
  'Greeshma': 'Peak Summer',
  'Grishma': 'Peak Summer',
  'Varsha': 'Monsoon',
  'Sharad': 'Autumn',
  'Hemanta': 'Early Winter',
  'Shishira': 'Late Winter',
};

export function getRituDescriptor(ritu: string): string {
  return RITU_DESCRIPTORS[ritu] || ritu;
}

// ============================================================================
// PAKSHA HUMANISER
// ============================================================================

export function humanisePaksha(paksha: 'shukla' | 'krishna' | string): string {
  if (paksha === 'shukla') return 'Shukla Paksha';
  if (paksha === 'krishna') return 'Krishna Paksha';
  return paksha;
}

// ============================================================================
// PRAKRITI HUMANISER
// ============================================================================

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

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ============================================================================
// DOSHA CELL CLASS COMPUTER (for the dosha-strip in Section 1)
// ============================================================================

/**
 * Given the three dosha scores, returns the CSS class to apply to each dosha cell:
 *   'dominant'  -> the highest-scoring dosha (terracotta background)
 *   'secondary' -> the second-highest dosha within 2 points of dominant (sand)
 *   ''          -> background dosha (default cream)
 *
 * @example
 *   computeDoshaCellClasses(6, 11, 5)
 *   // { vata: 'secondary', pitta: 'dominant', kapha: '' }
 */
export function computeDoshaCellClasses(
  vata: number,
  pitta: number,
  kapha: number
): { vata: string; pitta: string; kapha: string } {
  const scores: [string, number][] = [
    ['vata', vata],
    ['pitta', pitta],
    ['kapha', kapha],
  ];

  const sorted = [...scores].sort((a, b) => b[1] - a[1]);
  const [dominantName, dominantScore] = sorted[0];
  const [secondaryName, secondaryScore] = sorted[1];

  const result = { vata: '', pitta: '', kapha: '' } as Record<string, string>;
  result[dominantName] = 'dominant';

  // If second is within 2 points of dominant, mark it as secondary
  if (dominantScore - secondaryScore <= 2) {
    result[secondaryName] = 'secondary';
  }

  return result as { vata: string; pitta: string; kapha: string };
}

/**
 * Returns a short label like "Dominant", "Secondary, X pts", "Background, Y pts"
 * for use inside each dosha cell.
 */
export function getDoshaLabel(
  score: number,
  cellClass: string
): string {
  if (cellClass === 'dominant') return 'Dominant';
  if (cellClass === 'secondary') return 'Secondary';
  return 'Background';
}

// ============================================================================
// GOAL HUMANISER (turns goal codes from primary_goals[] into display text)
// ============================================================================

const GOAL_DISPLAY: Record<string, string> = {
  'weight_loss': 'Fat Loss',
  'mental_clarity': 'Clarity & Focus',
  'energy': 'Energy & Stamina',
  'muscle_gain': 'Muscle Building',
  'digestion': 'Digestive Health',
  'sleep': 'Better Sleep',
  'stress_relief': 'Stress Reduction',
  'general_wellness': 'General Wellness',
  'medical_support': 'Medical Support',
  'other': 'Custom Goal',
};

export function humaniseGoal(goalCode: string): string {
  return GOAL_DISPLAY[goalCode] || capitalize(goalCode.replace(/_/g, ' '));
}

export function getPrimaryGoalDisplay(goals: string[]): string {
  if (!goals || goals.length === 0) return 'General Wellness';
  return humaniseGoal(goals[0]);
}

export function getSecondaryGoalDisplay(goals: string[]): string {
  if (!goals || goals.length < 2) return 'None set';
  return humaniseGoal(goals[1]);
}

// ============================================================================
// ACTIVE CONCERN DISPLAY (for the profile strip)
// ============================================================================

/**
 * Picks the most clinically-relevant short label from the user's
 * allergies or medical_conditions field for the profile strip header.
 * If nothing notable, returns 'None'.
 */
export function getActiveConcernDisplay(
  allergies: string | null,
  medical_conditions: string | null
): string {
  const med = (medical_conditions || '').toLowerCase().trim();
  const allergy = (allergies || '').toLowerCase().trim();

  // Common conditions, pick the first one found
  const conditionKeywords: [string, string][] = [
    ['acidity', 'Acidity'],
    ['heartburn', 'Acidity'],
    ['gerd', 'GERD'],
    ['reflux', 'GERD'],
    ['diabet', 'Diabetes'],
    ['hypertens', 'Hypertension'],
    ['bp', 'Hypertension'],
    ['blood pressure', 'Hypertension'],
    ['thyroid', 'Thyroid'],
    ['hypothyroid', 'Hypothyroid'],
    ['ibs', 'IBS'],
    ['constipation', 'Constipation'],
    ['pcos', 'PCOS'],
    ['cholesterol', 'High Cholesterol'],
    ['arthritis', 'Arthritis'],
  ];

  for (const [keyword, label] of conditionKeywords) {
    if (med.includes(keyword) || allergy.includes(keyword)) return label;
  }

  // No condition match; check if anything was reported at all
  const nothing = (s: string) => !s || s === 'none' || s === 'nil' || s === 'na' || s === 'n/a';
  if (nothing(med) && nothing(allergy)) return 'None';

  // Something was reported but unrecognized; return the first 20 chars
  const raw = medical_conditions || allergies || 'None';
  return raw.length > 20 ? raw.slice(0, 20).trim() + '...' : raw;
}

// ============================================================================
// ISSUE NUMBER FORMATTER
// ============================================================================

export function formatIssueNumber(n: number): string {
  return String(n).padStart(2, '0');
}

// ============================================================================
// COST CALCULATION (Sonnet 4.6 pricing, verified May 2026)
// ============================================================================

/**
 * Computes the INR cost of a Claude API call.
 * Sonnet 4.6 pricing: $3 per million input tokens, $15 per million output tokens.
 * Conversion at ~83 INR/USD.
 */
export function computeReportCostInr(usage: {
  input_tokens: number;
  output_tokens: number;
}): number {
  const inputCostUsd = (usage.input_tokens / 1_000_000) * 3;
  const outputCostUsd = (usage.output_tokens / 1_000_000) * 15;
  const totalInr = (inputCostUsd + outputCostUsd) * 83;
  return Number(totalInr.toFixed(4));
}

// ============================================================================
// V2 RITU CALIBRATIONS (Part E / F7 of MAASIK v2 spec)
// ============================================================================

const RITU_COLORS: Record<Ritu, { primary: string; accent: string }> = {
  Greeshma: { primary: '#B85C3A', accent: '#C99A4D' },
  Varsha:   { primary: '#5A6F4D', accent: '#7E8B9E' },
  Sharad:   { primary: '#C99A4D', accent: '#E8DCC4' },
  Hemanta:  { primary: '#8E3F26', accent: '#4A2E2A' },
  Shishira: { primary: '#3D4F6B', accent: '#C99A4D' },
  Vasanta:  { primary: '#6B7F4F', accent: '#C99A4D' },
};

/** Returns the cover-signature primary and accent hex colors for the Ritu. */
export function getRituColors(ritu: string): { primary: string; accent: string } {
  return RITU_COLORS[ritu as Ritu] ?? RITU_COLORS.Greeshma;
}

export interface RituActivityZone {
  label: string;
  startHour: number;
  endHour: number;
  color: string;
}

const RITU_ACTIVITY_ZONES: Record<Ritu, RituActivityZone[]> = {
  Greeshma: [
    { label: 'WALK',          startHour: 6,  endHour: 9,  color: '#6B7F4F' },
    { label: 'STAY INDOORS',  startHour: 10, endHour: 17, color: '#B85C3A' },
    { label: 'WIND DOWN',     startHour: 19, endHour: 22, color: '#4A2E2A' },
  ],
  Varsha: [
    { label: 'STRETCH INDOORS', startHour: 6,  endHour: 9,  color: '#6B7F4F' },
    { label: 'STAY DRY',        startHour: 10, endHour: 18, color: '#7E8B9E' },
    { label: 'WARM EVENING',    startHour: 19, endHour: 22, color: '#4A2E2A' },
  ],
  Sharad: [
    { label: 'WALK',          startHour: 6,  endHour: 9,  color: '#6B7F4F' },
    { label: 'MODERATE SUN',  startHour: 10, endHour: 15, color: '#C99A4D' },
    { label: 'WIND DOWN',     startHour: 19, endHour: 22, color: '#4A2E2A' },
  ],
  Hemanta: [
    { label: 'BRISK WALK',    startHour: 6,  endHour: 9,  color: '#6B7F4F' },
    { label: 'STEADY DAY',    startHour: 10, endHour: 17, color: '#C99A4D' },
    { label: 'WARM EVENING',  startHour: 19, endHour: 22, color: '#4A2E2A' },
  ],
  Shishira: [
    { label: 'MOVEMENT AFTER SUN', startHour: 8,  endHour: 10, color: '#6B7F4F' },
    { label: 'WARM DAY',           startHour: 11, endHour: 16, color: '#C99A4D' },
    { label: 'DEEP REST',          startHour: 20, endHour: 22, color: '#3D4F6B' },
  ],
  Vasanta: [
    { label: 'ACTIVE MORNING', startHour: 6,  endHour: 9,  color: '#6B7F4F' },
    { label: 'MILD SUN',       startHour: 10, endHour: 15, color: '#8FA854' },
    { label: 'WIND DOWN',      startHour: 19, endHour: 22, color: '#4A2E2A' },
  ],
};

/** Returns the three day-chart activity zones for Section 4, keyed by Ritu. */
export function getRituActivityZones(ritu: string): RituActivityZone[] {
  return RITU_ACTIVITY_ZONES[ritu as Ritu] ?? RITU_ACTIVITY_ZONES.Greeshma;
}

const RITU_LEVER_TEMPLATES: Record<Ritu, string> = {
  Greeshma: 'Lunch big. Dinner small. Walk before 8.',
  Varsha:   'Warm food only. No raw. Sleep by 10.',
  Sharad:   'Cool food. Calm pace. Bed by 11.',
  Hemanta:  'Eat richly. Move daily. Sleep deep.',
  Shishira: 'Warm food. Daily movement. Early bed.',
  Vasanta:  'Light food. Move daily. No naps.',
};

/** Returns the default Section 7 lever-line template for the Ritu. */
export function getRituLeverTemplate(ritu: string): string {
  return RITU_LEVER_TEMPLATES[ritu as Ritu] ?? RITU_LEVER_TEMPLATES.Greeshma;
}

const RITU_SECTION2_TITLES: Record<Ritu, string> = {
  Greeshma: 'The fire turns inward',
  Varsha:   'The body returns to digestion',
  Sharad:   'The heat lingers, the body steadies',
  Hemanta:  'The fire builds, the body harvests',
  Shishira: 'The cold deepens, the body holds',
  Vasanta:  'Kapha melts, the body lightens',
};

/** Returns the Section 2 title used above the heat-flow diagram. */
export function getRituSection2Title(ritu: string): string {
  return RITU_SECTION2_TITLES[ritu as Ritu] ?? RITU_SECTION2_TITLES.Greeshma;
}

const RITU_LEGEND_LABELS: Record<Ritu, { leanIn: string; easeOff: string }> = {
  Greeshma: { leanIn: 'Lean in · cooling tastes',          easeOff: 'Ease off · heating tastes' },
  Varsha:   { leanIn: 'Lean in · warming tastes',          easeOff: 'Ease off · cooling and raw tastes' },
  Sharad:   { leanIn: 'Lean in · cooling sweet tastes',    easeOff: 'Ease off · sour and pungent tastes' },
  Hemanta:  { leanIn: 'Lean in · nourishing heavy tastes', easeOff: 'Ease off · light dry foods' },
  Shishira: { leanIn: 'Lean in · warming oily tastes',     easeOff: 'Ease off · cold light dry foods' },
  Vasanta:  { leanIn: 'Lean in · light pungent bitter tastes', easeOff: 'Ease off · heavy sweet sour foods' },
};

/** Returns the two legend pill labels for the Section 3 taste map. */
export function getRituLegendLabels(ritu: string): { leanIn: string; easeOff: string } {
  return RITU_LEGEND_LABELS[ritu as Ritu] ?? RITU_LEGEND_LABELS.Greeshma;
}

const RITU_GROCERY_SPECIALS_TITLES: Record<Ritu, string> = {
  Greeshma: 'Greeshma cooling specials',
  Varsha:   'Varsha warming specials',
  Sharad:   'Sharad cooling specials',
  Hemanta:  'Hemanta nourishing specials',
  Shishira: 'Shishira warming specials',
  Vasanta:  'Vasanta lightening specials',
};

/** Returns the Section 6 specials-card title for the Ritu. */
export function getRituGrocerySpecialsTitle(ritu: string): string {
  return RITU_GROCERY_SPECIALS_TITLES[ritu as Ritu] ?? RITU_GROCERY_SPECIALS_TITLES.Greeshma;
}

// ============================================================================
// NEXT-DELIVERY DATE LOOKUP
// ============================================================================

/** Async: returns the next Vedic month's Shukla Pratipada Gregorian date (YYYY-MM-DD) or null. */
export async function getNextDeliveryDate(
  supabase: SupabaseClient,
  currentMonth: VedicMonth
): Promise<string | null> {
  const { data, error } = await supabase
    .from('maasik_vedic_calendar')
    .select('shukla_pratipada_date, gregorian_start')
    .gt('gregorian_start', currentMonth.gregorian_end)
    .order('gregorian_start', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return (data.shukla_pratipada_date as string | null) ?? null;
}