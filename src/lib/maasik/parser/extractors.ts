// Maasik parser — extraction strategies (Stage 1 leaf functions).
//
// One pure function per SlotExtractor. Each takes a single DOM node (or, for
// rgba, a raw value already located by extract.ts) and returns a typed value.
// Extractors know nothing about the registry, routing, presentation, or any
// slot other than the one they are handed. They throw E_EXTRACT_SHAPE when the
// node's inner shape is malformed. No silent fallback.

import type { HTMLElement } from 'node-html-parser';
import {
  MaasikParseError,
  type ExtractedValue,
  type FoodRow,
  type AnchorRow,
  type GroceryItem,
} from './types';

const GROCERY_SEP = /\s*·\s*/; // "Name · qty"
const ITEM_SEP = /\s*,\s*/; // comma-separated food items

export function extractText(el: HTMLElement): ExtractedValue {
  return { kind: 'scalar', text: el.text.trim() };
}

export function extractSvgInner(el: HTMLElement): ExtractedValue {
  return { kind: 'visual', form: 'svg-inner', raw: el.innerHTML.trim() };
}

export function extractSvgGroups(el: HTMLElement): ExtractedValue {
  return { kind: 'visual', form: 'svg-groups', raw: el.innerHTML.trim() };
}

export function extractRowsFood(el: HTMLElement, slot: string): ExtractedValue {
  const lis = el.querySelectorAll('li');
  if (lis.length === 0) {
    throw new MaasikParseError('E_EXTRACT_SHAPE', `food rows empty for ${slot}`, slot);
  }
  const rows: FoodRow[] = lis.map((li) => {
    const strong = li.querySelector('strong');
    if (!strong) {
      throw new MaasikParseError('E_EXTRACT_SHAPE', `food row missing <strong> in ${slot}`, slot);
    }
    const category = strong.text.trim();
    const itemsStr = li.text.slice(strong.text.length).trim();
    const items = itemsStr.length ? itemsStr.split(ITEM_SEP).map((s) => s.trim()).filter(Boolean) : [];
    return { category, items };
  });
  return { kind: 'structured', shape: 'food', rows };
}

export function extractRowsAnchor(el: HTMLElement, slot: string): ExtractedValue {
  const rowEls = el.querySelectorAll('.row');
  if (rowEls.length === 0) {
    throw new MaasikParseError('E_EXTRACT_SHAPE', `anchor rows empty for ${slot}`, slot);
  }
  const rows: AnchorRow[] = rowEls.map((row) => {
    const time = row.querySelector('.time');
    const name = row.querySelector('.meal-name');
    const detail = row.querySelector('.meal-detail');
    if (!time || !name || !detail) {
      throw new MaasikParseError(
        'E_EXTRACT_SHAPE',
        `anchor row missing time/name/detail in ${slot}`,
        slot,
      );
    }
    return { time: time.text.trim(), name: name.text.trim(), detail: detail.text.trim() };
  });
  return { kind: 'structured', shape: 'anchor', rows };
}

export function extractListGrocery(el: HTMLElement, slot: string): ExtractedValue {
  const lis = el.querySelectorAll('li');
  if (lis.length === 0) {
    throw new MaasikParseError('E_EXTRACT_SHAPE', `grocery list empty for ${slot}`, slot);
  }
  const rows: GroceryItem[] = lis.map((li) => {
    const parts = li.text.trim().split(GROCERY_SEP);
    return { name: (parts[0] ?? '').trim(), qty: (parts[1] ?? '').trim() };
  });
  return { kind: 'structured', shape: 'grocery', rows };
}

// rgba is located by extract.ts (CSS, not DOM) and passed in as a raw string.
export function extractRgba(raw: string): ExtractedValue {
  return { kind: 'visual', form: 'rgba', raw: raw.trim() };
}
