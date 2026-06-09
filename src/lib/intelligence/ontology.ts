// NeoRishi shared intelligence — ontology contracts.
//
// PRODUCER-AGNOSTIC. This module is the semantic contract every producer
// (Maasik today; Dinacharya, assessments, reports tomorrow) must agree on. It
// depends on nothing and imports nothing. It is staged here under
// src/lib/intelligence/ and is destined for packages/intelligence in the
// NeoRishi monorepo; the move will be a copy, not a redesign.
//
// Five-primitive model (locked): Subject, Assertion, Goal, Directive, Event.
// Implemented here today: Assertion (as Signal) and Directive, plus the shared
// classification vocabulary. Subject / Goal / Event join this file when they
// are first produced. State / Score / Progress remain VIEWS, never stored here.

// ---------------------------------------------------------------------------
// Shared classification vocabulary (cross-cutting tags, not primitives)
// ---------------------------------------------------------------------------
export type Pillar = 'aahar' | 'vihaar' | 'achaar' | 'vichaar';
export type Grain = 'day' | 'week' | 'paksha' | 'month' | 'year';

export type SignalKind = 'observation' | 'insight' | 'opportunity' | 'risk';
export type DirectiveKind = 'recommendation' | 'practice' | 'commitment';

// ---------------------------------------------------------------------------
// Provenance + scope shared by every node
// ---------------------------------------------------------------------------
export interface NodeOrigin {
  producer: string; // 'maasik' | 'dinacharya' | ...
  method: 'transcribed' | 'inferred' | 'authored';
  source_ref: string; // outward pointer, e.g. "report:<uuid>"
  generated_at: string; // ISO-8601, injected by the caller (keeps producers pure)
  version: string; // content schema version, e.g. "maasik.content.v2"
}

export interface NodeScope {
  grain: Grain;
  window?: string;
  recurrence?: string;
}

// ---------------------------------------------------------------------------
// Assertion (Signal): an immutable observation/insight/opportunity/risk
// ---------------------------------------------------------------------------
export interface Signal {
  id: string; // `${producer}:signal:${semantic_id}` - deterministic, stable
  kind: SignalKind;
  pillar: Pillar | null;
  statement: string; // verbatim primary text
  detail?: string; // verbatim secondary text, when the node spans two sources
  scope: NodeScope;
  origin: NodeOrigin;
  polarity: 'positive' | 'neutral' | 'negative';
  classification: { purushartha: string[]; compass: string[] };
  evidence: string[];
  source_slots: string[]; // producer-specific inward provenance
}

// ---------------------------------------------------------------------------
// Directive: a stateful recommendation/practice/commitment
// ---------------------------------------------------------------------------
export interface Directive {
  id: string; // `${producer}:directive:${semantic_id}`
  kind: DirectiveKind;
  pillar: Pillar | null;
  statement: string;
  detail?: string;
  scope: NodeScope;
  origin: NodeOrigin;
  polarity: 'do' | 'avoid';
  trackable: boolean;
  justified_by: string[]; // signal ids this directive is justified by
  serves: string[]; // goal ids this directive serves
  classification: { purushartha: string[]; compass: string[]; karma_tag: string | null };
  source_slots: string[];
}
