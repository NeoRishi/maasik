// Progress persistence for the assessment flow.
// Single key, schema-versioned, timestamped, with a 7-day TTL for resume.

import type { OnboardingDraft } from './validation';
import type { FlowPhase } from './flow-state';

const STORAGE_KEY = 'maasik_assessment_progress';
const SCHEMA_VERSION = 1;
const RESUME_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Legacy keys we migrate from on first read so existing in-flight users don't lose answers.
const LEGACY_DRAFT_KEY = 'maasik:onboarding:draft:v1';
const LEGACY_STEP_KEY = 'maasik:onboarding:step:v1';

export interface StoredProgress {
  v: number;
  phase: FlowPhase;
  questionIndex: number;
  answers: OnboardingDraft;
  savedAt: number;
}

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const probe = '__maasik_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadProgress(): StoredProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredProgress;
      if (!parsed || parsed.v !== SCHEMA_VERSION) return null;
      if (Date.now() - parsed.savedAt > RESUME_TTL_MS) return null;
      return parsed;
    }
    // Try legacy migration: old wizard kept draft + step in separate keys.
    const legacyDraft = window.localStorage.getItem(LEGACY_DRAFT_KEY);
    if (legacyDraft) {
      try {
        const draft = JSON.parse(legacyDraft) as OnboardingDraft;
        const stepRaw = window.localStorage.getItem(LEGACY_STEP_KEY);
        const step = stepRaw ? Number(stepRaw) : 0;
        // Old step was 0..8 (welcome, parts 1..7, completion).
        // We map: 0 -> welcome, 8 -> review, otherwise question phase at start of section.
        let phase: FlowPhase = 'welcome';
        let questionIndex = 0;
        if (step >= 1 && step <= 7) {
          phase = 'question';
          // Best-effort: jump to first question of that part.
          // Q1..Q2 = part 1 (indices 0..1)
          // Q3..Q7 = part 2 (indices 2..6)
          // Q8..Q14 = part 3 (indices 7..13)
          // Q15..Q17 = part 4 (indices 14..16)
          // Q18..Q20 = part 5 (indices 17..19)
          // Q21..Q23 = part 6 (indices 20..22)
          // Q24..Q25 = part 7 (indices 23..24)
          const PART_START = [0, 0, 2, 7, 14, 17, 20, 23];
          questionIndex = PART_START[step] ?? 0;
        } else if (step === 8) {
          phase = 'review';
        }
        return {
          v: SCHEMA_VERSION,
          phase,
          questionIndex,
          answers: draft,
          savedAt: Date.now(),
        };
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Debounced save. Caller fires saveProgress() on every state change; we coalesce.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saveListeners = new Set<(success: boolean) => void>();

export function onSave(listener: (success: boolean) => void): () => void {
  saveListeners.add(listener);
  return () => saveListeners.delete(listener);
}

export function saveProgress(
  phase: FlowPhase,
  questionIndex: number,
  answers: OnboardingDraft,
  debounceMs: number = 400,
) {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload: StoredProgress = {
        v: SCHEMA_VERSION,
        phase,
        questionIndex,
        answers,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // Clear legacy keys once we've successfully migrated to the new schema.
      try {
        window.localStorage.removeItem(LEGACY_DRAFT_KEY);
        window.localStorage.removeItem(LEGACY_STEP_KEY);
      } catch {
        // ignore
      }
      saveListeners.forEach((l) => l(true));
    } catch {
      saveListeners.forEach((l) => l(false));
    }
  }, debounceMs);
}

export function clearProgress() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_DRAFT_KEY);
    window.localStorage.removeItem(LEGACY_STEP_KEY);
  } catch {
    // ignore
  }
}

export function relativeDaysAgo(timestamp: number): string {
  const ms = Date.now() - timestamp;
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    if (hours <= 0) return 'a few minutes ago';
    if (hours === 1) return 'an hour ago';
    return `${hours} hours ago`;
  }
  if (days === 1) return 'a day ago';
  return `${days} days ago`;
}
