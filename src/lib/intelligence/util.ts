// NeoRishi shared intelligence — deterministic serialization.
//
// PRODUCER-AGNOSTIC, dependency-free. stableStringify sorts object keys
// recursively so JSON output is byte-stable regardless of insertion order.
// Arrays keep their order (already deterministic by construction upstream).
// Shared (non-circular) references serialize independently; genuine cycles are
// rejected by JSON.stringify itself.

export function stableStringify(value: unknown, indent = 2): string {
  const sortKeys = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(sortKeys);
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortKeys((v as Record<string, unknown>)[k]);
    }
    return out;
  };
  return JSON.stringify(sortKeys(value), null, indent);
}
