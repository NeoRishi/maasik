// Maasik parser — Stage 3: Signal generation.
//
// Walks ROUTING_REGISTRY (target=signal) in array order and mints one Signal
// per rule. Interpretation comes entirely from the rule; this stage invents
// nothing. Deterministic: ids derive from semantic_id, order follows the
// registry, time/source come from ParseContext.

import { ROUTING_REGISTRY, type SignalRule } from '../routing-registry';
import { buildOrigin, readScalar, slotOf } from './node-build';
import type { ExtractionResult, ParseContext, Signal } from './types';

export function generateSignals(x: ExtractionResult, ctx: ParseContext): Signal[] {
  const rules = ROUTING_REGISTRY.filter((r): r is SignalRule => r.target === 'signal');
  const origin = buildOrigin(ctx);

  return rules.map((rule) => {
    const statement = readScalar(x, rule.semantic_id, 'E_ROUTE_UNRESOLVED');
    const source_slots = [slotOf(rule.semantic_id)];

    let detail: string | undefined;
    if (rule.body_from) {
      detail = readScalar(x, rule.body_from, 'E_BODYFROM_UNRESOLVED');
      source_slots.push(slotOf(rule.body_from));
    }

    const signal: Signal = {
      id: `${ctx.producer}:signal:${rule.semantic_id}`,
      kind: rule.node_kind,
      pillar: rule.pillar,
      statement,
      ...(detail !== undefined ? { detail } : {}),
      scope: { grain: rule.scope_grain },
      origin,
      polarity: rule.polarity,
      classification: { purushartha: [], compass: [] },
      evidence: [],
      source_slots,
    };
    return signal;
  });
}
