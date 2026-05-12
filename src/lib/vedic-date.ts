import { NEXT_SHUKLA_PRATIPADA } from './constants';

/**
 * Days from today (UTC midnight) to the next Shukla Pratipada (ISO date).
 * Computed at build time when called from a server component during static export.
 */
export function daysUntilNextShuklaPratipada(
  todayIso?: string,
  nextIso: string = NEXT_SHUKLA_PRATIPADA,
): number {
  const today = todayIso ? new Date(`${todayIso}T00:00:00Z`) : new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const next = new Date(`${nextIso}T00:00:00Z`);
  const nextUtc = Date.UTC(
    next.getUTCFullYear(),
    next.getUTCMonth(),
    next.getUTCDate(),
  );
  const ms = nextUtc - todayUtc;
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}
