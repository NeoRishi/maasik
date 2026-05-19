/**
 * Unit tests for validateGeneratedHtml.
 * Runs as a plain Node script (no jest/vitest dependency).
 *
 * Run from the repo root with:
 *   node --experimental-strip-types src/lib/maasik/validate-html.test.ts
 */

import { validateGeneratedHtml } from './validate-html';
import type { MaasikUser } from './helpers';

const baseUser: MaasikUser = {
  id: 'test-user',
  full_name: 'Hrishikesh Wattamwar',
  email: 'test@example.com',
  age: 33,
  gender: 'male',
  city: 'Pune',
  region: 'Maharashtra',
  height_cm: 175,
  weight_kg: 78,
  bmi: 25.5,
  primary_goals: ['weight_loss'],
  goal_specifics: null,
  prakriti_label: 'pitta_kapha',
  vata_score: 5,
  pitta_score: 11,
  kapha_score: 9,
  diet_type: 'vegetarian',
  favorite_foods: 'rice, dal, mango',
  disliked_foods: 'bittergourd, okra',
  allergies: 'shellfish, peanuts',
  medical_conditions: null,
  sleep_time: '22:30',
  wake_time: '06:30',
  work_type: 'desk',
  stress_level: 'moderate',
  meal_timing_pattern: 'regular',
  expectations: null,
};

function buildValidHtml(opts: { padding?: number } = {}): string {
  const pad = opts.padding ?? 13000;
  const padding = 'x'.repeat(pad);
  return `<!DOCTYPE html>
<html>
<head><title>Maasik report for Hrishikesh</title></head>
<body>
  <section class="cover">
    <div class="cover-quote-eng">"In summer, light cooling food suits the body."</div>
    <div class="cover-quote-sans">अग्निवर्धकं लघ्वन्नं ग्रीष्मे शीतलं हितम्</div>
  </section>
  <section>
    <div class="section-num">01 . YOUR ARCHETYPE</div>
    <h3 class="archetype-name">The Anchored Builder</h3>
    <p>Hrishikesh, the Vedic month invites you to slow down.</p>
    <div class="word-origin"><strong>Jyeshtha</strong> means eldest.</div>
  </section>
  <section>
    <div class="section-num">02 . WHAT IS HAPPENING</div>
    <div class="word-origin"><strong>Agni</strong> means digestive fire.</div>
  </section>
  <section>
    <div class="section-num">03 . EATING FOR THE SEASON</div>
    <div class="food-cols">
      <div class="food-col favor"><h3>Lean in</h3><ul><li>Rice</li><li>Dal</li><li>Mango</li></ul></div>
      <div class="food-col avoid"><h3>Ease off</h3><ul><li>Chilli</li><li>Pickles</li></ul></div>
    </div>
    <div class="word-origin"><strong>Rasa</strong> means taste.</div>
  </section>
  <section>
    <div class="section-num">04 . YOUR DAY</div>
    <div class="word-origin"><strong>Dinacharya</strong> means daily routine.</div>
  </section>
  <section>
    <div class="section-num">05 . FIVE ANCHORS</div>
    <ol class="anchor-numbered">
      <li>Wake by six.</li>
      <li>Walk thirty minutes.</li>
      <li>Eat lunch big.</li>
      <li>Eat dinner small.</li>
      <li>Sleep by ten.</li>
    </ol>
  </section>
  <section>
    <div class="section-num">06 . GROCERY</div>
    <div class="grocery-grid">
      <div class="grocery-card"><h3>Grains</h3><ul><li>Rice · 1 kg</li><li>Wheat · 500 g</li></ul></div>
      <div class="grocery-card"><h3>Pulses</h3><ul><li>Moong · 500 g</li><li>Toor · 500 g</li></ul></div>
      <div class="grocery-card"><h3>Vegetables</h3><ul><li>Bottle gourd · 1 kg</li><li>Ridge gourd · 500 g</li></ul></div>
      <div class="grocery-card"><h3>Fruits</h3><ul><li>Mango · 6 pieces</li><li>Coconut · 1 piece</li></ul></div>
      <div class="grocery-card"><h3>Spices</h3><ul><li>Cumin · 50 g</li><li>Coriander · 50 g</li></ul></div>
      <div class="grocery-card"><h3>Specials</h3><ul><li>Khus syrup · 1 bottle</li></ul></div>
    </div>
  </section>
  <section>
    <div class="section-num">07 . THE LEVER</div>
    <p>Hrishikesh, this is your thread for the month.</p>
    <div class="closing-line">
      <div class="closing-eng">"Eat wholesomely, eat moderately, eat in tune with the season."</div>
      <div class="closing-sans">हितभुक् मितभुक् ऋतभुक्</div>
    </div>
  </section>
  <!-- padding to clear the 12000 char floor: ${padding} -->
</body>
</html>`;
}

