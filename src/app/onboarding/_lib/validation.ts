import { z } from 'zod';
import { QUESTIONS, type Question } from './questions';

const PRAKRITI_VALUES = ['vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha'] as const;

const MEDICAL_VALUES = [
  'diabetes',
  'hypertension',
  'thyroid',
  'acidity',
  'heart',
  'pregnancy',
  'pcos',
  'kidney_liver',
  'other',
  'none',
] as const;

const ALLERGY_VALUES = [
  'dairy',
  'gluten',
  'tree_nuts',
  'peanuts',
  'eggs',
  'soy',
  'seafood',
  'other',
  'none',
] as const;

const PRIMARY_GOAL_VALUES = [
  'weight_loss',
  'weight_gain',
  'energy',
  'digestion',
  'hormonal_balance',
  'stress_relief',
  'general_wellness',
  'other',
] as const;

const GENDER_VALUES = ['male', 'female', 'prefer_not_to_say', 'other'] as const;

const ACTIVITY_VALUES = ['sedentary', 'light', 'moderate', 'very_active', 'variable'] as const;

const WORK_LIFE_VALUES = [
  'desk_high_stress',
  'desk_moderate',
  'physical_work',
  'wfh_flexible',
  'not_working',
] as const;

const MEAL_PATTERN_VALUES = [
  'regular_3',
  'irregular_3',
  'meals_plus_snacks',
  'intermittent_fasting',
  'unstructured',
] as const;

const DIET_VALUES = ['vegetarian', 'eggetarian', 'vegan', 'non_vegetarian', 'flexitarian'] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const OnboardingSchema = z.object({
  // Part 1
  primary_goal: z.enum(PRIMARY_GOAL_VALUES),
  success_vision: z
    .string()
    .trim()
    .min(10, { message: 'Please give us at least a sentence (10+ characters).' })
    .max(500, { message: 'Please keep this under 500 characters.' }),

  // Part 2
  age: z
    .number({ error: 'Please enter your age.' })
    .int({ message: 'Age must be a whole number.' })
    .min(16, { message: 'Minimum age is 16.' })
    .max(95, { message: 'Maximum age is 95.' }),
  gender: z.enum(GENDER_VALUES),
  gender_other: z.string().trim().max(100).optional().nullable(),
  city: z
    .string()
    .trim()
    .min(2, { message: 'Please tell us your city or region.' })
    .max(120),
  height_cm: z
    .number({ error: 'Please enter your height.' })
    .min(120, { message: 'Please double-check your height.' })
    .max(220, { message: 'Please double-check your height.' }),
  weight_kg: z
    .number({ error: 'Please enter your weight.' })
    .min(30, { message: 'Please double-check your weight.' })
    .max(200, { message: 'Please double-check your weight.' }),

  // Part 3 — Prakriti
  prakriti_q_build: z.enum(PRAKRITI_VALUES),
  prakriti_q_skin: z.enum(PRAKRITI_VALUES),
  prakriti_q_digestion: z.enum(PRAKRITI_VALUES),
  prakriti_q_sleep: z.enum(PRAKRITI_VALUES),
  prakriti_q_energy: z.enum(PRAKRITI_VALUES),
  prakriti_q_mind: z.enum(PRAKRITI_VALUES),
  prakriti_q_bowels: z.enum(PRAKRITI_VALUES),

  // Part 4
  medical_conditions: z
    .array(z.enum(MEDICAL_VALUES))
    .min(1, { message: "Pick at least one option, or select 'None of the above'." }),
  medical_conditions_other: z.string().trim().max(300).optional().nullable(),
  allergies: z
    .array(z.enum(ALLERGY_VALUES))
    .min(1, { message: "Pick at least one option, or select 'None of the above'." }),
  allergies_other: z.string().trim().max(300).optional().nullable(),
  activity_level: z.enum(ACTIVITY_VALUES),

  // Part 5
  sleep_time: z.string().regex(TIME_REGEX, { message: 'Pick a valid time.' }),
  wake_time: z.string().regex(TIME_REGEX, { message: 'Pick a valid time.' }),
  work_life: z.enum(WORK_LIFE_VALUES),
  meal_pattern: z.enum(MEAL_PATTERN_VALUES),

  // Part 6
  diet_type: z.enum(DIET_VALUES),
  favorite_foods: z.string().trim().max(300).optional().nullable(),
  disliked_foods: z.string().trim().max(300).optional().nullable(),

  // Part 7
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Please tell us how to address you.' })
    .max(100),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your email.' })
    .email({ message: 'Please enter a valid email.' }),
});

export type OnboardingPayload = z.infer<typeof OnboardingSchema>;

// Loose draft schema for in-progress wizard state (everything nullable).
export type OnboardingDraft = {
  [K in keyof OnboardingPayload]: OnboardingPayload[K] | null;
} & {
  // Other-text fields are always optional strings
  gender_other?: string | null;
  medical_conditions_other?: string | null;
  allergies_other?: string | null;
};

