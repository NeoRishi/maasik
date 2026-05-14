'use client';

import { useCallback, useEffect, useState } from 'react';
import WelcomeScreen from './_components/WelcomeScreen';
import CompletionScreen from './_components/CompletionScreen';
import PartSection from './_components/PartSection';
import { QUESTIONS, TOTAL_PARTS } from './_lib/questions';
import {
  EMPTY_DRAFT,
  validatePart,
  validateAll,
  type OnboardingDraft,
} from './_lib/validation';

const STORAGE_KEY = 'maasik:onboarding:draft:v1';
const STEP_KEY = 'maasik:onboarding:step:v1';

// Step model:
//   0       = Welcome
//   1..7    = Part 1..7
//   8       = Completion / submit
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function loadDraft(): { draft: OnboardingDraft; step: Step } {
  if (typeof window === 'undefined') return { draft: { ...EMPTY_DRAFT }, step: 0 };

  let savedDraft: OnboardingDraft = { ...EMPTY_DRAFT };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        savedDraft = { ...EMPTY_DRAFT, ...parsed };
      }
    }
  } catch {
    // ignore — corrupted localStorage
  }

  // Seed defaults from question schema for fresh drafts
  for (const q of QUESTIONS) {
    if (q.defaultValue !== undefined && (savedDraft as Record<string, unknown>)[q.field] == null) {
      (savedDraft as Record<string, unknown>)[q.field] = q.defaultValue;
    }
    if (q.defaultSecondaryValue !== undefined && q.secondaryField) {
      if ((savedDraft as Record<string, unknown>)[q.secondaryField] == null) {
        (savedDraft as Record<string, unknown>)[q.secondaryField] = q.defaultSecondaryValue;
      }
    }
  }

  let step: Step = 0;
  try {
    const rawStep = window.localStorage.getItem(STEP_KEY);
    if (rawStep) {
      const n = Number(rawStep);
      if (Number.isInteger(n) && n >= 0 && n <= 8) step = n as Step;
    }
  } catch {
    // ignore
  }

  return { draft: savedDraft, step };
}

export default function OnboardingPage() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<OnboardingDraft>({ ...EMPTY_DRAFT });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate from localStorage (and seed defaults) on mount
  useEffect(() => {
    const { draft: loaded, step: loadedStep } = loadDraft();
    setDraft(loaded);
    setStep(loadedStep);
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      window.localStorage.setItem(STEP_KEY, String(step));
    } catch {
      // ignore quota errors
    }
  }, [draft, step, hydrated]);

  const setField = useCallback((field: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const goToPart = (next: Step) => {
    setStep(next);
    setErrors({});
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStart = () => goToPart(1);

  const handleNext = () => {
    if (step >= 1 && step <= TOTAL_PARTS) {
      const partErrors = validatePart(step, draft);
      if (Object.keys(partErrors).length > 0) {
        setErrors(partErrors);
        // Scroll to top of part so the first error is visible
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      goToPart((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 0) goToPart((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const result = validateAll(draft);
    if (!result.ok) {
      // Jump back to the first part containing an error
      const firstErrorField = Object.keys(result.errors)[0];
      const offendingQuestion = QUESTIONS.find(
        (q) => q.field === firstErrorField || q.secondaryField === firstErrorField,
      );
      const partWithError: Step = (offendingQuestion?.part ?? 1) as Step;
      setErrors(result.errors);
      goToPart(partWithError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.payload,
          gender_other: draft.gender_other ?? null,
          medical_conditions_other: draft.medical_conditions_other ?? null,
          allergies_other: draft.allergies_other ?? null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        const msg = body?.error || `Submission failed (${res.status}). Please try again.`;
        setSubmitError(typeof msg === 'string' ? msg : 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }

      const paymentUrl: string | undefined = body.payment_url;
      if (!paymentUrl) {
        setSubmitError('Could not generate a payment link. Please try again in a moment.');
        setSubmitting(false);
        return;
      }

      // Clear stored draft so the next visit starts fresh
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STEP_KEY);
      } catch {
        // ignore
      }

      window.location.href = paymentUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="min-h-[100dvh] bg-cream">
        <div className="mx-auto max-w-prose540 px-6 py-16 text-center">
          <p className="text-ink-faded text-sm">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-cream paper-grain">
      {step === 0 && <WelcomeScreen onStart={handleStart} />}

      {step >= 1 && step <= TOTAL_PARTS && (
        <PartSection
          partNumber={step as 1 | 2 | 3 | 4 | 5 | 6 | 7}
          draft={draft}
          setField={setField}
          errors={errors}
          onBack={handleBack}
          onNext={handleNext}
          canGoBack={step > 1}
        />
      )}

      {step === 8 && (
        <CompletionScreen
          onContinue={handleSubmit}
          submitting={submitting}
          errorMessage={submitError}
        />
      )}
    </main>
  );
}
