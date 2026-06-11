import { describe, it, expect } from 'vitest';
import { convertV1ToV2, formatDateLabel, formatWindowLabel, to12Hour } from '../../v1-to-v2';

const V1_FIXTURE = {
  schema_version: 'maasik.content.v1',
  meta: {
    edition_number: 1,
    generation_date: '2026-06-09',
    first_name: 'srkf',
    city: 'Pune',
    next_edition: { vedic_month: 'Ashadha', ritu: 'Greeshma', delivery_date: '2026-07-15' },
  },
  vedic_context: {
    vedic_month: 'Jyeshtha',
    vedic_month_full_description: 'The eldest month of summer',
    window: { start: '2026-05-17', end: '2026-06-15' },
    ritu: { name: 'Greeshma', descriptor: 'Peak Summer' },
    paksha: 'shukla',
  },
  cover: { subtitle: 'Cool nourishment.', verse: { sanskrit: 'sa', english: 'en' } },
  archetype: {
    lede: 'lede', month_word_origin: { term: 'Jyeshtha', meaning: 'eldest' },
    name: 'The Slow River', tagline: 'tag',
    tendencies: { body: 'Cool, dense, steady', mind: 'Calm', season_asks: 'Nourish' },
    identity_verse: 'verse',
    readout: { city: 'Pune', bmi: 21.6, work_type: 'Sedentary' },
    body_para: 'body', closing_line: 'close',
  },
  whats_happening: {
    title: 't', lede: 'l', agni_meaning: 'agni',
    heat_flow: {
      left: { label: 'Cool months', state: 'gut', icon: 'x' },
      right: { label: 'Peak summer', state: 'skin', icon: 'y' },
    },
    intersection_para: 'p',
    fronts: [
      { title: 'Front one', body: 'b1' },
      { title: 'Front two', body: 'b2' },
    ],
  },
  taste_map: {
    lede: 'l', caption: 'c', legend: { lean: 'Lean in', ease: 'Ease off' },
    favor: [{ name: 'Sweet', sanskrit: 'Madhura' }],
    avoid: [{ name: 'Salty', sanskrit: 'Lavana' }],
    foods_favor: [{ category: 'Grains', items: ['Rice'] }],
    foods_avoid: [{ category: 'Snacks', items: ['Pizza'] }],
  },
  day_plan: {
    title: 't', lede: 'l', dinacharya_meaning: 'd',
    anchors: [
      { key: 'waking', time: '06:30', name: 'On waking', detail: 'water', major: false },
      { key: 'lunch', time: '13:00', name: 'Lunch (largest)', detail: 'rice', major: true },
    ],
  },
  five_anchors: {
    lede: 'l',
    rules: [
      { title: 'Lunch is the largest meal, always', detail: 'd1' },
      { title: 'Walk before 8 AM, not after', detail: 'd2' },
    ],
    avoid: ['No cold drinks'],
  },
  grocery: {
    lede: 'l', specials_title: 'Specials',
    cards: [{ title: 'Grains & Pulses', items: [{ name: 'Rice', qty: '1 kg' }] }],
  },
  commitment: {
    opening: 'o', thread_para: 't', lever_line: 'Lunch big.', closing_para: 'c',
    verse: { sanskrit: 's', english: 'e' },
  },
  visuals: {
    cover_gradient: { primary_rgba: 'rgba(1,2,3,0.1)', accent_rgba: 'rgba(4,5,6,0.2)', derivable: true },
    heat_flow_left: { icon_svg: '<svg/>', derivable: true },
    heat_flow_right: { icon_svg: '<svg/>', derivable: true },
    day_chart: { svg: '<svg/>', derivable: true },
  },
  time_views: { week_note: 'wk' },
};

describe('helpers', () => {
  it('formatDateLabel converts ISO dates and passes labels through', () => {
    expect(formatDateLabel('2026-06-09')).toBe('9 June 2026');
    expect(formatDateLabel('mid-July 2026')).toBe('mid-July 2026');
    expect(formatDateLabel(undefined)).toBe('');
  });
  it('formatWindowLabel builds the display window', () => {
    expect(formatWindowLabel('2026-05-17', '2026-06-15')).toBe('17 May to 15 Jun 2026');
  });
  it('to12Hour converts 24h times and passes labels through', () => {
    expect(to12Hour('06:30')).toBe('06:30 AM');
    expect(to12Hour('13:00')).toBe('01:00 PM');
    expect(to12Hour('01:00 PM')).toBe('01:00 PM');
  });
});

describe('convertV1ToV2', () => {
  const out = convertV1ToV2(V1_FIXTURE as any, {
    sourceRef: 'report:abc',
    generatedAt: '2026-06-10T00:00:00.000Z',
    paksha: 'shukla',
  });
  const p = out.presentation as any;

  it('produces the v2 envelope', () => {
    expect(out.schema_version).toBe('maasik.content.v2');
    expect(out.source_ref).toBe('report:abc');
    expect(out.template_version).toBe('v1-llm-extraction-converted');
  });

  it('maps meta and vedic_context to label fields', () => {
    expect(p.meta.generation_date_label).toBe('9 June 2026');
    expect(p.meta.next_edition.delivery_date).toBe('15 July 2026');
    expect(p.vedic_context.window_label).toBe('17 May to 15 Jun 2026');
    expect(p.vedic_context.ritu_label).toBe('Greeshma, Peak Summer');
    expect(p.vedic_context.paksha).toBe('shukla');
  });

  it('synthesizes readout_label and strips v1-only keys', () => {
    expect(p.archetype.readout_label).toBe('Pune · BMI 21.6 · Sedentary');
    expect(p.archetype.readout).toBeUndefined();
    expect(p.whats_happening.heat_flow.left.icon).toBeUndefined();
    expect(p.day_plan.anchors[0].key).toBeUndefined();
    expect(p.grocery.cards[0].title).toBeUndefined();
    expect(p.visuals.cover_gradient.derivable).toBeUndefined();
  });

  it('converts anchor times to 12h display', () => {
    expect(p.day_plan.anchors[0].time).toBe('06:30 AM');
    expect(p.day_plan.anchors[1].time).toBe('01:00 PM');
  });

  it('synthesizes signals and directives deterministically', () => {
    const signals = out.signals as any[];
    const directives = out.directives as any[];
    expect(signals.map((s) => s.id)).toEqual([
      'maasik:signal:archetype.tendency_body',
      'maasik:signal:archetype.tendency_mind',
      'maasik:signal:agni.front_1_title',
      'maasik:signal:agni.front_2_title',
    ]);
    // 1 favor + 1 avoid taste + 2 rules + 1 avoid + 1 lever = 6
    expect(directives).toHaveLength(6);
    const walk = directives.find((d) => d.statement.startsWith('Walk'));
    expect(walk.pillar).toBe('vihaar');
    expect(walk.trackable).toBe(true);
    const lever = directives.find((d) => d.kind === 'commitment');
    expect(lever.statement).toBe('Lunch big.');
  });

  it('carries time_views through and never throws on empty input', () => {
    expect((out as any).time_views.week_note).toBe('wk');
    const empty = convertV1ToV2({}, { sourceRef: 'r', generatedAt: 'g' });
    expect(empty.schema_version).toBe('maasik.content.v2');
    expect((empty.presentation as any).vedic_context.paksha).toBe('shukla');
  });
});
