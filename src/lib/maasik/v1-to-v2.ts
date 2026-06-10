/**
 * src/lib/maasik/v1-to-v2.ts
 *
 * Converts a content_json v1 object (produced by the LLM transcription in
 * extract-content-json.ts) into the maasik.content.v2 shape that the NeoRishi
 * in-app dashboard consumes (presentation tree + signals + directives).
 *
 * Why this exists: historical report HTML predates template v4.1 and has no
 * data-slot hooks, so the deterministic parser cannot run on it (by
 * construction, see MAASIK_PARSER_PRODUCTION_READINESS.md). The v1 LLM
 * extraction works on any HTML; this converter lifts its output to v2 so the
 * app renders it. It is also the fallback path for fresh reports if the
 * parser ever fails.
 *
 * Pure and deterministic given the same v1 input. Never throws on missing
 * fields: absent v1 values become empty strings/arrays, mirroring the v1
 * prompt contract ("never drop a key").
 */

type Dict = Record<string, any>;

export interface ConvertContext {
  sourceRef: string;      // e.g. `report:<uuid>`
  generatedAt: string;    // ISO timestamp
  /** Paksha from the report row; v1 carries it too but the DB row is authoritative. */
  paksha?: string | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2026-06-09' -> '9 June 2026'. Non-dates pass through untouched. */
export function formatDateLabel(value: unknown): string {
  if (typeof value !== 'string') return '';
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value; // already a label ("mid-July 2026") or free text
  const [, y, mo, d] = m;
  const monthName = MONTHS[Number(mo) - 1] ?? mo;
  return `${Number(d)} ${monthName} ${y}`;
}

/** '2026-05-17'..'2026-06-15' -> '17 May to 15 Jun 2026'. */
export function formatWindowLabel(start: unknown, end: unknown): string {
  const f = (v: unknown, withYear: boolean): string => {
    if (typeof v !== 'string') return '';
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return v;
    const [, y, mo, d] = m;
    const short = (MONTHS[Number(mo) - 1] ?? mo).slice(0, 3);
    return withYear ? `${Number(d)} ${short} ${y}` : `${Number(d)} ${short}`;
  };
  const s = f(start, false);
  const e = f(end, true);
  if (!s && !e) return '';
  return `${s} to ${e}`;
}

/** '13:00' / '06:30' -> '01:00 PM' / '06:30 AM'. Already-formatted values pass through. */
export function to12Hour(value: unknown): string {
  if (typeof value !== 'string') return '';
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return value;
  let h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m[2]} ${suffix}`;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Dict => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Dict) : {});

function inferRulePillar(title: string): 'aahar' | 'vihaar' {
  return /walk|sleep|wake|move|exercise|bed|rest|sun/i.test(title) ? 'vihaar' : 'aahar';
}

/** Lift a v1 content_json object into the maasik.content.v2 shape. */
export function convertV1ToV2(v1: Dict, ctx: ConvertContext): Dict {
  const meta = obj(v1.meta);
  const vc = obj(v1.vedic_context);
  const ritu = obj(vc.ritu);
  const arche = obj(v1.archetype);
  const readout = obj(arche.readout);
  const wh = obj(v1.whats_happening);
  const hf = obj(wh.heat_flow);
  const hfL = obj(hf.left);
  const hfR = obj(hf.right);
  const tm = obj(v1.taste_map);
  const dp = obj(v1.day_plan);
  const fa = obj(v1.five_anchors);
  const gr = obj(v1.grocery);
  const cm = obj(v1.commitment);
  const vis = obj(v1.visuals);
  const nextEd = obj(meta.next_edition);
  const window = obj(vc.window);

  const presentation = {
    meta: {
      edition_number: meta.edition_number ?? '',
      first_name: str(meta.first_name),
      city: str(meta.city),
      generation_date_label: formatDateLabel(meta.generation_date),
      next_edition: {
        vedic_month: str(nextEd.vedic_month),
        ritu: str(nextEd.ritu),
        delivery_date: formatDateLabel(nextEd.delivery_date),
      },
    },
    vedic_context: {
      vedic_month: str(vc.vedic_month),
      vedic_month_full_description: str(vc.vedic_month_full_description),
      window_label: formatWindowLabel(window.start, window.end),
      ritu: { name: str(ritu.name), descriptor: str(ritu.descriptor) },
      ritu_label: [str(ritu.name), str(ritu.descriptor)].filter(Boolean).join(', '),
      paksha: str(ctx.paksha ?? vc.paksha) || 'shukla',
    },
    cover: {
      subtitle: str(obj(v1.cover).subtitle),
      verse: {
        english: str(obj(obj(v1.cover).verse).english),
        sanskrit: str(obj(obj(v1.cover).verse).sanskrit),
      },
    },
    archetype: {
      lede: str(arche.lede),
      month_word_origin: {
        term: str(obj(arche.month_word_origin).term),
        meaning: str(obj(arche.month_word_origin).meaning),
      },
      name: str(arche.name),
      tagline: str(arche.tagline),
      tendencies: {
        body: str(obj(arche.tendencies).body),
        mind: str(obj(arche.tendencies).mind),
        season_asks: str(obj(arche.tendencies).season_asks),
      },
      identity_verse: str(arche.identity_verse),
      readout_label: [
        str(readout.city),
        readout.bmi ? `BMI ${readout.bmi}` : '',
        str(readout.work_type),
      ].filter(Boolean).join(' · '),
      body_para: str(arche.body_para),
      closing_line: str(arche.closing_line),
    },
    whats_happening: {
      title: str(wh.title),
      lede: str(wh.lede),
      agni_meaning: str(wh.agni_meaning),
      intersection_para: str(wh.intersection_para),
      heat_flow: {
        left: { label: str(hfL.label), state: str(hfL.state) },
        right: { label: str(hfR.label), state: str(hfR.state) },
      },
      fronts: arr(wh.fronts).map((f) => ({ title: str(obj(f).title), body: str(obj(f).body) })),
    },
    taste_map: {
      lede: str(tm.lede),
      caption: str(tm.caption),
      legend: { lean: str(obj(tm.legend).lean), ease: str(obj(tm.legend).ease) },
      favor: arr(tm.favor).map((t) => ({ name: str(obj(t).name), sanskrit: str(obj(t).sanskrit) })),
      avoid: arr(tm.avoid).map((t) => ({ name: str(obj(t).name), sanskrit: str(obj(t).sanskrit) })),
      foods_favor: arr(tm.foods_favor).map((g) => ({
        category: str(obj(g).category),
        items: arr(obj(g).items).map(str),
      })),
      foods_avoid: arr(tm.foods_avoid).map((g) => ({
        category: str(obj(g).category),
        items: arr(obj(g).items).map(str),
      })),
    },
    day_plan: {
      title: str(dp.title),
      lede: str(dp.lede),
      dinacharya_meaning: str(dp.dinacharya_meaning),
      anchors: arr(dp.anchors).map((a) => ({
        time: to12Hour(obj(a).time),
        name: str(obj(a).name),
        detail: str(obj(a).detail),
      })),
    },
    five_anchors: {
      lede: str(fa.lede),
      rules: arr(fa.rules).map((r) => ({ title: str(obj(r).title), detail: str(obj(r).detail) })),
      avoid: arr(fa.avoid).map(str),
    },
    grocery: {
      lede: str(gr.lede),
      specials_title: str(gr.specials_title),
      cards: arr(gr.cards).map((c) => ({
        items: arr(obj(c).items).map((i) => ({ name: str(obj(i).name), qty: str(obj(i).qty) })),
      })),
    },
    commitment: {
      opening: str(cm.opening),
      thread_para: str(cm.thread_para),
      lever_line: str(cm.lever_line),
      closing_para: str(cm.closing_para),
      verse: { english: str(obj(cm.verse).english), sanskrit: str(obj(cm.verse).sanskrit) },
    },
    visuals: {
      cover_gradient: {
        primary_rgba: str(obj(vis.cover_gradient).primary_rgba),
        accent_rgba: str(obj(vis.cover_gradient).accent_rgba),
      },
      heat_flow_left: { icon_svg: str(obj(vis.heat_flow_left).icon_svg) },
      heat_flow_right: { icon_svg: str(obj(vis.heat_flow_right).icon_svg) },
      day_chart: { svg: str(obj(vis.day_chart).svg) },
    },
  };

  // -- Semantic layer, synthesized deterministically from fixed v1 positions --
  const signals: Dict[] = [];
  const t = presentation.archetype.tendencies;
  if (t.body) {
    signals.push({
      id: 'maasik:signal:archetype.tendency_body', kind: 'observation', pillar: null,
      statement: t.body, scope: { grain: 'month' }, polarity: 'neutral',
      source_slots: ['TENDENCY_BODY'],
    });
  }
  if (t.mind) {
    signals.push({
      id: 'maasik:signal:archetype.tendency_mind', kind: 'observation', pillar: null,
      statement: t.mind, scope: { grain: 'month' }, polarity: 'neutral',
      source_slots: ['TENDENCY_MIND'],
    });
  }
  presentation.whats_happening.fronts.forEach((f, i) => {
    if (!f.title) return;
    signals.push({
      id: `maasik:signal:agni.front_${i + 1}_title`, kind: 'observation', pillar: null,
      statement: f.title, detail: f.body || undefined, scope: { grain: 'month' },
      polarity: 'neutral', source_slots: [`FRONT_${i + 1}_TITLE`, `FRONT_${i + 1}_BODY`],
    });
  });

  const directives: Dict[] = [];
  presentation.taste_map.favor.forEach((tt, i) => {
    if (!tt.name) return;
    directives.push({
      id: `maasik:directive:taste.favor_${i + 1}_name`, kind: 'recommendation', pillar: 'aahar',
      statement: tt.name, scope: { grain: 'month' }, polarity: 'do', trackable: false,
      source_slots: [`TASTE_FAVOR_${i + 1}_NAME`],
    });
  });
  presentation.taste_map.avoid.forEach((tt, i) => {
    if (!tt.name) return;
    directives.push({
      id: `maasik:directive:taste.avoid_${i + 1}_name`, kind: 'recommendation', pillar: 'aahar',
      statement: tt.name, scope: { grain: 'month' }, polarity: 'avoid', trackable: false,
      source_slots: [`TASTE_AVOID_${i + 1}_NAME`],
    });
  });
  presentation.five_anchors.rules.forEach((r, i) => {
    if (!r.title) return;
    const n = String(i + 1).padStart(2, '0');
    directives.push({
      id: `maasik:directive:five_anchors.anchor_${i + 1}_title`, kind: 'practice',
      pillar: inferRulePillar(r.title), statement: r.title, detail: r.detail || undefined,
      scope: { grain: 'month' }, polarity: 'do', trackable: true,
      source_slots: [`ANCHOR_${n}_TITLE`, `ANCHOR_${n}_DETAIL`],
    });
  });
  presentation.five_anchors.avoid.forEach((a, i) => {
    if (!a) return;
    directives.push({
      id: `maasik:directive:five_anchors.avoid_${i + 1}`, kind: 'practice', pillar: 'aahar',
      statement: a, scope: { grain: 'month' }, polarity: 'avoid', trackable: true,
      source_slots: [`AVOID_${String(i + 1).padStart(2, '0')}`],
    });
  });
  if (presentation.commitment.lever_line) {
    directives.push({
      id: 'maasik:directive:commitment.lever_line', kind: 'commitment', pillar: null,
      statement: presentation.commitment.lever_line, scope: { grain: 'month' },
      polarity: 'do', trackable: true, source_slots: ['LEVER_LINE'],
    });
  }

  return {
    schema_version: 'maasik.content.v2',
    template_version: 'v1-llm-extraction-converted',
    source_ref: ctx.sourceRef,
    generated_at: ctx.generatedAt,
    presentation,
    signals,
    directives,
    // Carried through for future Day/Week views; not part of the v2 consumer
    // contract (extra key, harmless to readers).
    time_views: v1.time_views ?? null,
  };
}
