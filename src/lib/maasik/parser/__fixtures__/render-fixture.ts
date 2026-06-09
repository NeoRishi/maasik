// Deterministic fixture renderer for parser tests.
//
// Fills every [[SLOT]] in the instrumented template with controlled,
// representative content, driven by SLOT_REGISTRY so all 95 slots are covered
// automatically and the structured/visual extractors are exercised with
// realistic markup. No randomness, no clock: identical output every run.

import { HTML_TEMPLATE, HTML_TEMPLATE_VERSION } from '../../html-template';
import { SLOT_REGISTRY } from '../../slot-registry';
import type { ParseContext } from '../types';

function foodRows(tag: string): string {
  return Array.from({ length: 6 }, (_, i) =>
    `<li><strong>${tag}Cat${i + 1}</strong>${tag}A${i + 1}, ${tag}B${i + 1}, ${tag}C${i + 1}</li>`,
  ).join('');
}

function anchorRows(): string {
  const names = ['On waking', 'Breakfast', 'Mid-morning', 'Lunch (largest)', 'Evening', 'Dinner (light)', 'Bedtime'];
  return names
    .map(
      (n, i) =>
        `<div class="row"><div class="time">0${i + 1}:30 AM</div>` +
        `<div class="meal-name">${n}</div>` +
        `<div class="meal-detail">Detail for ${n}.</div></div>`,
    )
    .join('');
}

function groceryItems(card: number): string {
  return Array.from({ length: 3 }, (_, i) =>
    `<li>Card${card}Item${i + 1} · ${(i + 1) * 100} g</li>`,
  ).join('');
}

function svgInner(tag: string): string {
  return `<circle cx="28" cy="32" r="5" fill="#B85C3A" data-tag="${tag}"/>`;
}

function dayChartGroups(): string {
  return (
    '<g id="anchor-dots"><circle cx="25" cy="40" r="3"/></g>' +
    '<g id="anchor-labels"><text x="25" y="20">Breakfast</text></g>' +
    '<path id="heat-curve" d="M25 200 L675 200"/>' +
    '<g id="activity-zones"><rect x="25" y="288" width="100" height="18"/></g>'
  );
}

// Build one fill value per slot, derived from its extractor so every kind is
// exercised. Scalar values are derived from semantic_id for stable readability.
function fillValueFor(entry: (typeof SLOT_REGISTRY)[number]): string {
  switch (entry.extractor) {
    case 'rgba':
      return entry.semantic_id.endsWith('primary')
        ? 'rgba(214,142,43,0.92)'
        : 'rgba(124,111,192,0.55)';
    case 'svg-inner':
      return svgInner(entry.semantic_id);
    case 'svg-groups':
      return dayChartGroups();
    case 'rows-food':
      return foodRows(entry.semantic_id.includes('favor') ? 'Favor' : 'Avoid');
    case 'rows-anchor':
      return anchorRows();
    case 'list-grocery': {
      const m = entry.slot.match(/CARD_(\d)/);
      return groceryItems(m ? Number(m[1]) : 0);
    }
    case 'text':
    default:
      return `val_${entry.semantic_id}`;
  }
}

export function renderFixture(): string {
  let html = HTML_TEMPLATE;
  for (const entry of SLOT_REGISTRY) {
    html = html.split(`[[${entry.slot}]]`).join(fillValueFor(entry));
  }
  return html;
}

export const FIXED_CTX: ParseContext = {
  producer: 'maasik',
  sourceRef: 'report:00000000-0000-0000-0000-000000000000',
  generatedAt: '2026-05-17T00:00:00.000Z',
  schemaVersion: 'maasik.content.v2',
  templateVersion: HTML_TEMPLATE_VERSION,
};