export const EMPTY_DRAFT: OnboardingDraft = {
  primary_goal: null,
  success_vision: null,
  age: null,
  gender: null,
  gender_other: null,
  city: null,
  height_cm: null,
  weight_kg: null,
  prakriti_q_build: null,
  prakriti_q_skin: null,
  prakriti_q_digestion: null,
  prakriti_q_sleep: null,
  prakriti_q_energy: null,
  prakriti_q_mind: null,
  prakriti_q_bowels: null,
  medical_conditions: null,
  medical_conditions_other: null,
  allergies: null,
  allergies_other: null,
  activity_level: null,
  sleep_time: null,
  wake_time: null,
  work_life: null,
  meal_pattern: null,
  diet_type: null,
  favorite_foods: null,
  disliked_foods: null,
  full_name: null,
  email: null,
};

/** Returns the per-field error map for the given part. Empty object = valid. */
export function validatePart(
  part: number,
  draft: OnboardingDraft,
): Record<string, string> {
  const fieldsInPart = QUESTIONS.filter((q) => q.part === part);
  const errors: Record<string, string> = {};

  for (const q of fieldsInPart) {
    const err = validateField(q, draft);
    if (err) errors[q.field] = err;
  }

  return errors;
}

function validateField(q: Question, draft: OnboardingDraft): string | null {
  const value = (draft as Record<string, unknown>)[q.field];

  if (!q.required) {
    // Still bound by maxLength if value is present
    if (q.maxLength && typeof value === 'string' && value.length > q.maxLength) {
      return `Please keep this under ${q.maxLength} characters.`;
    }
    return null;
  }

  // Required field checks
  if (q.type === 'multi_select') {
    if (!Array.isArray(value) || value.length === 0) {
      return "Pick at least one option, or select 'None of the above'.";
    }
    // Check "other" specify-text presence
    if (q.revealsTextOn && q.otherField && (value as string[]).includes(q.revealsTextOn)) {
      const otherText = (draft as Record<string, unknown>)[q.otherField] as string | null;
      if (!otherText || otherText.trim().length === 0) {
        return 'Please specify your "Other" option.';
      }
    }
    return null;
  }

  if (q.type === 'dual_time') {
    const primary = value as string | null;
    const secondary = q.secondaryField
      ? ((draft as Record<string, unknown>)[q.secondaryField] as string | null)
      : null;
    if (!primary || !TIME_REGEX.test(primary)) return 'Please pick a valid sleep time.';
    if (!secondary || !TIME_REGEX.test(secondary)) return 'Please pick a valid wake time.';
    return null;
  }

  if (q.type === 'single_select') {
    if (!value || typeof value !== 'string') return 'Please pick one option.';
    if (q.revealsTextOn && q.otherField && value === q.revealsTextOn) {
      const otherText = (draft as Record<string, unknown>)[q.otherField] as string | null;
      if (!otherText || otherText.trim().length === 0) {
        return 'Please specify your "Other" option.';
      }
    }
    return null;
  }

  if (q.type === 'short_answer' || q.type === 'long_answer') {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'This field is required.';
    }
    if (q.minLength && value.trim().length < q.minLength) {
      return `Please give us at least ${q.minLength} characters.`;
    }
    if (q.maxLength && value.length > q.maxLength) {
      return `Please keep this under ${q.maxLength} characters.`;
    }
    return null;
  }

  if (q.type === 'email') {
    if (!value || typeof value !== 'string') return 'Please enter your email.';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    if (!ok) return 'Please enter a valid email.';
    return null;
  }

  if (q.type === 'number') {
    if (value === null || value === undefined || typeof value !== 'number' || Number.isNaN(value)) {
      return 'Please enter a number.';
    }
    if (q.min !== undefined && value < q.min) return `Minimum is ${q.min}.`;
    if (q.max !== undefined && value > q.max) return `Maximum is ${q.max}.`;
    if (!Number.isInteger(value)) return 'Please enter a whole number.';
    return null;
  }

  if (q.type === 'height' || q.type === 'weight') {
    if (value === null || value === undefined || typeof value !== 'number' || Number.isNaN(value)) {
      return 'Please enter a value.';
    }
    if (q.min !== undefined && value < q.min) return 'Please double-check this value.';
    if (q.max !== undefined && value > q.max) return 'Please double-check this value.';
    return null;
  }

  return null;
}

/**
 * Validates the entire payload before submission.
 * Returns either a parsed payload or a list of error messages.
 */
export function validateAll(
  draft: OnboardingDraft,
): { ok: true; payload: OnboardingPayload } | { ok: false; errors: Record<string, string> } {
  // Strip non-payload fields that are nullable strings ("" -> null) to satisfy zod
  const candidate = { ...draft };
  // Drop _other fields if empty
  if (!candidate.gender_other) delete (candidate as Record<string, unknown>).gender_other;
  if (!candidate.medical_conditions_other)
    delete (candidate as Record<string, unknown>).medical_conditions_other;
  if (!candidate.allergies_other) delete (candidate as Record<string, unknown>).allergies_other;
  if (!candidate.favorite_foods) delete (candidate as Record<string, unknown>).favorite_foods;
  if (!candidate.disliked_foods) delete (candidate as Record<string, unknown>).disliked_foods;

  const parsed = OnboardingSchema.safeParse(candidate);
  if (parsed.success) return { ok: true, payload: parsed.data };

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
