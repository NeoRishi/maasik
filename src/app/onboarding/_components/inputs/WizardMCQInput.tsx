'use client';

import { useRef } from 'react';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface WizardMCQInputProps {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  onAutoAdvance?: () => void;
  /** Values that should NOT trigger auto-advance (typically the "Other" sentinel that reveals a text field). */
  autoAdvanceSkipValues?: string[];
  autoAdvanceDelayMs?: number;
  disabled?: boolean;
}

const TERRACOTTA = '#C84B31';
const TERRACOTTA_TINT = 'rgba(200, 75, 49, 0.08)';
const TERRACOTTA_BORDER = 'rgba(200, 75, 49, 0.55)';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

export default function WizardMCQInput({
  options,
  value,
  onChange,
  onAutoAdvance,
  autoAdvanceSkipValues,
  autoAdvanceDelayMs = 450,
  disabled = false,
}: WizardMCQInputProps) {
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (optVal: string) => {
    if (disabled) return;
    onChange(optVal);
    if (onAutoAdvance && !autoAdvanceSkipValues?.includes(optVal)) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(onAutoAdvance, autoAdvanceDelayMs);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 10,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
              padding: '16px 18px',
              borderRadius: 12,
              border: isSelected
                ? `2px solid ${TERRACOTTA_BORDER}`
                : `1.5px solid ${SAND_DEEP}`,
              background: isSelected ? TERRACOTTA_TINT : CREAM_WARM,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              minHeight: 60,
              position: 'relative',
              width: '100%',
              fontFamily: 'inherit',
            }}
          >
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: TERRACOTTA,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6.5L4.5 9L10 3"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <span
              style={{
                fontSize: 'clamp(15px, 1.4vw, 17px)',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? TERRACOTTA : INK,
                lineHeight: 1.45,
                paddingRight: isSelected ? 28 : 0,
              }}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span
                style={{
                  fontSize: 12,
                  color: INK_FADED,
                  lineHeight: 1.4,
                  marginTop: 2,
                }}
              >
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
