'use client';

import { useEffect, useMemo } from 'react';
import type { FlatQuestion } from '../_lib/question-flat';
import type { OnboardingDraft } from '../_lib/validation';
import { validatePart } from '../_lib/validation';
import WizardMCQInput from './inputs/WizardMCQInput';
import WizardMultiSelectInput from './inputs/WizardMultiSelectInput';
import WizardNumberInput from './inputs/WizardNumberInput';
import WizardShortTextInput from './inputs/WizardShortTextInput';
import WizardFreeTextInput from './inputs/WizardFreeTextInput';
import WizardTimePicker from './inputs/WizardTimePicker';
import WizardUnitToggleInput from './inputs/WizardUnitToggleInput';
import WizardSelectInput from './inputs/WizardSelectInput';
import WizardCityInput from './inputs/WizardCityInput';
import WizardPhoneInput from './inputs/WizardPhoneInput';

interface QuestionScreenProps {
  flat: FlatQuestion;
  answers: OnboardingDraft;
  onAnswer: (field: string, value: unknown) => void;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isLast: boolean;
  returnToReview: boolean;
}

export default function QuestionScreen({
  flat,
  answers,
  onAnswer,
  onBack,
  onNext,
  canGoBack,
  isLast,
  returnToReview,
}: QuestionScreenProps) {
  const q = flat.question;
  const value = (answers as Record<string, unknown>)[q.field];

  // Per-question validation: build a tiny part-style errors map.
  const fieldError = useMemo(() => {
    const partErrors = validatePart(q.part, answers);
    return partErrors[q.field] ?? null;
  }, [q.field, q.part, answers]);

  const canAdvance = useMemo(() => {
    if (!q.required) return true;
    if (fieldError) return false;
    if (q.type === 'multi_select') {
      return Array.isArray(value) && (value as unknown[]).length > 0;
    }
    if (q.type === 'dual_time') {
      const primary = value as string | null | undefined;
      const secondary = q.secondaryField
        ? ((answers as Record<string, unknown>)[q.secondaryField] as string | null | undefined)
        : null;
      return !!primary && !!secondary;
    }
    if (q.type === 'number' || q.type === 'select' || q.type === 'height' || q.type === 'weight') {
      return typeof value === 'number' && !Number.isNaN(value);
    }
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  }, [q, value, answers, fieldError]);

  // Keyboard: Enter advances when allowed. Shift+Tab handled natively by browser focus order; we add a key handler for explicit back.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        // Only when not inside a multi-line textarea
        if (tag === 'TEXTAREA') return;
        if (!canAdvance) return;
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canAdvance, onNext]);

  const ctaLabel = returnToReview
    ? 'Save edit'
    : isLast
      ? 'Review my answers'
      : 'Continue';

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
          padding: '120px 24px 140px',
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(24px, 4.2vw, 32px)',
            lineHeight: 1.25,
            color: '#2D2A26',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: q.subtitle ? 14 : 32,
          }}
        >
          {q.prompt}
        </h1>

        {q.subtitle && (
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: 1.55,
              color: '#8a7d6a',
              marginBottom: 32,
              maxWidth: 560,
            }}
          >
            {q.subtitle}
          </p>
        )}

        <div style={{ marginBottom: 16 }}>
          {renderInput(q, value, answers, onAnswer, canAdvance ? onNext : undefined)}
        </div>

        {fieldError && (
          <p
            role="alert"
            style={{
              marginTop: 12,
              fontSize: 13,
              color: '#6b2a1a',
            }}
          >
            {fieldError}
          </p>
        )}

        {q.hint && (
          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              color: '#8a7d6a',
            }}
          >
            {q.hint}
          </p>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderTop: '1px solid rgba(217, 201, 167, 0.6)',
          background: 'rgba(250, 243, 231, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          style={{
            background: 'none',
            border: 'none',
            color: canGoBack ? '#8a7d6a' : 'rgba(138, 125, 106, 0.4)',
            fontSize: 14,
            fontWeight: 500,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            padding: 8,
            fontFamily: 'inherit',
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          style={{
            background: canAdvance ? '#C84B31' : 'rgba(200, 75, 49, 0.35)',
            color: '#FAF3E7',
            padding: '12px 26px',
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: 'none',
            cursor: canAdvance ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            boxShadow: canAdvance ? '0 12px 24px -12px rgba(122, 40, 24, 0.45)' : 'none',
            transition: 'background 180ms ease, box-shadow 180ms ease',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function renderInput(
  q: FlatQuestion['question'],
  value: unknown,
  answers: OnboardingDraft,
  onAnswer: (field: string, value: unknown) => void,
  onAutoAdvance: (() => void) | undefined,
) {
  switch (q.type) {
    case 'single_select': {
      const selected = value as string | null;
      const skipAdvance = q.revealsTextOn ? [q.revealsTextOn] : undefined;
      return (
        <>
          <WizardMCQInput
            options={q.options ?? []}
            value={selected}
            onChange={(v) => onAnswer(q.field, v)}
            onAutoAdvance={onAutoAdvance}
            autoAdvanceSkipValues={skipAdvance}
          />
          {q.revealsTextOn && q.otherField && selected === q.revealsTextOn && (
            <div style={{ marginTop: 12 }}>
              <WizardShortTextInput
                value={(answers as Record<string, unknown>)[q.otherField] as string | null}
                onChange={(v) => onAnswer(q.otherField as string, v)}
                placeholder="Please specify"
                maxLength={120}
              />
            </div>
          )}
        </>
      );
    }
    case 'multi_select': {
      const selected = (value as string[] | null) ?? [];
      const showOther = !!(q.revealsTextOn && q.otherField && selected.includes(q.revealsTextOn));
      return (
        <>
          <WizardMultiSelectInput
            options={q.options ?? []}
            value={selected}
            onChange={(v) => onAnswer(q.field, v)}
            maxSelections={q.maxSelections}
          />
          {showOther && (
            <div style={{ marginTop: 12 }}>
              <WizardShortTextInput
                value={(answers as Record<string, unknown>)[q.otherField as string] as string | null}
                onChange={(v) => onAnswer(q.otherField as string, v)}
                placeholder="Please specify"
                maxLength={300}
              />
            </div>
          )}
        </>
      );
    }
    case 'number':
      return (
        <WizardNumberInput
          value={(value as number | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          config={{
            min: q.min,
            max: q.max,
            placeholder: q.placeholder,
            unit: q.field === 'age' ? 'years' : undefined,
          }}
        />
      );
    case 'select': {
      const min = q.min ?? 0;
      const max = q.max ?? 0;
      const options = [] as { value: string; label: string }[];
      for (let n = min; n <= max; n++) options.push({ value: String(n), label: String(n) });
      const current = typeof value === 'number' ? String(value) : null;
      return (
        <WizardSelectInput
          options={options}
          value={current}
          onChange={(v) => onAnswer(q.field, v === '' ? null : parseInt(v, 10))}
          placeholder={q.placeholder}
          onAutoAdvance={onAutoAdvance}
        />
      );
    }
    case 'city_autocomplete':
      return (
        <WizardCityInput
          value={(value as string | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          placeholder={q.placeholder}
          maxLength={q.maxLength}
        />
      );
    case 'short_answer':
      return (
        <WizardShortTextInput
          value={(value as string | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          placeholder={q.placeholder}
          maxLength={q.maxLength}
        />
      );
    case 'long_answer':
      return (
        <WizardFreeTextInput
          value={(value as string | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          placeholder={q.placeholder}
          maxChars={q.maxLength}
          rows={4}
        />
      );
    case 'email':
      return (
        <WizardShortTextInput
          value={(value as string | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          placeholder={q.placeholder}
          type="email"
          autoComplete="email"
        />
      );
    case 'phone':
      return (
        <WizardPhoneInput
          value={(value as string | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
          placeholder={q.placeholder}
        />
      );
    case 'dual_time': {
      const secondaryField = q.secondaryField as string;
      const secondary = (answers as Record<string, unknown>)[secondaryField] as string | null;
      return (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <WizardTimePicker
              value={(value as string | null) ?? null}
              onChange={(v) => onAnswer(q.field, v)}
              label={q.primaryLabel}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <WizardTimePicker
              value={secondary}
              onChange={(v) => onAnswer(secondaryField, v)}
              label={q.secondaryLabel}
            />
          </div>
        </div>
      );
    }
    case 'height':
      return (
        <WizardUnitToggleInput
          mode="height"
          value={(value as number | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
        />
      );
    case 'weight':
      return (
        <WizardUnitToggleInput
          mode="weight"
          value={(value as number | null) ?? null}
          onChange={(v) => onAnswer(q.field, v)}
        />
      );
    default:
      return null;
  }
}
