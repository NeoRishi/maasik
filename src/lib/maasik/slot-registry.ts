// Maasik SLOT_REGISTRY — single source of truth for the 95 template slots.
//
// This module is infrastructure, not parser config. It is the only place a
// slot name is ever written. Everything else (template instrumentation, the
// Option A parser, the golden-file tests, and the future Option C renderer)
// imports from here. Edit the registry once; the type system forces every
// consumer to follow.
//
// SCOPE: this registry is PURELY STRUCTURAL. It answers "what exists in the
// document, where, and how do we extract it". It deliberately says nothing
// about what the content MEANS to NeoRishi. That interpretation layer lives in
// `routing-registry.ts`, keyed by semantic_id, so it can evolve with the
// ontology (and admit non-slot producers like Dinacharya) while the slot
// structure stays frozen to the template.
//
// Identifier hierarchy (per founder approval, 7 Jun 2026):
//   semantic_id -> slot -> hook -> extractor -> presentation_path
//
//   semantic_id  long-lived DOMAIN contract. Survives slot renames, template
//                version bumps, and renderer-strategy changes. Migrations and
//                routing rules reason over this, never over `slot`.
//   slot         template-era [[TOKEN]]. Belongs to HTML_TEMPLATE_VERSION.
//   hook         the data-slot attribute value. Derived from `slot`.
//   extractor    deterministic extraction strategy the parser dispatches on.
//   presentation_path  where the extracted value lands in content_json.presentation.
//
// Bound to HTML_TEMPLATE_VERSION 'v4.0' (95 slots). A load-time assertion
// fails fast if the registry and the template ever drift.

import {
  HTML_TEMPLATE_VERSION,
  HTML_TEMPLATE_PLACEHOLDER_COUNT,
} from './html-template';

export type SlotKind = 'scalar' | 'structured' | 'visual';

export type SlotExtractor =
  | 'text' // textContent of the hooked element (verbatim)
  | 'rgba' // a literal rgba(...) value carried in CSS
  | 'svg-inner' // innerHTML of an <svg> icon (viewBox 0 0 56 56)
  | 'svg-groups' // the 4 ordered <g> groups of the day chart (viewBox 0 0 700 320)
  | 'rows-food' // 6x <li><strong>Category</strong>items</li>
  | 'rows-anchor' // 7 day-plan rows (time / name / detail)
  | 'list-grocery'; // <li>Name · qty</li> list

// How the value is anchored in the rendered HTML.
//   'data-slot'  the parser finds it via [data-slot="<hook>"].
//   'css'        the value lives in CSS (radial-gradient); the parser reads it
//                with a targeted regex. These slots cannot carry a data-slot
//                attribute without changing render output, so they stay in CSS
//                to preserve byte parity.
export type SlotInstrumentation = 'data-slot' | 'css';

export interface SlotEntry {
  semantic_id: string; // long-lived domain contract
  slot: string; // template [[TOKEN]]
  hook: string; // data-slot attribute value (derived from slot)
  kind: SlotKind;
  extractor: SlotExtractor;
  instrumentation: SlotInstrumentation;
  presentation_path: string; // dot/bracket path into content_json.presentation
}

// Compact authoring shape; `hook` is derived so it can never typo out of sync.
type RawEntry = Omit<SlotEntry, 'hook'>;

function toHook(slot: string): string {
  return slot.toLowerCase().replace(/_/g, '-');
}

