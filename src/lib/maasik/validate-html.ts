/**
 * Post-generation quality gates for the MAASIK report HTML.
 * Implements MAASIK_claude_api_prompt_v2.md Section 7.
 */

import type { MaasikUser } from './helpers';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Back-compat alias for existing callers.
export type HtmlValidationResult = ValidationResult;

const FORBIDDEN_DOSHA_PHRASES = [
  'Pitta-dominant',
  'Kapha-dominant',
  'Vata-dominant',
  'your dosha',
  'your constitution',
];

export function validateGeneratedHtml(
  html: string,
  user: MaasikUser,
): ValidationResult {
  const errors: string[] = [];

  // 1. HTML structure.
  const trimmed = html.trim();
  if (!trimmed.startsWith('<!DOCTYPE html>') || !trimmed.endsWith('</html>')) {
    errors.push('html_structure: must start with <!DOCTYPE html> and end with </html>');
  }

  // 2. No unfilled [[SLOT]] placeholders.
  const unfilled = html.match(/\[\[[A-Z_0-9]+\]\]/g);
  if (unfilled && unfilled.length > 0) {
    const sample = Array.from(new Set(unfilled)).slice(0, 5).join(', ');
    errors.push(`unfilled_placeholders: ${sample}`);
  }

  // 3. First name appears at least twice.
  const firstName = (user.full_name || '').trim().split(/\s+/)[0] || '';
  if (firstName.length > 0) {
    const escaped = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const occurrences = (html.match(new RegExp(escaped, 'gi')) || []).length;
    if (occurrences < 2) {
      errors.push(`first_name_count: "${firstName}" appears ${occurrences} time(s), need >= 2`);
    }
  } else {
    errors.push('first_name_count: user has no first name');
  }

  // 4. Length window.
  if (html.length < 12000 || html.length > 55000) {
    errors.push(`html_length: ${html.length} chars (must be 12000-55000)`);
  }

  // 5. Zero em-dashes anywhere in the HTML (including SVG text, attributes).
  const emDashCount = (html.match(/—/g) || []).length;
  if (emDashCount > 0) {
    errors.push(`em_dash: found ${emDashCount} em-dash character(s) (U+2014)`);
  }

  // 6. Archetype name: exactly one match, starts with "The ", 2-3 words.
  const archetypeMatches = [...html.matchAll(/<h3 class="archetype-name">([^<]+)<\/h3>/g)];
  if (archetypeMatches.length !== 1) {
    errors.push(`archetype_name: expected exactly 1 match, got ${archetypeMatches.length}`);
  } else {
    const name = archetypeMatches[0][1].trim();
    if (!name.startsWith('The ')) {
      errors.push(`archetype_name: "${name}" does not start with "The "`);
    } else {
      const wordCount = name.split(/\s+/).length;
      if (wordCount < 2 || wordCount > 3) {
        errors.push(`archetype_name: "${name}" has ${wordCount} words (need 2-3)`);
      }
    }
  }

  // 7. Forbidden dosha-declaration phrases (case-insensitive).
  const lowerHtml = html.toLowerCase();
  for (const phrase of FORBIDDEN_DOSHA_PHRASES) {
    if (lowerHtml.includes(phrase.toLowerCase())) {
      errors.push(`forbidden_phrase: "${phrase}" present`);
    }
  }

  // 8. Word-origin cards: 3 or 4.
  const wordOriginCount = (html.match(/<div class="word-origin">/g) || []).length;
  if (wordOriginCount < 3 || wordOriginCount > 4) {
    errors.push(`word_origin_cards: found ${wordOriginCount} (need 3-4)`);
  }

  // 9. Exactly 5 <li> inside <ol class="anchor-numbered">.
  const anchorBlock = html.match(/<ol class="anchor-numbered">([\s\S]*?)<\/ol>/);
  if (!anchorBlock) {
    errors.push('anchor_list: <ol class="anchor-numbered"> block not found');
  } else {
    const liCount = (anchorBlock[1].match(/<li[\s>]/g) || []).length;
    if (liCount !== 5) {
      errors.push(`anchor_list: found ${liCount} <li> elements (need exactly 5)`);
    }
  }

  // 10. Exactly 6 grocery cards inside .grocery-grid.
  const groceryBlock = html.match(/<div class="grocery-grid">([\s\S]*?)<\/div>\s*(?=<div class="section|<\/section|<\/body)/);
  // Fallback: scan grocery-card occurrences regardless of container.
  const groceryCardCount = (groceryBlock
    ? (groceryBlock[1].match(/<div class="grocery-card[^"]*">/g) || []).length
    : (html.match(/<div class="grocery-card[^"]*">/g) || []).length);
  if (groceryCardCount !== 6) {
    errors.push(`grocery_cards: found ${groceryCardCount} (need exactly 6)`);
  }

  // 11. Vegetables + Fruits grocery cards must show weekly fresh quantities.
  validateGroceryQuantities(html, errors);

  // 12. Cover + closing Sanskrit slots must be in Devanagari script (U+0900-U+097F).
  validateDevanagariVerses(html, errors);

  // 13 & 14. Allergies and disliked_foods must not appear in the food sections.
  const foodSections = extractFoodSections(html).toLowerCase();
  const allergyTerms = splitCsv(user.allergies);
  for (const term of allergyTerms) {
    if (foodSections.includes(term.toLowerCase())) {
      errors.push(`allergy_leak: "${term}" appears in food sections`);
    }
  }
  const dislikedTerms = splitCsv(user.disliked_foods);
  for (const term of dislikedTerms) {
    if (foodSections.includes(term.toLowerCase())) {
      errors.push(`disliked_leak: "${term}" appears in food sections`);
    }
  }

  // 15. Cover gradient integrity (v4): the .cover rule must use literal rgba()
  // values, not the abstract var(--cover-primary)/var(--cover-accent) indirection
  // that v2 used. Defends against Claude pasting placeholder text into the CSS.
  validateCoverGradient(html, errors);

  // 16. Heat-flow SVGs must not contain literal `>FIRE<` text. The v4 design
  // reference regresses to text-in-shape, but Part F3 forbids it. Outline body
  // silhouettes only.
  validateHeatFlowSvgs(html, errors);

  return { valid: errors.length === 0, errors };
}

/**
 * Cover gradient v4 check: the .cover background must contain two rgba()
 * literals (the two radial-gradient stops at 70% 20% and 30% 80%), and must
 * not reference the legacy var(--cover-primary) / var(--cover-accent).
 */
function validateCoverGradient(html: string, errors: string[]): void {
  const coverRuleMatch = html.match(/\.cover\s*\{[^}]*background:\s*([^;]+);/);
  if (!coverRuleMatch) {
    errors.push('cover_gradient: .cover rule with background declaration not found');
    return;
  }
  const bg = coverRuleMatch[1];
  const rgbaCount = (bg.match(/rgba\s*\(/g) || []).length;
  if (rgbaCount < 2) {
    errors.push(
      `cover_gradient: expected >= 2 rgba() literals in .cover background, found ${rgbaCount}`,
    );
  }
  if (/var\(--cover-(primary|accent)\)/.test(bg)) {
    errors.push('cover_gradient: legacy var(--cover-primary)/var(--cover-accent) residue present');
  }
}

/**
 * Heat-flow SVGs must use body-silhouette icons (no text inside filled shapes).
 * Specifically, the substring `>FIRE<` (literal text node) must not appear in
 * either [[HEAT_FLOW_LEFT_ICON_SVG]] or [[HEAT_FLOW_RIGHT_ICON_SVG]] output.
 */
function validateHeatFlowSvgs(html: string, errors: string[]): void {
  const heatFlowBlock = html.match(/<div class="heat-flow"[\s\S]*?<\/div>\s*<\/div>/);
  const scope = heatFlowBlock ? heatFlowBlock[0] : html;
  if (/>FIRE</.test(scope)) {
    errors.push('heat_flow_text: literal `>FIRE<` text inside heat-flow SVG; use body silhouette per Part F3');
  }
}

/**
 * The Vegetables and Fruits grocery cards must show a weekly fresh quantity
 * on every <li>, written as `Item · qty unit` (middle dot U+00B7 + digit).
 * Other cards (pantry items) stay optional.
 */
function validateGroceryQuantities(html: string, errors: string[]): void {
  const cardRegex = /<div class="grocery-card[^"]*">\s*<h3>([^<]+)<\/h3>\s*<ul>([\s\S]*?)<\/ul>/g;
  const cards = [...html.matchAll(cardRegex)];
  for (const [, title, body] of cards) {
    if (!/vegetables|fruits/i.test(title)) continue;
    const items = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').trim(),
    );
    // Require middle dot followed (eventually) by a digit on the right side.
    const missing = items.filter((t) => !/·[^·]*\d/.test(t));
    if (missing.length > 0) {
      errors.push(
        `grocery_quantities: ${title.trim()} missing weekly qty on ${missing.length} item(s): ${missing
          .slice(0, 3)
          .join(' | ')}`,
      );
    }
  }
}

/**
 * Cover and closing Sanskrit verses must use original Devanagari characters,
 * not a Latin transliteration. Requires at least 4 chars in U+0900-U+097F.
 */
function validateDevanagariVerses(html: string, errors: string[]): void {
  const slots: Array<{ className: string; label: string }> = [
    { className: 'cover-quote-sans', label: 'cover_verse' },
    { className: 'closing-sans', label: 'closing_verse' },
  ];
  for (const { className, label } of slots) {
    const re = new RegExp(`<div class="${className}">([^<]*)<\\/div>`);
    const m = html.match(re);
    if (!m) {
      errors.push(`sanskrit_slot_missing: ${className} block not found`);
      continue;
    }
    const text = m[1].trim();
    const devCount = (text.match(/[ऀ-ॿ]/g) || []).length;
    if (devCount < 4) {
      errors.push(
        `sanskrit_script: ${label} has ${devCount} Devanagari chars (need >= 4). Got: "${text.slice(
          0,
          60,
        )}"`,
      );
    }
  }
}

function splitCsv(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length === 0) return false;
      const low = s.toLowerCase();
      return low !== 'none' && low !== 'nil' && low !== 'na' && low !== 'n/a';
    });
}

/**
 * Returns the concatenated text of the food-bearing sections: Section 3
 * (.food-cols) and Section 6 (.grocery-grid). If either is missing, the
 * remaining content is still returned so checks degrade gracefully.
 */
function extractFoodSections(html: string): string {
  const parts: string[] = [];
  const foodCols = html.match(/<div class="food-cols">[\s\S]*?<\/div>\s*<\/div>/);
  if (foodCols) parts.push(foodCols[0]);
  const groceryGrid = html.match(/<div class="grocery-grid">[\s\S]*?(?=<\/section|<div class="section-num"|<\/body)/);
  if (groceryGrid) parts.push(groceryGrid[0]);
  return parts.join('\n');
}
