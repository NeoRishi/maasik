// Maasik parser — shared helpers for semantic-node generation (Stages 3 & 4).
//
// Producer-agnostic: depends only on ExtractionResult, the slot registry (for
// semantic_id -> slot provenance), and ParseContext. No HTML, no presentation.

import { SLOT_BY_SEMANTIC_ID } from '../slot-registry';
import {
  MaasikParseError,
  type ExtractionResult,
  type NodeOrigin,
  type ParseContext,
  type MaasikParseErrorCode,
} from './types';

export function buildOrigin(ctx: ParseContext): NodeOrigin {
  return {
    producer: ctx.producer,
    method: 'transcribed',
    source_ref: ctx.sourceRef,
    generated_at: ctx.generatedAt,
    version: ctx.schemaVersion,
  };
}

// Reads the verbatim scalar text routed slots carry. Throws (no fallback) if
// the value is missing or not scalar.
export function readScalar(
  x: ExtractionResult,
  semanticId: string,
  code: MaasikParseErrorCode,
): string {
  const v = x.values.get(semanticId);
  const slot = SLOT_BY_SEMANTIC_ID.get(semanticId)?.slot ?? semanticId;
  if (!v) {
    throw new MaasikParseError(code, `routed value "${semanticId}" not extracted`, slot);
  }
  if (v.kind !== 'scalar') {
    throw new MaasikParseError(
      code,
      `routed value "${semanticId}" is ${v.kind}, expected scalar`,
      slot,
    );
  }
  return v.text;
}

export function slotOf(semanticId: string): string {
  return SLOT_BY_SEMANTIC_ID.get(semanticId)?.slot ?? semanticId;
}
