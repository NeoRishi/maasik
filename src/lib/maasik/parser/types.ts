// Maasik parser — producer-specific data contracts.
//
// The producer-agnostic node contracts (Signal, Directive, NodeOrigin,
// NodeScope and the classification vocabulary) live in the shared intelligence
// layer and are imported + re-exported here. What remains in this file is
// genuinely Maasik-specific: the HTML extraction intermediate, the Maasik parse
// context/result, and the Maasik-branded error.

import type { Signal, Directive } from '../../intelligence/ontology';

// Re-export the shared node contracts so the parser's public surface (and its
// consumers) keep importing them from the parser barrel unchanged.
export type {
  Pillar,
  Grain,
  SignalKind,
  DirectiveKind,
  NodeOrigin,
  NodeScope,
  Signal,
  Directive,
} from '../../intelligence/ontology';

// ---------------------------------------------------------------------------
// Parser input contract (Maasik-specific: producer + schema are fixed literals)
// ---------------------------------------------------------------------------
export interface ParseContext {
  producer: 'maasik';
  sourceRef: string; // e.g. "report:<uuid>"
  generatedAt: string; // ISO-8601, injected by caller
  schemaVersion: 'maasik.content.v2';
  templateVersion: string; // e.g. "v4.1"
}

// ---------------------------------------------------------------------------
// Extraction-boundary contract (Maasik structured shapes: food/anchor/grocery)
// ---------------------------------------------------------------------------
export interface FoodRow {
  category: string;
  items: string[];
}
export interface AnchorRow {
  time: string;
  name: string;
  detail: string;
}
export interface GroceryItem {
  name: string;
  qty: string;
}

export type ExtractedValue =
  | { kind: 'scalar'; text: string }
  | { kind: 'structured'; shape: 'food'; rows: FoodRow[] }
  | { kind: 'structured'; shape: 'anchor'; rows: AnchorRow[] }
  | { kind: 'structured'; shape: 'grocery'; rows: GroceryItem[] }
  | { kind: 'visual'; form: 'rgba' | 'svg-inner' | 'svg-groups'; raw: string };

export interface ExtractionResult {
  values: ReadonlyMap<string, ExtractedValue>; // keyed by semantic_id
  hooksFound: readonly string[]; // data-slot hooks, in document order
}

// ---------------------------------------------------------------------------
// Presentation contract (byte-parity fuel for Option C)
// ---------------------------------------------------------------------------
export type Presentation = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Integrity-check contract
// ---------------------------------------------------------------------------
export interface IntegrityReport {
  expectedDataSlotHooks: number;
  foundHooks: number;
  missingHooks: string[];
  duplicateHooks: string[];
  pathCollisions: Array<{ path: string; slots: string[] }>;
  unroutableRules: string[];
  cssSlotsResolved: string[];
  ok: boolean;
}

// ---------------------------------------------------------------------------
// Parse result (content_json v2)
// ---------------------------------------------------------------------------
export interface ContentJsonV2 {
  schema_version: 'maasik.content.v2';
  template_version: string;
  source_ref: string;
  generated_at: string;
  presentation: Presentation;
  signals: Signal[];
  directives: Directive[];
}

export interface ParseResult {
  contentJson: ContentJsonV2;
  integrity: IntegrityReport;
}

// ---------------------------------------------------------------------------
// Typed error. Every failure mode throws this, never a silent fallback.
// ---------------------------------------------------------------------------
export type MaasikParseErrorCode =
  | 'E_HOOK_MISSING'
  | 'E_HOOK_DUPLICATE'
  | 'E_CSS_SLOT_MISSING'
  | 'E_PATH_COLLISION'
  | 'E_ROUTE_UNRESOLVED'
  | 'E_BODYFROM_UNRESOLVED'
  | 'E_EXTRACT_SHAPE'
  | 'E_CONTEXT_INVALID';

export class MaasikParseError extends Error {
  code: MaasikParseErrorCode;
  slot?: string;
  constructor(code: MaasikParseErrorCode, message: string, slot?: string) {
    super(`[${code}] ${message}`);
    this.name = 'MaasikParseError';
    this.code = code;
    this.slot = slot;
  }
}