// ---------------------------------------------------------------------------
// The 95 slots, grouped by template region. Order mirrors the document.
// ---------------------------------------------------------------------------
const RAW: RawEntry[] = [
  // ----- Cover + meta -----
  { semantic_id: 'vedic.month_name', slot: 'VEDIC_MONTH', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.vedic_month' },
  { semantic_id: 'meta.edition_number', slot: 'EDITION_NUMBER', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.edition_number' },
  { semantic_id: 'meta.generation_date', slot: 'GENERATION_DATE_HUMAN', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.generation_date_label' },
  { semantic_id: 'cover.gradient_primary', slot: 'COVER_GRADIENT_PRIMARY_RGBA', kind: 'visual', extractor: 'rgba', instrumentation: 'css', presentation_path: 'visuals.cover_gradient.primary_rgba' },
  { semantic_id: 'cover.gradient_accent', slot: 'COVER_GRADIENT_ACCENT_RGBA', kind: 'visual', extractor: 'rgba', instrumentation: 'css', presentation_path: 'visuals.cover_gradient.accent_rgba' },
  { semantic_id: 'cover.subtitle', slot: 'COVER_SUBTITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'cover.subtitle' },
  { semantic_id: 'cover.verse_english', slot: 'COVER_VERSE_ENGLISH', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'cover.verse.english' },
  { semantic_id: 'cover.verse_sanskrit', slot: 'COVER_VERSE_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'cover.verse.sanskrit' },
  { semantic_id: 'subject.first_name', slot: 'FIRST_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.first_name' },
  { semantic_id: 'subject.city', slot: 'CITY', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.city' },
  { semantic_id: 'vedic.month_description', slot: 'VEDIC_MONTH_FULL_DESCRIPTION', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.vedic_month_full_description' },
  { semantic_id: 'vedic.window_gregorian', slot: 'VEDIC_WINDOW_GREGORIAN', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.window_label' },
  { semantic_id: 'vedic.ritu_label', slot: 'RITU_NAME_WITH_DESCRIPTOR', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.ritu_label' },

  // ----- Section 01 · Archetype -----
  { semantic_id: 'vedic.ritu_name', slot: 'RITU_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.ritu.name' },
  { semantic_id: 'vedic.ritu_descriptor', slot: 'RITU_DESCRIPTOR', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'vedic_context.ritu.descriptor' },
  { semantic_id: 'archetype.lede', slot: 'SECTION_01_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.lede' },
  { semantic_id: 'archetype.month_word_term', slot: 'MONTH_WORD_ORIGIN_TERM', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.month_word_origin.term' },
  { semantic_id: 'archetype.month_word_meaning', slot: 'MONTH_WORD_ORIGIN_MEANING', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.month_word_origin.meaning' },
  { semantic_id: 'archetype.name', slot: 'ARCHETYPE_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.name' },
  { semantic_id: 'archetype.tagline', slot: 'ARCHETYPE_TAGLINE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.tagline' },
  { semantic_id: 'archetype.tendency_body', slot: 'TENDENCY_BODY', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.tendencies.body' },
  { semantic_id: 'archetype.tendency_mind', slot: 'TENDENCY_MIND', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.tendencies.mind' },
  { semantic_id: 'archetype.tendency_season_asks', slot: 'TENDENCY_SEASON_ASKS', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.tendencies.season_asks' },
  { semantic_id: 'archetype.identity_verse', slot: 'IDENTITY_VERSE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.identity_verse' },
  { semantic_id: 'archetype.readout_strip', slot: 'READOUT_STRIP', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.readout_label' },
  { semantic_id: 'archetype.body_paragraph', slot: 'SECTION_01_BODY_PARA', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.body_para' },
  { semantic_id: 'archetype.closing_line', slot: 'SECTION_01_CLOSING_LINE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'archetype.closing_line' },

  // ----- Section 02 · What's happening (Agni) -----
  { semantic_id: 'agni.title', slot: 'SECTION_02_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.title' },
  { semantic_id: 'agni.lede', slot: 'SECTION_02_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.lede' },
  { semantic_id: 'agni.heat_flow_left_icon', slot: 'HEAT_FLOW_LEFT_ICON_SVG', kind: 'visual', extractor: 'svg-inner', instrumentation: 'data-slot', presentation_path: 'visuals.heat_flow_left.icon_svg' },
  { semantic_id: 'agni.heat_flow_left_label', slot: 'HEAT_FLOW_LEFT_LABEL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.heat_flow.left.label' },
  { semantic_id: 'agni.heat_flow_left_state', slot: 'HEAT_FLOW_LEFT_STATE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.heat_flow.left.state' },
  { semantic_id: 'agni.heat_flow_right_icon', slot: 'HEAT_FLOW_RIGHT_ICON_SVG', kind: 'visual', extractor: 'svg-inner', instrumentation: 'data-slot', presentation_path: 'visuals.heat_flow_right.icon_svg' },
  { semantic_id: 'agni.heat_flow_right_label', slot: 'HEAT_FLOW_RIGHT_LABEL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.heat_flow.right.label' },
  { semantic_id: 'agni.heat_flow_right_state', slot: 'HEAT_FLOW_RIGHT_STATE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.heat_flow.right.state' },
  { semantic_id: 'agni.meaning', slot: 'SECTION_02_AGNI_MEANING', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.agni_meaning' },
  { semantic_id: 'agni.intersection_para', slot: 'SECTION_02_INTERSECTION_PARA', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.intersection_para' },
  { semantic_id: 'agni.front_1_title', slot: 'FRONT_1_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.fronts[0].title' },
  { semantic_id: 'agni.front_1_body', slot: 'FRONT_1_BODY', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.fronts[0].body' },
  { semantic_id: 'agni.front_2_title', slot: 'FRONT_2_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.fronts[1].title' },
  { semantic_id: 'agni.front_2_body', slot: 'FRONT_2_BODY', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'whats_happening.fronts[1].body' },

  // ----- Section 03 · Taste map (Aahar) -----
  { semantic_id: 'taste.lede', slot: 'SECTION_03_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.lede' },
  { semantic_id: 'taste.legend_lean', slot: 'LEGEND_LEAN_LABEL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.legend.lean' },
  { semantic_id: 'taste.legend_ease', slot: 'LEGEND_EASE_LABEL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.legend.ease' },
  { semantic_id: 'taste.favor_1_name', slot: 'TASTE_FAVOR_1_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[0].name' },
  { semantic_id: 'taste.favor_1_sanskrit', slot: 'TASTE_FAVOR_1_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[0].sanskrit' },
  { semantic_id: 'taste.favor_2_name', slot: 'TASTE_FAVOR_2_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[1].name' },
  { semantic_id: 'taste.favor_2_sanskrit', slot: 'TASTE_FAVOR_2_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[1].sanskrit' },
  { semantic_id: 'taste.favor_3_name', slot: 'TASTE_FAVOR_3_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[2].name' },
  { semantic_id: 'taste.favor_3_sanskrit', slot: 'TASTE_FAVOR_3_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.favor[2].sanskrit' },
  { semantic_id: 'taste.avoid_1_name', slot: 'TASTE_AVOID_1_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[0].name' },
  { semantic_id: 'taste.avoid_1_sanskrit', slot: 'TASTE_AVOID_1_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[0].sanskrit' },
  { semantic_id: 'taste.avoid_2_name', slot: 'TASTE_AVOID_2_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[1].name' },
  { semantic_id: 'taste.avoid_2_sanskrit', slot: 'TASTE_AVOID_2_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[1].sanskrit' },
  { semantic_id: 'taste.avoid_3_name', slot: 'TASTE_AVOID_3_NAME', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[2].name' },
  { semantic_id: 'taste.avoid_3_sanskrit', slot: 'TASTE_AVOID_3_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.avoid[2].sanskrit' },
  { semantic_id: 'taste.caption', slot: 'SECTION_03_CAPTION', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'taste_map.caption' },
  { semantic_id: 'taste.foods_favor', slot: 'FOOD_FAVOR_ROWS', kind: 'structured', extractor: 'rows-food', instrumentation: 'data-slot', presentation_path: 'taste_map.foods_favor' },
  { semantic_id: 'taste.foods_avoid', slot: 'FOOD_AVOID_ROWS', kind: 'structured', extractor: 'rows-food', instrumentation: 'data-slot', presentation_path: 'taste_map.foods_avoid' },

  // ----- Section 04 · Day plan -----
  { semantic_id: 'day_plan.title', slot: 'SECTION_04_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'day_plan.title' },
  { semantic_id: 'day_plan.lede', slot: 'SECTION_04_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'day_plan.lede' },
  { semantic_id: 'day_plan.dinacharya_meaning', slot: 'DINACHARYA_MEANING', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'day_plan.dinacharya_meaning' },
  { semantic_id: 'day_plan.day_chart', slot: 'DAY_CHART_DYNAMIC_CONTENT', kind: 'visual', extractor: 'svg-groups', instrumentation: 'data-slot', presentation_path: 'visuals.day_chart.svg' },
  { semantic_id: 'day_plan.anchor_table', slot: 'ANCHOR_TABLE_ROWS', kind: 'structured', extractor: 'rows-anchor', instrumentation: 'data-slot', presentation_path: 'day_plan.anchors' },

  // ----- Section 05 · Five anchors -----
  { semantic_id: 'five_anchors.lede', slot: 'SECTION_05_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.lede' },
  { semantic_id: 'five_anchors.anchor_1_title', slot: 'ANCHOR_01_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[0].title' },
  { semantic_id: 'five_anchors.anchor_1_detail', slot: 'ANCHOR_01_DETAIL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[0].detail' },
  { semantic_id: 'five_anchors.anchor_2_title', slot: 'ANCHOR_02_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[1].title' },
  { semantic_id: 'five_anchors.anchor_2_detail', slot: 'ANCHOR_02_DETAIL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[1].detail' },
  { semantic_id: 'five_anchors.anchor_3_title', slot: 'ANCHOR_03_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[2].title' },
  { semantic_id: 'five_anchors.anchor_3_detail', slot: 'ANCHOR_03_DETAIL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[2].detail' },
  { semantic_id: 'five_anchors.anchor_4_title', slot: 'ANCHOR_04_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[3].title' },
  { semantic_id: 'five_anchors.anchor_4_detail', slot: 'ANCHOR_04_DETAIL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[3].detail' },
  { semantic_id: 'five_anchors.anchor_5_title', slot: 'ANCHOR_05_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[4].title' },
  { semantic_id: 'five_anchors.anchor_5_detail', slot: 'ANCHOR_05_DETAIL', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.rules[4].detail' },
  { semantic_id: 'five_anchors.avoid_1', slot: 'AVOID_01', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.avoid[0]' },
  { semantic_id: 'five_anchors.avoid_2', slot: 'AVOID_02', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.avoid[1]' },
  { semantic_id: 'five_anchors.avoid_3', slot: 'AVOID_03', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'five_anchors.avoid[2]' },

  // ----- Section 06 · Grocery -----
  { semantic_id: 'grocery.lede', slot: 'SECTION_06_LEDE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'grocery.lede' },
  { semantic_id: 'grocery.card_1_items', slot: 'GROCERY_CARD_1_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[0].items' },
  { semantic_id: 'grocery.card_2_items', slot: 'GROCERY_CARD_2_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[1].items' },
  { semantic_id: 'grocery.card_3_items', slot: 'GROCERY_CARD_3_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[2].items' },
  { semantic_id: 'grocery.card_4_items', slot: 'GROCERY_CARD_4_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[3].items' },
  { semantic_id: 'grocery.card_5_items', slot: 'GROCERY_CARD_5_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[4].items' },
  { semantic_id: 'grocery.specials_title', slot: 'GROCERY_SPECIALS_TITLE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'grocery.specials_title' },
  { semantic_id: 'grocery.card_6_items', slot: 'GROCERY_CARD_6_ITEMS', kind: 'structured', extractor: 'list-grocery', instrumentation: 'data-slot', presentation_path: 'grocery.cards[5].items' },

  // ----- Section 07 · Commitment -----
  { semantic_id: 'commitment.opening', slot: 'COMMIT_OPENING', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.opening' },
  { semantic_id: 'commitment.thread_para', slot: 'COMMIT_THREAD_PARA', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.thread_para' },
  { semantic_id: 'commitment.lever_line', slot: 'LEVER_LINE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.lever_line' },
  { semantic_id: 'commitment.closing_para', slot: 'COMMIT_CLOSING_PARA', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.closing_para' },
  { semantic_id: 'commitment.verse_english', slot: 'CLOSING_VERSE_ENGLISH', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.verse.english' },
  { semantic_id: 'commitment.verse_sanskrit', slot: 'CLOSING_VERSE_SANSKRIT', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'commitment.verse.sanskrit' },

  // ----- Footer -----
  { semantic_id: 'footer.next_vedic_month', slot: 'FOOTER_NEXT_EDITION_VEDIC_MONTH', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.next_edition.vedic_month' },
  { semantic_id: 'footer.next_ritu', slot: 'FOOTER_NEXT_EDITION_RITU', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.next_edition.ritu' },
  { semantic_id: 'footer.next_delivery_date', slot: 'FOOTER_NEXT_DELIVERY_DATE', kind: 'scalar', extractor: 'text', instrumentation: 'data-slot', presentation_path: 'meta.next_edition.delivery_date' },
];

export const SLOT_REGISTRY: readonly SlotEntry[] = RAW.map((e) => ({
  ...e,
  hook: toHook(e.slot),
}));

// ---------------------------------------------------------------------------
// Derived lookups. Consumers read these, never the raw array directly.
// ---------------------------------------------------------------------------
export const SLOT_BY_SEMANTIC_ID: ReadonlyMap<string, SlotEntry> = new Map(
  SLOT_REGISTRY.map((e) => [e.semantic_id, e]),
);
export const SLOT_BY_SLOT: ReadonlyMap<string, SlotEntry> = new Map(
  SLOT_REGISTRY.map((e) => [e.slot, e]),
);
export const SLOT_BY_HOOK: ReadonlyMap<string, SlotEntry> = new Map(
  SLOT_REGISTRY.map((e) => [e.hook, e]),
);
export const SLOT_NAMES: ReadonlySet<string> = new Set(
  SLOT_REGISTRY.map((e) => e.slot),
);

// ---------------------------------------------------------------------------
// Load-time drift detection. Throwing here turns any template/registry
// mismatch into an immediate, loud failure rather than silent data loss.
// ---------------------------------------------------------------------------
(function assertRegistryIntegrity(): void {
  const n = SLOT_REGISTRY.length;
  if (n !== HTML_TEMPLATE_PLACEHOLDER_COUNT) {
    throw new Error(
      `SLOT_REGISTRY drift: ${n} entries but template ${HTML_TEMPLATE_VERSION} ` +
        `declares ${HTML_TEMPLATE_PLACEHOLDER_COUNT} placeholders.`,
    );
  }
  const uniq = (key: keyof SlotEntry) => {
    const seen = new Set<string>();
    for (const e of SLOT_REGISTRY) {
      const v = e[key] as string;
      if (seen.has(v)) {
        throw new Error(`SLOT_REGISTRY duplicate ${key}: "${v}".`);
      }
      seen.add(v);
    }
  };
  uniq('semantic_id');
  uniq('slot');
  uniq('hook');
})();
