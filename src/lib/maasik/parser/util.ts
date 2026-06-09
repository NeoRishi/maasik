// Thin re-export. The canonical, producer-agnostic implementation lives in the
// shared intelligence layer (src/lib/intelligence/util.ts); kept here so the
// parser barrel's `export { stableStringify } from './util'` stays stable.
export { stableStringify } from '../../intelligence/util';
