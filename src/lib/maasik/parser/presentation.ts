// Maasik parser — Stage 2: ExtractionResult to Presentation.
//
// Deep-sets each extracted value at its SLOT_REGISTRY.presentation_path. The
// presentation tree is the byte-parity fuel for the Option C renderer. This
// stage never mints signals/directives and never touches HTML. It throws
// E_PATH_COLLISION if two slots resolve to the same leaf path.

import { SLOT_REGISTRY } from '../slot-registry';
import {
  MaasikParseError,
  type ExtractionResult,
  type ExtractedValue,
  type Presentation,
} from './types';

type PathToken = string | number;

function tokenizePath(path: string): PathToken[] {
  const tokens: PathToken[] = [];
  const re = /([^.[\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path)) !== null) {
    if (m[2] !== undefined) tokens.push(Number(m[2]));
    else tokens.push(m[1]);
  }
  return tokens;
}

// The payload stored in presentation for a given extracted value.
function payloadOf(v: ExtractedValue): unknown {
  switch (v.kind) {
    case 'scalar':
      return v.text;
    case 'visual':
      return v.raw;
    case 'structured':
      return v.rows;
  }
}

function deepSet(
  rootObj: Record<string, unknown>,
  tokens: PathToken[],
  value: unknown,
): void {
  let cursor: Record<string, unknown> | unknown[] = rootObj;
  for (let i = 0; i < tokens.length - 1; i++) {
    const key = tokens[i];
    const nextIsIndex = typeof tokens[i + 1] === 'number';
    const container = cursor as Record<PathToken, unknown>;
    if (container[key] === undefined) {
      container[key] = nextIsIndex ? [] : {};
    }
    cursor = container[key] as Record<string, unknown> | unknown[];
  }
  (cursor as Record<PathToken, unknown>)[tokens[tokens.length - 1]] = value;
}

export function assemblePresentation(x: ExtractionResult): Presentation {
  const presentation: Presentation = {};
  const writtenLeaves = new Map<string, string[]>(); // leaf path -> slots that wrote it

  for (const entry of SLOT_REGISTRY) {
    const value = x.values.get(entry.semantic_id);
    if (value === undefined) {
      // Stage 1 guarantees a value for every entry; defensive.
      throw new MaasikParseError(
        'E_HOOK_MISSING',
        `no extracted value for ${entry.slot} during presentation assembly`,
        entry.slot,
      );
    }
    const leaf = entry.presentation_path;
    const priorSlots = writtenLeaves.get(leaf);
    if (priorSlots) {
      throw new MaasikParseError(
        'E_PATH_COLLISION',
        `presentation_path "${leaf}" written by ${[...priorSlots, entry.slot].join(' and ')}`,
        entry.slot,
      );
    }
    writtenLeaves.set(leaf, [entry.slot]);
    deepSet(presentation, tokenizePath(leaf), payloadOf(value));
  }

  return presentation;
}
