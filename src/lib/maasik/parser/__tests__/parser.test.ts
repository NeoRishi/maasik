import { describe, it, expect } from 'vitest';
import { renderFixture, FIXED_CTX } from '../__fixtures__/render-fixture';
import {
  parseMaasikReport,
  extract,
  checkIntegrity,
  generateSignals,
  generateDirectives,
  stableStringify,
  MaasikParseError,
} from '../index';
import { SLOT_REGISTRY } from '../../slot-registry';
import { ROUTING_REGISTRY } from '../../routing-registry';

const HTML = renderFixture();

describe('Stage 1 extraction + registry parity', () => {
  it('finds exactly the 93 data-slot hooks and resolves all 95 slots', () => {
    const x = extract(HTML);
    const dataSlot = SLOT_REGISTRY.filter((e) => e.instrumentation === 'data-slot');
    const css = SLOT_REGISTRY.filter((e) => e.instrumentation === 'css');
    expect(x.hooksFound.length).toBe(93);
    expect(new Set(x.hooksFound).size).toBe(93);
    expect(dataSlot.length).toBe(93);
    // every registry entry produced a value
    for (const e of SLOT_REGISTRY) expect(x.values.has(e.semantic_id)).toBe(true);
    expect(css.length).toBe(2);
  });

  it('integrity report is ok and complete', () => {
    const report = checkIntegrity(extract(HTML));
    expect(report.ok).toBe(true);
    expect(report.missingHooks).toEqual([]);
    expect(report.duplicateHooks).toEqual([]);
    expect(report.pathCollisions).toEqual([]);
    expect(report.unroutableRules).toEqual([]);
    expect(report.cssSlotsResolved.length).toBe(2);
  });
});

describe('Hook integrity (loud failure)', () => {
  it('throws E_HOOK_MISSING when a hook is removed', () => {
    const broken = HTML.replace('data-slot="archetype-name"', 'data-x="archetype-name"');
    expect(() => extract(broken)).toThrowError(MaasikParseError);
    try {
      extract(broken);
    } catch (e) {
      expect((e as MaasikParseError).code).toBe('E_HOOK_MISSING');
    }
  });

  it('throws E_HOOK_DUPLICATE when a canonical hook appears twice', () => {
    const dup = HTML.replace('</body>', '<div data-slot="archetype-name">dup</div></body>');
    expect(() => extract(dup)).toThrowError(/E_HOOK_DUPLICATE/);
  });

  it('throws E_CSS_SLOT_MISSING when a gradient value is absent', () => {
    const noGrad = HTML.replace('rgba(214,142,43,0.92)', 'transparent');
    expect(() => extract(noGrad)).toThrowError(/E_CSS_SLOT_MISSING/);
  });
});

describe('Routing coverage + determinism of ids', () => {
  it('mints exactly one node per routing rule (5 signals, 15 directives)', () => {
    const x = extract(HTML);
    const signals = generateSignals(x, FIXED_CTX);
    const directives = generateDirectives(x, FIXED_CTX);
    expect(signals.length).toBe(5);
    expect(directives.length).toBe(15);
    expect(signals.length + directives.length).toBe(ROUTING_REGISTRY.length);
  });

  it('every routed semantic_id resolves and ids are deterministic', () => {
    const x = extract(HTML);
    const ids = [
      ...generateSignals(x, FIXED_CTX).map((s) => s.id),
      ...generateDirectives(x, FIXED_CTX).map((d) => d.id),
    ];
    for (const r of ROUTING_REGISTRY) {
      const expected = `maasik:${r.target}:${r.semantic_id}`;
      expect(ids).toContain(expected);
    }
    // no random suffixes: id set size equals rule count
    expect(new Set(ids).size).toBe(ROUTING_REGISTRY.length);
  });

  it('title+detail nodes carry a verbatim detail field', () => {
    const x = extract(HTML);
    const directives = generateDirectives(x, FIXED_CTX);
    const anchor1 = directives.find((d) => d.id === 'maasik:directive:five_anchors.anchor_1_title');
    expect(anchor1?.detail).toBe('val_five_anchors.anchor_1_detail');
    expect(anchor1?.source_slots).toEqual(['ANCHOR_01_TITLE', 'ANCHOR_01_DETAIL']);
  });
});

describe('Round-trip + golden snapshot', () => {
  it('produces a stable content_json snapshot', () => {
    const { contentJson } = parseMaasikReport(HTML, FIXED_CTX);
    expect(stableStringify(contentJson)).toMatchSnapshot();
  });

  it('is deterministic: two parses are byte-identical', () => {
    const a = stableStringify(parseMaasikReport(HTML, FIXED_CTX).contentJson);
    const b = stableStringify(parseMaasikReport(HTML, FIXED_CTX).contentJson);
    expect(a).toBe(b);
  });

  it('rejects an invalid ParseContext', () => {
    expect(() =>
      parseMaasikReport(HTML, { ...FIXED_CTX, sourceRef: '' }),
    ).toThrowError(/E_CONTEXT_INVALID/);
  });
});
