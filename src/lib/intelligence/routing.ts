// NeoRishi shared intelligence — routing rule contracts.
//
// PRODUCER-AGNOSTIC. Defines the SHAPE of a routing rule: how a producer
// declares that one of its keyed values should become a Signal or Directive.
// The concrete rule SET is producer-specific (e.g. Maasik's ROUTING_REGISTRY);
// this file only owns the type each producer's rules must satisfy.
//
// Keyed by `semantic_id` (the long-lived domain key), never by anything
// template-specific, so the same rule shape serves Maasik slots today and
// Dinacharya's own keys tomorrow.

import type {
  Pillar,
  Grain,
  SignalKind,
  DirectiveKind,
} from './ontology';

interface RoutingRuleBase {
  semantic_id: string; // the producer value this rule interprets
  pillar: Pillar | null;
  scope_grain: Grain;
  body_from?: string; // semantic_id supplying the node's secondary text
}

export interface SignalRule extends RoutingRuleBase {
  target: 'signal';
  node_kind: SignalKind;
  polarity: 'positive' | 'neutral' | 'negative';
}

export interface DirectiveRule extends RoutingRuleBase {
  target: 'directive';
  node_kind: DirectiveKind;
  polarity: 'do' | 'avoid';
}

export type RoutingRule = SignalRule | DirectiveRule;
