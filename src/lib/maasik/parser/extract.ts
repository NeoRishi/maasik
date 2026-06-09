// Maasik parser — Stage 1: HTML to ExtractionResult.
//
// The only stage that touches HTML and slots. Walks [data-slot] elements,
// dispatches each to the matching extractor by SLOT_REGISTRY.extractor, and
// reads the 2 CSS gradient slots by anchored regex. Output is the
// producer-agnostic boundary intermediate: a semantic_id-keyed value map.
//
// Fails loudly: missing hook, duplicate hook, or missing CSS slot all throw.

import { parse } from 'node-html-parser';
import { SLOT_REGISTRY } from '../slot-registry';
import {
  extractText,
  extractSvgInner,
  extractSvgGroups,
  extractRowsFood,
  extractRowsAnchor,
  extractListGrocery,
  extractRgba,
} from './extractors';
import {
  MaasikParseError,
  type ExtractedValue,
  type ExtractionResult,
} from './types';

// CSS-slot locators. These live here (extraction mechanics), not in the
// registry (which stays purely structural). Each anchors on stable
// surrounding CSS so the correct rgba() is captured. The rendered report
// replaces [[...]] with a concrete rgba(...) value.
const CSS_LOCATORS: Record<string, RegExp> = {
  'cover.gradient_accent': /at 70% 20%,\s*(rgba\([^)]*\))/,
  'cover.gradient_primary': /at 30% 80%,\s*(rgba\([^)]*\))/,
};

export function extract(html: string): ExtractionResult {
  const root = parse(html);
  const hooked = root.querySelectorAll('[data-slot]');

  // Detect duplicate canonical hooks up front.
  const seen = new Map<string, number>();
  const hooksFound: string[] = [];
  for (const el of hooked) {
    const hook = el.getAttribute('data-slot') as string;
    hooksFound.push(hook);
    seen.set(hook, (seen.get(hook) ?? 0) + 1);
  }
  const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([h]) => h);
  if (dupes.length) {
    throw new MaasikParseError(
      'E_HOOK_DUPLICATE',
      `duplicate canonical hook(s): ${dupes.join(', ')}`,
    );
  }

  const byHook = new Map(hooked.map((el) => [el.getAttribute('data-slot') as string, el]));
  const values = new Map<string, ExtractedValue>();

  for (const entry of SLOT_REGISTRY) {
    if (entry.instrumentation === 'css') {
      const locator = CSS_LOCATORS[entry.semantic_id];
      const m = locator ? html.match(locator) : null;
      if (!m) {
        throw new MaasikParseError(
          'E_CSS_SLOT_MISSING',
          `css slot ${entry.slot} not found in rendered CSS`,
          entry.slot,
        );
      }
      values.set(entry.semantic_id, extractRgba(m[1]));
      continue;
    }

    const el = byHook.get(entry.hook);
    if (!el) {
      throw new MaasikParseError(
        'E_HOOK_MISSING',
        `data-slot hook "${entry.hook}" (${entry.slot}) absent from HTML`,
        entry.slot,
      );
    }

    switch (entry.extractor) {
      case 'text':
        values.set(entry.semantic_id, extractText(el));
        break;
      case 'svg-inner':
        values.set(entry.semantic_id, extractSvgInner(el));
        break;
      case 'svg-groups':
        values.set(entry.semantic_id, extractSvgGroups(el));
        break;
      case 'rows-food':
        values.set(entry.semantic_id, extractRowsFood(el, entry.slot));
        break;
      case 'rows-anchor':
        values.set(entry.semantic_id, extractRowsAnchor(el, entry.slot));
        break;
      case 'list-grocery':
        values.set(entry.semantic_id, extractListGrocery(el, entry.slot));
        break;
      case 'rgba':
        // rgba is handled by the css branch above; reaching here is a bug.
        throw new MaasikParseError(
          'E_EXTRACT_SHAPE',
          `rgba extractor reached via data-slot for ${entry.slot}`,
          entry.slot,
        );
    }
  }

  return { values, hooksFound };
}
