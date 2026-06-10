# Maasik Option A Parser — Architecture (for review)

**Status:** design only, no implementation. Approve before code.
**Optimization priority:** Correctness > Determinism > Testability > Extensibility > Performance.
**Premise:** this is NeoRishi document-intelligence infrastructure. Maasik is the first producer, not the design center.

---

## 1. Architecture diagram

The pipeline has one hard boundary: everything left of it is producer-specific (knows about HTML and slots); everything right of it is producer-agnostic (knows only `semantic_id`-keyed values and the registries). A future producer such as Dinacharya re-enters the pipeline at the boundary by emitting the same intermediate, with no HTML at all.

```
                         PRODUCER-SPECIFIC  |  PRODUCER-AGNOSTIC
                                            |
  rendered HTML (v4.1)                      |
        |                                   |
        v                                   |
  [ Stage 1: EXTRACT ] --uses--> SLOT_REGISTRY
        |   walk [data-slot] + css regex    |
        |   dispatch on entry.extractor     |
        v                                   |
  ExtractionResult  ======== B O U N D A R Y ========> (also the re-entry
  (Map<semantic_id, ExtractedValue>)        |           point for future
        |                                   |           producers)
        +----------------------+            |
        |                      |            |
        v                      v            v
  [ Stage 2: PRESENTATION ]  [ Stage 3: SIGNALS ]   [ Stage 4: DIRECTIVES ]
   deep-set presentation_path  walk ROUTING_REGISTRY  walk ROUTING_REGISTRY
   collision detection         filter target=signal   filter target=directive
        |                      |            |
        v                      v            v
   Presentation            Signal[]     Directive[]
        |                      |            |
        +----------+-----------+------------+
                   v
        [ Stage 5: ASSEMBLE ] --stamps--> ParseContext (origin, version)
                   |
                   v
        content_json (maasik.content.v2)
                   |
                   v
        Renderer (Option C, later) consumes presentation only;
        app views consume signals + directives.
```

No stage reaches backward. Stage 2/3/4 never see HTML. Stage 1 never sees routing. Interpretation lives only in `ROUTING_REGISTRY`.

---

## 2. Module breakdown

All under `src/lib/maasik/parser/`.

| Module | Responsibility | May import | Must NOT |
|---|---|---|---|
| `types.ts` | All data contracts (below). Pure types. | — | hold logic |
| `extract.ts` | Stage 1. HTML string to `ExtractionResult`. Walks `[data-slot]`, runs the matching extractor, plus CSS regex for the 2 gradient slots. | `slot-registry`, `extractors/*`, an HTML parser | know routing, presentation paths, or content_json shape |
| `extractors/*.ts` | One pure function per `SlotExtractor` strategy (`text`, `rgba`, `svg-inner`, `svg-groups`, `rows-food`, `rows-anchor`, `list-grocery`). Input: a DOM node or raw string. Output: a typed value. | — | touch the registry, the DOM globally, or any other slot |
| `presentation.ts` | Stage 2. `ExtractionResult` to `Presentation` via `presentation_path` deep-set, with path-collision detection. | `slot-registry`, `types` | mint signals/directives, touch HTML |
| `signals.ts` | Stage 3. `ExtractionResult` + `ParseContext` to `Signal[]`, driven by `ROUTING_REGISTRY` (target=signal). | `routing-registry`, `slot-registry`, `types` | touch HTML or presentation; invent semantics not in the rule |
| `directives.ts` | Stage 4. Same, target=directive. | `routing-registry`, `slot-registry`, `types` | same |
| `integrity.ts` | The integrity-check contract. Computes the report and throws on any violation. | `slot-registry`, `routing-registry`, `types` | swallow errors |
| `index.ts` | Stage 5 orchestration + the single public entry point. Runs stages in order, runs integrity, stamps origin from `ParseContext`, assembles content_json. | all of the above | contain extraction/routing logic itself |

HTML parsing dependency: `node-html-parser` (deterministic, server-side, no browser, preserves source order and raw inner HTML). Flagged as a new dependency for approval. Rationale: `jsdom` is heavier and its serialization is less predictable; `cheerio` pulls a larger tree. For `[data-slot]` selection and `innerHTML`/`textContent` reads, `node-html-parser` is the minimal deterministic choice.

---

## 3. Public interfaces

