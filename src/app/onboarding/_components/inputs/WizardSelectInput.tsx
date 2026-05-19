'use client';

import { useRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface WizardSelectInputProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onAutoAdvance?: () => void;
  autoAdvanceDelayMs?: number;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';

export default function WizardSelectInput({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  onAutoAdvance,
  autoAdvanceDelayMs = 450,
}: WizardSelectInputProps) {
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (next: string) => {
    onChange(next);
    if (onAutoAdvance && next) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(onAutoAdvance, autoAdvanceDelayMs);
    }
  };

  return (
    <select
      value={value ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      style={{
        height: 56,
        padding: '0 18px',
        borderRadius: 12,
        border: `1.5px solid ${SAND_DEEP}`,
        background: CREAM_WARM,
        color: value ? INK : 'rgba(45, 42, 38, 0.5)',
        fontSize: 17,
        fontFamily: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        outline: 'none',
        width: '100%',
        opacity: disabled ? 0.5 : 1,
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1L6 6L11 1' stroke='%238a7d6a' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 18px center',
        paddingRight: 44,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = TERRACOTTA;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${TERRACOTTA}22`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = SAND_DEEP;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
