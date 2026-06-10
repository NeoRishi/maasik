// Maasik ROUTING_REGISTRY — how NeoRishi INTERPRETS Maasik document content.
//
// PRODUCER-SPECIFIC. This is Maasik's concrete rule set. The rule TYPES and the
// classification vocabulary are producer-agnostic and live in the shared
// intelligence layer (src/lib/intelligence/); this file imports them and owns
// only the 20 Maasik mappings plus their integrity check.
//
// Separate from slot-registry.ts on purpose:
//   * template changes      -> slot-registry.ts
//   * ontology / product    -> routing-registry.ts
//
// Rules are keyed by `semantic_id`, the long-lived domain key, NOT by slot, so
// interpretation stays producer-agnostic in shape.

import { SLOT_BY_SEMANTIC_ID } from './slot-registry';
import type { RoutingRule, SignalRule, DirectiveRule } from '../intelligence/routing';

// Re-export the shared types so existing `from './routing-registry'` imports
// keep working while the canonical definitions live in intelligence/.
export type { Pillar, Grain, SignalKind, DirectiveKind } from '../intelligence/ontology';
export type { RoutingRule, SignalRule, DirectiveRule } from '../intelligence/routing';

// ---------------------------------------------------------------------------
// The Maasik routing rules. 20 of the 95 slots mint a semantic node today; the
// rest are presentation copy only. Expanding interpretation = adding rules
// here, with zero change to slot-registry.ts or the template.
// ---------------------------------------------------------------------------
export const ROUTING_REGISTRY: readonly RoutingRule[] = [
  // ----- Signals (immutable assertions) -----
  { semantic_id: 'archetype.tendency_body', target: 'signal', node_kind: 'observation', pillar: null, polarity: 'neutral', scope_grain: 'month' },
  { semantic_id: 'archetype.tendency_mind', target: 'signal', node_kind: 'observation', pillar: 'vichaar', polarity: 'neutral', scope_grain: 'month' },
  { semantic_id: 'archetype.tendency_season_asks', target: 'signal', node_kind: 'insight', pillar: null, polarity: 'neutral', scope_grain: 'month' },
  { semantic_id: 'agni.front_1_title', target: 'signal', node_kind: 'observation', pillar: null, polarity: 'neutral', scope_grain: 'month', body_from: 'agni.front_1_body' },
  { semantic_id: 'agni.front_2_title', target: 'signal', node_kind: 'observation', pillar: null, polarity: 'neutral', scope_grain: 'month', body_from: 'agni.front_2_body' },

  // ----- Directives (stateful actions) -----
  { semantic_id: 'taste.favor_1_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'do', scope_grain: 'month' },
  { semantic_id: 'taste.favor_2_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'do', scope_grain: 'month' },
  { semantic_id: 'taste.favor_3_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'do', scope_grain: 'month' },
  { semantic_id: 'taste.avoid_1_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'taste.avoid_2_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'taste.avoid_3_name', target: 'directive', node_kind: 'recommendation', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'five_anchors.anchor_1_title', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'do', scope_grain: 'month', body_from: 'five_anchors.anchor_1_detail' },
  { semantic_id: 'five_anchors.anchor_2_title', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'do', scope_grain: 'month', body_from: 'five_anchors.anchor_2_detail' },
  { semantic_id: 'five_anchors.anchor_3_title', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'do', scope_grain: 'month', body_from: 'five_anchors.anchor_3_detail' },
  { semantic_id: 'five_anchors.anchor_4_title', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'do', scope_grain: 'month', body_from: 'five_anchors.anchor_4_detail' },
  { semantic_id: 'five_anchors.anchor_5_title', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'do', scope_grain: 'month', body_from: 'five_anchors.anchor_5_detail' },
  { semantic_id: 'five_anchors.avoid_1', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'five_anchors.avoid_2', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'five_anchors.avoid_3', target: 'directive', node_kind: 'practice', pillar: 'aahar', polarity: 'avoid', scope_grain: 'month' },
  { semantic_id: 'commitment.lever_line', target: 'directive', node_kind: 'commitment', pillar: null, polarity: 'do', scope_grain: 'month' },
];

export const ROUTING_BY_SEMANTIC_ID: ReadonlyMap<string, RoutingRule> = new Map(
  ROUTING_REGISTRY.map((r) => [r.semantic_id, r]),
);

// ---------------------------------------------------------------------------
// Load-time integrity. Every rule must point at a real slot, every body_from
// must resolve, and no slot may be routed twice.
// ---------------------------------------------------------------------------
(function assertRoutingIntegrity(): void {
  const seen = new Set<string>();
  for (const r of ROUTING_REGISTRY) {
    if (!SLOT_BY_SEMANTIC_ID.has(r.semantic_id)) {
      throw new Error(
        `ROUTING_REGISTRY rule references unknown semantic_id "${r.semantic_id}".`,
      );
    }
    if (seen.has(r.semantic_id)) {
      throw new Error(`ROUTING_REGISTRY routes "${r.semantic_id}" more than once.`);
    }
    seen.add(r.semantic_id);

    if (r.body_from && !SLOT_BY_SEMANTIC_ID.has(r.body_from)) {
      throw new Error(
        `ROUTING_REGISTRY body_from "${r.body_from}" on "${r.semantic_id}" ` +
          `does not resolve to a known slot.`,
      );
    }
  }
})();