```ts
// The only entry point the orchestrator calls.
export function parseMaasikReport(
  html: string,
  ctx: ParseContext,
): ParseResult;

// Stage functions are exported too, for unit tests and for future
// producers that re-enter at the boundary (they build their own
// ExtractionResult and call stages 2 to 5 directly).
export function extract(html: string): ExtractionResult;
export function assemblePresentation(x: ExtractionResult): Presentation;
export function generateSignals(x: ExtractionResult, ctx: ParseContext): Signal[];
export function generateDirectives(x: ExtractionResult, ctx: ParseContext): Directive[];
export function checkIntegrity(x: ExtractionResult): IntegrityReport; // throws on violation
```

---

## 4. Data contracts

### 4.1 Parser input contract

```ts
interface ParseContext {
  producer: 'maasik';        // identifies the producer in origin + node ids
  sourceRef: string;         // e.g. "report:<uuid>". Injected, never derived.
  generatedAt: string;       // ISO-8601. Injected by caller, NOT minted here.
  schemaVersion: 'maasik.content.v2';
  templateVersion: string;   // e.g. "v4.1", recorded for provenance
}
```

`generatedAt` and `sourceRef` are inputs precisely so the parser stays pure. Identical `(html, ctx, registries)` always yields identical output.

### 4.2 Extraction output contract (the boundary intermediate)

```ts
type ExtractedValue =
  | { kind: 'scalar'; text: string }
  | { kind: 'structured'; shape: 'food' | 'anchor' | 'grocery'; rows: unknown[] }
  | { kind: 'visual'; form: 'rgba' | 'svg-inner' | 'svg-groups'; raw: string };

interface ExtractionResult {
  values: ReadonlyMap<string /* semantic_id */, ExtractedValue>;
  hooksFound: readonly string[];   // data-slot hooks seen, in document order
}
```

Structured row shapes are typed concretely in `types.ts` (food row = `{ category, items[] }`; anchor row = `{ time, name, detail }`; grocery item = `{ name, qty }`). Listed abstractly here for brevity.

### 4.3 Presentation contract

`Presentation` is an opaque nested object whose paths are exactly the `presentation_path` values in `SLOT_REGISTRY`. It is the byte-parity fuel for Option C. The parser treats it as write-only structure; it asserts no shape beyond "every data-slot + css slot resolved to a path, no two slots wrote the same path."

### 4.4 Signal contract (`maasik.content.v2`)

```ts
interface Signal {
  id: string;                 // `${producer}:signal:${semantic_id}` - deterministic, stable
  kind: 'observation' | 'insight' | 'opportunity' | 'risk';
  pillar: Pillar | null;
  statement: string;          // verbatim primary slot text
  detail?: string;            // verbatim body_from slot text, when the rule sets body_from
  scope: { grain: Grain; window?: string; recurrence?: string };
  origin: { producer; method: 'transcribed'; source_ref; generated_at; version };
  polarity: 'positive' | 'neutral' | 'negative';
  classification: { purushartha: []; compass: [] };   // empty in v1 (see open decisions)
  evidence: [];               // empty in v1
  source_slots: string[];     // the SLOT(s) that sourced it (primary [+ body_from])
}
```

### 4.5 Directive contract (`maasik.content.v2`)

```ts
interface Directive {
  id: string;                 // `${producer}:directive:${semantic_id}`
  kind: 'recommendation' | 'practice' | 'commitment';
  pillar: Pillar | null;
  statement: string;          // verbatim primary slot text
  detail?: string;            // verbatim body_from slot text, when set
  scope: { grain: Grain; window?: string; recurrence?: string };
  origin: { producer; method: 'transcribed'; source_ref; generated_at; version };
  polarity: 'do' | 'avoid';
  trackable: boolean;         // deterministic from kind (practice|commitment => true)
  justified_by: [];           // empty in v1 (no justification edges defined yet)
  serves: [];                 // empty in v1
  classification: { purushartha: []; compass: []; karma_tag: null };  // empty in v1
  source_slots: string[];
}
```

### 4.6 Integrity-check contract

```ts
interface IntegrityReport {
  expectedDataSlotHooks: number;   // 93
  foundHooks: number;
  missingHooks: string[];
  duplicateHooks: string[];
  pathCollisions: Array<{ path: string; slots: string[] }>;
  unroutableRules: string[];       // routing semantic_ids with no matching slot/value
  cssSlotsResolved: string[];      // the 2 gradient slots
  ok: boolean;
}
```

`checkIntegrity` throws on the first non-empty failure set. No report with `ok: false` is ever returned to a happy path.

### 4.7 Parse result

