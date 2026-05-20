/**
 * src/lib/maasik/user-message.ts
 *
 * Builds the Claude user message for a MAASIK monthly report.
 * Mirrors v2 spec Section 3 (THE USER MESSAGE TEMPLATE).
 */

import { HTML_TEMPLATE } from './html-template';
import {
  formatVedicDate,
  getBmiCategory,
  getMonthDescriptor,
  humanisePaksha,
  type MaasikUser,
  type VedicMonth,
} from './helpers';

/**
 * The route layer enriches the current month row with the next month's
 * vedic_month / ritu / Shukla Pratipada date before calling buildUserMessage.
 * These fields are optional so the function degrades cleanly if the lookup
 * fails (Claude is instructed to handle 'unknown' gracefully).
 */
export type VedicMonthWithNext = VedicMonth & {
  next_vedic_month?: string | null;
  next_ritu?: string | null;
  next_delivery_date?: string | null;
};

export function buildUserMessage(
  user: MaasikUser,
  month: VedicMonthWithNext,
  editionNumber: number,
  previousWordOrigins: string[],
): string {
  const firstName = user.full_name.split(' ')[0];
  const generationDate = new Date().toISOString().split('T')[0];

  const previousOriginsList =
    previousWordOrigins && previousWordOrigins.length > 0
      ? previousWordOrigins.join(', ')
      : 'none';

  return `Generate the MAASIK monthly blueprint for the following user.

<user_profile>
  <name>${user.full_name}</name>
  <first_name>${firstName}</first_name>
  <age>${user.age ?? 'not provided'}</age>
  <gender>${user.gender ?? 'not provided'}</gender>
  <city>${user.city ?? 'India'}</city>
  <region>${user.region ?? ''}</region>
  <height_cm>${user.height_cm ?? ''}</height_cm>
  <weight_kg>${user.weight_kg ?? ''}</weight_kg>
  <bmi>${user.bmi ?? ''}</bmi>
  <bmi_category>${getBmiCategory(user.bmi)}</bmi_category>

  <prakriti_internal_only>${user.prakriti_label ?? ''}</prakriti_internal_only>
  <vata_score>${user.vata_score}</vata_score>
  <pitta_score>${user.pitta_score}</pitta_score>
  <kapha_score>${user.kapha_score}</kapha_score>

  <primary_goals>${user.primary_goals.join(', ')}</primary_goals>
  <goal_specifics>${user.goal_specifics || 'not specified'}</goal_specifics>

  <diet_type>${user.diet_type ?? 'unspecified'}</diet_type>
  <favorite_foods>${user.favorite_foods || 'not specified'}</favorite_foods>
  <disliked_foods>${user.disliked_foods || 'none'}</disliked_foods>
  <allergies>${user.allergies || 'none'}</allergies>
  <medical_conditions>${user.medical_conditions || 'none'}</medical_conditions>

  <sleep_time>${user.sleep_time || '11:00 PM'}</sleep_time>
  <wake_time>${user.wake_time || '06:30 AM'}</wake_time>
  <work_type>${user.work_type ?? 'sedentary'}</work_type>
  <stress_level>${user.stress_level ?? 'moderate'}</stress_level>
  <meal_timing_pattern>${user.meal_timing_pattern ?? 'standard'}</meal_timing_pattern>

  <expectations>${user.expectations || 'general wellness'}</expectations>
</user_profile>

<vedic_month_context>
  <vedic_month>${month.vedic_month}</vedic_month>
  <paksha>${month.paksha}</paksha>
  <paksha_full>${humanisePaksha(month.paksha)}</paksha_full>
  <vikram_samvat>${month.vikram_samvat}</vikram_samvat>
  <ritu>${month.ritu}</ritu>
  <gregorian_start>${month.gregorian_start}</gregorian_start>
  <gregorian_end>${month.gregorian_end}</gregorian_end>
  <gregorian_start_formatted>${formatVedicDate(month.gregorian_start)}</gregorian_start_formatted>
  <gregorian_end_formatted>${formatVedicDate(month.gregorian_end)}</gregorian_end_formatted>
  <is_adhik_maas>${month.is_adhik_maas ?? false}</is_adhik_maas>
  <month_descriptor>${getMonthDescriptor(month)}</month_descriptor>
  <next_vedic_month>${month.next_vedic_month ?? 'unknown'}</next_vedic_month>
  <next_ritu>${month.next_ritu ?? 'unknown'}</next_ritu>
  <next_delivery_date>${month.next_delivery_date ?? 'unknown'}</next_delivery_date>
</vedic_month_context>

<edition_number>${editionNumber}</edition_number>
<generation_date>${generationDate}</generation_date>
<previous_word_origins_used>${previousOriginsList}</previous_word_origins_used>

<output_template>
${HTML_TEMPLATE}
</output_template>

Produce the complete HTML now, replacing every [[SLOT_NAME]] placeholder with calibrated content. Return only the HTML, starting with <!DOCTYPE html> and ending with </html>. No preamble, no code fences, no commentary.`;
}
