'use client';

import { useMemo } from 'react';
import { PARTS, questionsForPart, TOTAL_PARTS, type Question } from '../_lib/questions';
import type { OnboardingDraft } from '../_lib/validation';
import WizardMCQInput from './inputs/WizardMCQInput';
import WizardMultiSelectInput from './inputs/WizardMultiSelectInput';
import WizardNumberInput from './inputs/WizardNumberInput';
import WizardFreeTextInput from './inputs/WizardFreeTextInput';
import WizardShortTextInput from './inputs/WizardShortTextInput';
import WizardTimePicker from './inputs/WizardTimePicker';
import WizardUnitToggleInput from './inputs/WizardUnitToggleInput';

interface PartSectionProps {
  partNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  draft: OnboardingDraft;
  setField: (field: string, value: unknown) => void;
  errors: Record<string, string>;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
}

const TERRACOTTA = '#C84B31';
const AVOID = '#6b2a1a';
const SAND_DEEP = '#d9c9a7';

export default function PartSection({
  partNumber,
  draft,
  setField,
  errors,
  onBack,
  onNext,
  canGoBack,
}: PartSectionProps) {
  const part = PARTS[partNumber - 1];
  const questions = useMemo(() => questionsForPart(partNumber), [partNumber]);
  const progressPct = (partNumber / TOTAL_PARTS) * 100;

  return (
    <div className="mx-auto max-w-prose540 px-5 md:px-6 py-6 md:py-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <p
            className="font-display text-[11px] uppercase text-ink-faded font-semibold"
            style={{ letterSpacing: '0.18em' }}
          >
            Part {partNumber} of {TOTAL_PARTS}
          </p>
          <p className="text-[11px] text-ink-faded">{part.duration}</p>
        </div>
        <div
          style={{
            height: 3,
            width: '100%',
            background: '#e8dcc1',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: TERRACOTTA,
              transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Section header */}
      <header className="mb-7">
        <h2 className="font-display text-2xl md:text-3xl text-ink leading-snug">{part.title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{part.intro}</p>
      </header>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q) => (
          <QuestionBlock
            key={q.id}
            question={q}
            draft={draft}
            setField={setField}
            error={errors[q.field] ?? (q.secondaryField ? errors[q.secondaryField] : undefined)}
          />
        ))}
      </div>

      {/* Footer nav */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          style={{
            padding: '12px 22px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            background: 'transparent',
            color: canGoBack ? '#4a3f31' : '#bdb29a',
            border: `1.5px solid ${SAND_DEEP}`,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          style={{
            padding: '12px 28px',
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 600,
            background: TERRACOTTA,
            color: '#FAF3E7',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
            fontFamily: 'inherit',
          }}
        >
          {partNumber === TOTAL_PARTS ? 'Review & Finish →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

interface QuestionBlockProps {
  question: Question;
  draft: OnboardingDraft;
  setField: (field: string, value: unknown) => void;
  error?: string;
}

function QuestionBlock({ question: q, draft, setField, error }: QuestionBlockProps) {
  const value = (draft as Record<string, unknown>)[q.field];

  const showOther = (() => {
    if (!q.revealsTextOn) return false;
    if (q.type === 'single_select') return value === q.revealsTextOn;
    if (q.type === 'multi_select')
      return Array.isArray(value) && (value as string[]).includes(q.revealsTextOn);
    return false;
  })();

  return (
    <section>
      <h3 className="font-display text-[19px] md:text-[20px] text-ink leading-snug mb-1">
        {q.prompt}
        {q.required && <span style={{ color: TERRACOTTA, marginLeft: 4 }}>*</span>}
      </h3>
      {q.subtitle && (
        <p className="text-[13px] leading-relaxed text-ink-faded mb-4">{q.subtitle}</p>
      )}
      {q.hint && <p className="text-[12px] text-ink-faded mb-3 italic">{q.hint}</p>}

      <div className="mt-2">
        <RenderInput question={q} draft={draft} setField={setField} />
      </div>

      {showOther && q.otherField && (
        <div className="mt-3">
          <WizardShortTextInput
            value={(draft as Record<string, unknown>)[q.otherField] as string | null}
            onChange={(v) => setField(q.otherField!, v)}
            placeholder="Please specify…"
            maxLength={200}
          />
        </div>
      )}

      {error && (
        <p
          className="mt-2 text-[13px] font-medium"
          style={{ color: AVOID }}
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}

function RenderInput({
  question: q,
  draft,
  setField,
}: {
  question: Question;
  draft: OnboardingDraft;
  setField: (field: string, value: unknown) => void;
}) {
  const value = (draft as Record<string, unknown>)[q.field];

  switch (q.type) {
    case 'single_select':
      return (
        <WizardMCQInput
          options={q.options ?? []}
          value={value as string | null}
          onChange={(v) => setField(q.field, v)}
        />
      );

    case 'multi_select':
      return (
        <WizardMultiSelectInput
          options={q.options ?? []}
          value={(value as string[] | null) ?? null}
          onChange={(v) => setField(q.field, v)}
          maxSelections={q.maxSelections}
        />
      );

    case 'short_answer':
      return (
        <WizardShortTextInput
          value={value as string | null}
          onChange={(v) => setField(q.field, v)}
          placeholder={q.placeholder}
          maxLength={q.maxLength}
        />
      );

    case 'long_answer':
      return (
        <WizardFreeTextInput
          value={value as string | null}
          onChange={(v) => setField(q.field, v)}
          placeholder={q.placeholder}
          maxChars={q.maxLength}
        />
      );

    case 'number':
      return (
        <WizardNumberInput
          value={value as number | null}
          onChange={(v) => setField(q.field, v)}
          config={{
            min: q.min,
            max: q.max,
            step: 1,
            placeholder: q.placeholder,
            unit: q.field === 'age' ? 'years' : undefined,
          }}
        />
      );

    case 'email':
      return (
        <WizardShortTextInput
          value={value as string | null}
          onChange={(v) => setField(q.field, v)}
          placeholder={q.placeholder}
          type="email"
          autoComplete="email"
        />
      );

    case 'height':
      return (
        <WizardUnitToggleInput
          mode="height"
          value={value as number | null}
          onChange={(v) => setField(q.field, v)}
        />
      );

    case 'weight':
      return (
        <WizardUnitToggleInput
          mode="weight"
          value={value as number | null}
          onChange={(v) => setField(q.field, v)}
        />
      );

    case 'dual_time':
      return (
        <div className="grid grid-cols-2 gap-3">
          <WizardTimePicker
            label={q.primaryLabel ?? 'Sleep'}
            value={value as string | null}
            onChange={(v) => setField(q.field, v)}
          />
          <WizardTimePicker
            label={q.secondaryLabel ?? 'Wake'}
            value={(draft as Record<string, unknown>)[q.secondaryField ?? ''] as string | null}
            onChange={(v) => setField(q.secondaryField!, v)}
          />
        </div>
      );

    default:
      return null;
  }
}
