// Maasik parser — integrity-check contract.
//
// Independent verification that extraction is complete and the registries are
// coherent. Throws on the first non-empty failure set; never returns a report
// with ok:false on a happy path.

import { SLOT_REGISTRY } from '../slot-registry';
import { ROUTING_REGISTRY } from '../routing-registry';
import {
  MaasikParseError,
  type ExtractionResult,
  type IntegrityReport,
} from './types';

export function checkIntegrity(x: ExtractionResult): IntegrityReport {
  const dataSlotEntries = SLOT_REGISTRY.filter((e) => e.instrumentation === 'data-slot');
  const cssEntries = SLOT_REGISTRY.filter((e) => e.instrumentation === 'css');

  const foundSet = new Set(x.hooksFound);
  const missingHooks = dataSlotEntries
    .filter((e) => !foundSet.has(e.hook))
    .map((e) => e.hook);

  const seen = new Map<string, number>();
  for (const h of x.hooksFound) seen.set(h, (seen.get(h) ?? 0) + 1);
  const duplicateHooks = [...seen.entries()].filter(([, n]) => n > 1).map(([h]) => h);

  // Registry-level presentation_path collisions (static, deterministic).
  const byPath = new Map<string, string[]>();
  for (const e of SLOT_REGISTRY) {
    byPath.set(e.presentation_path, [...(byPath.get(e.presentation_path) ?? []), e.slot]);
  }
  const pathCollisions = [...byPath.entries()]
    .filter(([, slots]) => slots.length > 1)
    .map(([path, slots]) => ({ path, slots }));

  // Every routed semantic_id must have an extracted value (incl. body_from).
  const unroutableRules: string[] = [];
  for (const r of ROUTING_REGISTRY) {
    if (!x.values.has(r.semantic_id)) unroutableRules.push(r.semantic_id);
    if (r.body_from && !x.values.has(r.body_from)) unroutableRules.push(r.body_from);
  }

  const cssSlotsResolved = cssEntries
    .filter((e) => x.values.has(e.semantic_id))
    .map((e) => e.slot);

  const report: IntegrityReport = {
    expectedDataSlotHooks: dataSlotEntries.length,
    foundHooks: x.hooksFound.length,
    missingHooks,
    duplicateHooks,
    pathCollisions,
    unroutableRules,
    cssSlotsResolved,
    ok:
      missingHooks.length === 0 &&
      duplicateHooks.length === 0 &&
      pathCollisions.length === 0 &&
      unroutableRules.length === 0 &&
      cssSlotsResolved.length === cssEntries.length,
  };

  if (!report.ok) {
    if (report.duplicateHooks.length)
      throw new MaasikParseError('E_HOOK_DUPLICATE', report.duplicateHooks.join(', '));
    if (report.missingHooks.length)
      throw new MaasikParseError('E_HOOK_MISSING', report.missingHooks.join(', '));
    if (report.pathCollisions.length)
      throw new MaasikParseError(
        'E_PATH_COLLISION',
        report.pathCollisions.map((c) => c.path).join(', '),
      );
    if (report.unroutableRules.length)
      throw new MaasikParseError('E_ROUTE_UNRESOLVED', report.unroutableRules.join(', '));
    if (report.cssSlotsResolved.length !== cssEntries.length)
      throw new MaasikParseError('E_CSS_SLOT_MISSING', 'css slot(s) unresolved');
  }

  return report;
}
