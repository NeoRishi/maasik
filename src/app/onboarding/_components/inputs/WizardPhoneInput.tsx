'use client';

import { useEffect, useRef, useState } from 'react';

interface WizardPhoneInputProps {
  value: string | null; // E.164, e.g. "+919812345678", or null
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

function stripToDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

function fromE164(v: string | null): string {
  if (!v) return '';
  const m = v.match(/^\+91(\d{10})$/);
  return m ? m[1] : v.replace(/\D/g, '').slice(-10);
}

export default function WizardPhoneInput({
  value,
  onChange,
  placeholder = '98765 43210',
  disabled = false,
}: WizardPhoneInputProps) {
  const [digits, setDigits] = useState<string>(fromE164(value));
  const hydrated = useRef(false);

  // Hydrate once from external value (e.g. resume from localStorage).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setDigits(fromE164(value));
  }, [value]);

  const emit = (next: string) => {
    setDigits(next);
    if (next.length === 10) onChange(`+91${next}`);
    else onChange(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 10,
        width: '100%',
      }}
    >
      <div
        aria-hidden
        style={{
          height: 56,
          padding: '0 14px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK_FADED,
          fontSize: 16,
          fontFamily: 'inherit',
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'center',
          minWidth: 64,
          letterSpacing: '0.02em',
        }}
      >
        +91
      </div>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={digits}
        onChange={(e) => emit(stripToDigits(e.target.value))}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text');
          emit(stripToDigits(text));
        }}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={10}
        style={{
          flex: 1,
          height: 56,
          padding: '0 18px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK,
          fontSize: 17,
          fontFamily: 'inherit',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.04em',
          outline: 'none',
          minWidth: 0,
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TERRACOTTA;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${TERRACOTTA}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = SAND_DEEP;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
