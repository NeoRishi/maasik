'use client';

import { FLAT_QUESTIONS } from '../_lib/question-flat';
import type { OnboardingDraft } from '../_lib/validation';

interface ReviewScreenProps {
  answers: OnboardingDraft;
  onEdit: (questionIndex: number) => void;
  onContinue: () => void;
}

export default function ReviewScreen({ answers, onEdit, onContinue }: ReviewScreenProps) {
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
          maxWidth: 720,
          margin: '0 auto',
          padding: '120px 24px 140px',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8a7d6a',
            marginBottom: 20,
          }}
        >
          Review
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(26px, 4.2vw, 34px)',
            lineHeight: 1.2,
            color: '#2D2A26',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: 16,
          }}
        >
          Quick review.
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#8a7d6a',
            marginBottom: 36,
            maxWidth: 520,
          }}
        >
          Edit anything before we calibrate your Rhythm Profile.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            borderTop: '1px solid rgba(217, 201, 167, 0.6)',
          }}
        >
          {FLAT_QUESTIONS.map((f, idx) => {
            const v = (answers as Record<string, unknown>)[f.question.field];
            return (
              <div
                key={f.question.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 1.5fr) auto',
                  gap: 16,
                  padding: '18px 0',
                  borderBottom: '1px solid rgba(217, 201, 167, 0.6)',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#8a7d6a',
                      marginBottom: 4,
                    }}
                  >
                    {f.sectionName}
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#4a3f31',
                      lineHeight: 1.45,
                    }}
                  >
                    {f.question.prompt}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: '#2D2A26',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {formatAnswer(f, v, answers)}
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C84B31',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    alignSelf: 'start',
                  }}
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          onClick={onContinue}
          style={{
            background: '#C84B31',
            color: '#FAF3E7',
            padding: '14px 30px',
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
          }}
        >
          Looks right. Continue to payment.
        </button>
      </div>
    </div>
  );
}

function formatAnswer(
  flat: { question: { type: string; options?: { value: string; label: string }[]; secondaryField?: string; otherField?: string } },
  value: unknown,
  answers: OnboardingDraft,
): string {
  const q = flat.question;
  if (value === null || value === undefined || value === '') return 'Not yet answered';

  if (q.type === 'single_select') {
    const opt = q.options?.find((o) => o.value === value);
    let label = opt?.label ?? String(value);
    if (q.otherField && value === 'other') {
      const other = (answers as Record<string, unknown>)[q.otherField] as string | null;
      if (other) label = `${label.replace(/\s\(please specify\)$/i, '')}: ${other}`;
    }
    return label;
  }

  if (q.type === 'multi_select') {
    // Tolerate legacy scalar values from older saved drafts (pre multi-select migration).
    const arr: string[] = Array.isArray(value)
      ? (value as string[])
      : typeof value === 'string' && value.length > 0
        ? [value]
        : [];
    if (arr.length === 0) return 'Not yet answered';
    const labels = arr.map((v) => q.options?.find((o) => o.value === v)?.label ?? v);
    let joined = labels.join(', ');
    if (q.otherField && arr.includes('other')) {
      const other = (answers as Record<string, unknown>)[q.otherField] as string | null;
      if (other) joined = `${joined} (${other})`;
    }
    return joined;
  }

  if (q.type === 'dual_time') {
    const primary = value as string;
    const secondary = q.secondaryField
      ? ((answers as Record<string, unknown>)[q.secondaryField] as string | null)
      : null;
    return `Sleep ${primary}, wake ${secondary ?? ''}`.trim();
  }

  if (q.type === 'height') {
    return `${value} cm`;
  }
  if (q.type === 'weight') {
    return `${value} kg`;
  }
  if (q.type === 'phone') {
    const v = String(value);
    if (/^\+91\d{10}$/.test(v)) return `+91 ${v.slice(3, 8)} ${v.slice(8)}`;
    return v;
  }

  return String(value);
}
