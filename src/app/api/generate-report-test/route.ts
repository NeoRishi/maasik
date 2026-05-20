import { NextRequest, NextResponse } from 'next/server';
import { getAnthropic } from '@/lib/maasik/anthropic-client';
import { SYSTEM_PROMPT } from '@/lib/maasik/system-prompt';
import { buildUserMessage } from '@/lib/maasik/user-message';
import { validateGeneratedHtml } from '@/lib/maasik/validate-html';
import type { MaasikUser } from '@/lib/maasik/helpers';
import type { VedicMonthWithNext } from '@/lib/maasik/user-message';

export const runtime = 'nodejs';
export const maxDuration = 800;

export async function GET(request: NextRequest) {
  const start = Date.now();

  if (request.headers.get('x-test-key') !== process.env.MAASIK_TEST_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const testUser = {
    full_name: 'Hrishikesh Test',
    age: 35,
    gender: 'male',
    city: 'Pune',
    region: 'West India',
    height_cm: 175,
    weight_kg: 89,
    bmi: 29.1,
    prakriti_label: 'Pitta-Kapha',
    vata_score: 1,
    pitta_score: 7,
    kapha_score: 6,
    primary_goals: ['general wellness'],
    goal_specifics: 'gradual weight loss',
    diet_type: 'vegetarian',
    favorite_foods: 'pani puri, pizza, burger',
    disliked_foods: 'okra',
    allergies: 'none',
    medical_conditions: 'none',
    sleep_time: '11:30 PM',
    wake_time: '07:30 AM',
    work_type: 'sedentary tech',
    stress_level: 'moderate',
    meal_timing_pattern: 'regular',
    expectations: 'general wellness',
  } as unknown as MaasikUser;

  const testMonth: VedicMonthWithNext = {
    vedic_month: 'Jyeshtha',
    paksha: 'shukla',
    vikram_samvat: 2083,
    ritu: 'Greeshma',
    gregorian_start: '2026-05-17',
    gregorian_end: '2026-06-15',
    is_adhik_maas: false,
    next_vedic_month: 'Ashadha',
    next_ritu: 'Greeshma',
    next_delivery_date: '2026-06-16',
  };

  const userMessage = buildUserMessage(testUser, testMonth, 2, []);

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 18000,
    temperature: 0.4,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  let html = response.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
    .trim();

  // Strip any accidental preamble/postamble around the HTML document.
  const doctypeIdx = html.indexOf('<!DOCTYPE html>');
  if (doctypeIdx > 0) html = html.slice(doctypeIdx);
  const htmlCloseIdx = html.lastIndexOf('</html>');
  if (htmlCloseIdx >= 0) html = html.slice(0, htmlCloseIdx + '</html>'.length);

  const validation = validateGeneratedHtml(html, testUser);
  const duration_ms = Date.now() - start;
  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors, duration_ms }, { status: 422 });
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-Duration-Ms': String(duration_ms),
    },
  });
}