```ts
interface ParseResult {
  contentJson: ContentJsonV2;   // { schema_version, meta, vedic_context, presentation, signals, directives, narrative? }
  integrity: IntegrityReport;   // ok: true by construction
}
```

Narrative is not produced by the parser. It is the only authored block and is merged in by the orchestrator from the trimmed LLM call. The parser leaves `narrative` absent.

---

## 5. Determinism rules (enforced, not aspirational)

1. Node ids derive from `semantic_id`, never counters or UUIDs: `maasik:signal:archetype.tendency_body`. Stable across runs and across report editions.
2. `signals[]` and `directives[]` are emitted in `ROUTING_REGISTRY` array order, not Map-iteration order.
3. No `Date.now()`, no `Math.random()`, no environment reads inside any stage. Time and source come from `ParseContext`.
4. Extractors are pure functions of their node/string input.
5. `presentation` keys are written in `SLOT_REGISTRY` order; serialization sorts object keys so JSON output is byte-stable.

---

## 6. Failure-mode matrix

| # | Condition | Detected in | Behavior | Error code |
|---|---|---|---|---|
| 1 | A registry data-slot hook is absent from the HTML | extract / integrity | throw | `E_HOOK_MISSING` |
| 2 | A hook appears more than once (canonical violated) | extract / integrity | throw | `E_HOOK_DUPLICATE` |
| 3 | A CSS gradient slot regex finds 0 matches | extract | throw | `E_CSS_SLOT_MISSING` |
| 4 | Two slots resolve to the same `presentation_path` | presentation | throw | `E_PATH_COLLISION` |
| 5 | A routing rule's `semantic_id` has no extracted value | signals/directives | throw | `E_ROUTE_UNRESOLVED` |
| 6 | A routing `body_from` has no extracted value | signals/directives | throw | `E_BODYFROM_UNRESOLVED` |
| 7 | An extractor receives a node whose inner shape is malformed (e.g. food row missing `<strong>`) | extractor | throw | `E_EXTRACT_SHAPE` |
| 8 | Registry/template drift (count mismatch) | registry load-time assert | throw | `E_REGISTRY_DRIFT` |
| 9 | `ParseContext` missing required field | index (entry) | throw | `E_CONTEXT_INVALID` |

No silent fallback exists for any row. Each throws a typed `MaasikParseError { code, slot?, detail }`.

---

## 7. Test strategy

Fixtures: one committed golden input (`fixtures/edition-02.instrumented.html`, a real rendered v4.1 report) and its expected output (`fixtures/edition-02.content.json`), both checked in.

| Suite | Asserts | Mechanism |
|---|---|---|
| Golden-file | `parseMaasikReport(goldenHtml, fixedCtx)` deep-equals `edition-02.content.json` | snapshot equality on stable JSON |
| Registry parity | every `SLOT_REGISTRY` entry is reached by extraction; `foundHooks` count = 93; css slots = 2 | run extract, diff against registry |
| Hook integrity | injected duplicate/missing hook fixtures throw the right code | negative tests |
| Routing coverage | every `ROUTING_REGISTRY.semantic_id` produced exactly one node; count = 20 (5 signals, 15 directives) | run stages 3+4, assert |
| Round-trip | Template to Extraction to Signals to Directives reproduces fixed expected nodes (ids, order, statements verbatim) | equality on the semantic layer |
| Determinism | parsing the same input twice yields byte-identical JSON | double-run + string compare |

Golden output is regenerated only by an explicit, reviewed command, never auto-updated by the test runner.

---

## 8. Open decisions (need your call before coding)

1. **`detail` field.** Title+detail nodes (the 5 anchors, the 2 fronts) span two slots. I propose a verbatim optional `detail` field rather than concatenating into `statement`, to keep structure. Confirm.
2. **`classification` / `confidence` / `justified_by`.** v2 schema has these fields, but the routing registry does not yet define purushartha/compass mappings, confidence values, or directive-to-signal justification edges. I propose emitting them empty/omitted in parser v1 (deterministic, no invented semantics), and adding them later as `ROUTING_REGISTRY` enrichments. Confirm this is the right "no silent semantics" stance.
3. **`node-html-parser` dependency.** Approve adding it, or you prefer a regex-only extractor (more brittle for `svg-groups`/structured rows, less dependency).

Optimization priority honored: this design fixes Correctness and Determinism first (pure stages, injected time, stable ids, loud failures), makes Testability structural (stage functions are independently testable), and earns Extensibility from the producer-agnostic boundary. Performance is last and untouched by these choices.
