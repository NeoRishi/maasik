// Maasik parser — Stage 5: orchestration + public entry point.
//
// Runs the pipeline in order, verifies integrity, stamps origin/version from
// ParseContext, and assembles content_json (maasik.content.v2). Contains no
// extraction or routing logic itself.

import { extract } from './extract';
import { assemblePresentation } from './presentation';
import { generateSignals } from './signals';
import { generateDirectives } from './directives';
import { checkIntegrity } from './integrity';
import {
  MaasikParseError,
  type ContentJsonV2,
  type ParseContext,
  type ParseResult,
} from './types';

function validateContext(ctx: ParseContext): void {
  const missing: string[] = [];
  if (ctx.producer !== 'maasik') missing.push('producer');
  if (!ctx.sourceRef) missing.push('sourceRef');
  if (!ctx.generatedAt) missing.push('generatedAt');
  if (ctx.schemaVersion !== 'maasik.content.v2') missing.push('schemaVersion');
  if (!ctx.templateVersion) missing.push('templateVersion');
  if (missing.length) {
    throw new MaasikParseError(
      'E_CONTEXT_INVALID',
      `ParseContext missing/invalid: ${missing.join(', ')}`,
    );
  }
}

export function parseMaasikReport(html: string, ctx: ParseContext): ParseResult {
  validateContext(ctx);

  const extraction = extract(html);
  const integrity = checkIntegrity(extraction); // throws on any violation

  const presentation = assemblePresentation(extraction);
  const signals = generateSignals(extraction, ctx);
  const directives = generateDirectives(extraction, ctx);

  const contentJson: ContentJsonV2 = {
    schema_version: 'maasik.content.v2',
    template_version: ctx.templateVersion,
    source_ref: ctx.sourceRef,
    generated_at: ctx.generatedAt,
    presentation,
    signals,
    directives,
  };

  return { contentJson, integrity };
}

// Re-exports for unit tests and future producers that re-enter at the boundary.
export { extract } from './extract';
export { assemblePresentation } from './presentation';
export { generateSignals } from './signals';
export { generateDirectives } from './directives';
export { checkIntegrity } from './integrity';
export { stableStringify } from './util';
export * from './types';
