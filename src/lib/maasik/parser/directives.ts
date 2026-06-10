// Maasik parser — Stage 4: Directive generation.
//
// Walks ROUTING_REGISTRY (target=directive) in array order and mints one
// Directive per rule. trackable is derived deterministically from kind.
// justified_by / serves / classification are empty in v1 (no invented
// semantics); they become ROUTING_REGISTRY enrichments later.

import { ROUTING_REGISTRY, type DirectiveRule } from '../routing-registry';
import { buildOrigin, readScalar, slotOf } from './node-build';
import type { ExtractionResult, ParseContext, Directive } from './types';

export function generateDirectives(x: ExtractionResult, ctx: ParseContext): Directive[] {
  const rules = ROUTING_REGISTRY.filter((r): r is DirectiveRule => r.target === 'directive');
  const origin = buildOrigin(ctx);

  return rules.map((rule) => {
    const statement = readScalar(x, rule.semantic_id, 'E_ROUTE_UNRESOLVED');
    const source_slots = [slotOf(rule.semantic_id)];

    let detail: string | undefined;
    if (rule.body_from) {
      detail = readScalar(x, rule.body_from, 'E_BODYFROM_UNRESOLVED');
      source_slots.push(slotOf(rule.body_from));
    }

    const directive: Directive = {
      id: `${ctx.producer}:directive:${rule.semantic_id}`,
      kind: rule.node_kind,
      pillar: rule.pillar,
      statement,
      ...(detail !== undefined ? { detail } : {}),
      scope: { grain: rule.scope_grain },
      origin,
      polarity: rule.polarity,
      trackable: rule.node_kind === 'practice' || rule.node_kind === 'commitment',
      justified_by: [],
      serves: [],
      classification: { purushartha: [], compass: [], karma_tag: null },
      source_slots,
    };
    return directive;
  });
}