interface Case {
  name: string;
  run: () => void;
}

const failures: string[] = [];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const cases: Case[] = [
  {
    name: 'a) valid sample passes',
    run: () => {
      const html = buildValidHtml();
      const result = validateGeneratedHtml(html, baseUser);
      assert(
        result.valid,
        `expected valid; got errors:\n  ${result.errors.join('\n  ')}`,
      );
      assert(result.errors.length === 0, 'expected zero errors');
    },
  },
  {
    name: 'b) em-dash present fails',
    run: () => {
      const html = buildValidHtml().replace(
        'the Vedic month invites you to slow down.',
        'the Vedic month—invites you to slow down.',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('em_dash:')),
        `expected em_dash error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'c) leftover placeholder fails',
    run: () => {
      const html = buildValidHtml().replace(
        'The Anchored Builder',
        '[[ARCHETYPE_NAME]]',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('unfilled_placeholders:')),
        `expected unfilled_placeholders error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'd) forbidden dosha phrase fails',
    run: () => {
      const html = buildValidHtml().replace(
        'this is your thread for the month',
        'you are Pitta-dominant this month',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some(
          (e) => e.startsWith('forbidden_phrase:') && e.includes('Pitta-dominant'),
        ),
        `expected forbidden_phrase Pitta-dominant; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'e) allergy leak in food section fails',
    run: () => {
      const html = buildValidHtml().replace(
        '<li>Coconut · 1 piece</li>',
        '<li>Coconut · 1 piece</li><li>Peanuts chikki · 100 g</li>',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('allergy_leak:')),
        `expected allergy_leak error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'f) wrong anchor count fails',
    run: () => {
      const html = buildValidHtml().replace(
        '<li>Sleep by ten.</li>',
        '<li>Sleep by ten.</li><li>Bonus anchor.</li>',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('anchor_list:') && e.includes('6')),
        `expected anchor_list count error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'g) missing weekly qty on a Vegetables item fails',
    run: () => {
      const html = buildValidHtml().replace(
        '<li>Bottle gourd · 1 kg</li>',
        '<li>Bottle gourd</li>',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('grocery_quantities:') && /Vegetables/i.test(e)),
        `expected grocery_quantities error on Vegetables; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'h) Roman-script cover Sanskrit fails',
    run: () => {
      const html = buildValidHtml().replace(
        'अग्निवर्धकं लघ्वन्नं ग्रीष्मे शीतलं हितम्',
        'agnivardhakam laghvannam greeshme sheetalam hitam',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('sanskrit_script:') && e.includes('cover_verse')),
        `expected sanskrit_script cover_verse error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
  {
    name: 'i) Roman-script closing Sanskrit fails',
    run: () => {
      const html = buildValidHtml().replace(
        'हितभुक् मितभुक् ऋतभुक्',
        'hitabhuk mitabhuk ritubhuk',
      );
      const result = validateGeneratedHtml(html, baseUser);
      assert(!result.valid, 'expected invalid');
      assert(
        result.errors.some((e) => e.startsWith('sanskrit_script:') && e.includes('closing_verse')),
        `expected sanskrit_script closing_verse error; got:\n  ${result.errors.join('\n  ')}`,
      );
    },
  },
];

let passed = 0;
for (const c of cases) {
  try {
    c.run();
    console.log(`  PASS  ${c.name}`);
    passed += 1;
  } catch (err) {
    failures.push(`${c.name}: ${(err as Error).message}`);
    console.log(`  FAIL  ${c.name}`);
    console.log(`        ${(err as Error).message}`);
  }
}

console.log(`\n${passed}/${cases.length} passed`);
if (failures.length > 0) {
  process.exit(1);
}
