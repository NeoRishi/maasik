// NeoRishi shared intelligence — public surface (future packages/intelligence).
//
// Producers import from here, never from each other. This barrel is the
// dependency boundary: everything under src/lib/intelligence/ is
// producer-agnostic and imports nothing from any producer (e.g. maasik/).

export * from './ontology';
export * from './routing';
export * from './util';
