'use client';

interface WizardFreeTextInputProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  maxChars?: number;
  disabled?: boolean;
  rows?: number;
}

const TERRACOTTA = '#C84B31';
const AVOID = '#6b2a1a';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

export default function WizardFreeTextInput({
  value,
  onChange,
  placeholder,
  maxChars,
  disabled,
  rows = 4,
}: WizardFreeTextInputProps) {
  const text = value ?? '';
  const charCount = text.length;
  const isNearLimit = maxChars ? charCount > maxChars * 0.9 : false;
  const isOverLimit = maxChars ? charCount > maxChars : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type your answer...'}
        disabled={disabled}
        maxLength={maxChars}
        rows={rows}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 12,
          border: `1.5px solid ${isOverLimit ? AVOID : SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK,
          fontSize: 15,
          fontFamily: 'inherit',
          lineHeight: 1.5,
          resize: 'vertical',
          minHeight: 110,
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = isOverLimit ? AVOID : TERRACOTTA;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${(isOverLimit ? AVOID : TERRACOTTA)}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isOverLimit ? AVOID : SAND_DEEP;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {maxChars && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontSize: 12,
              color: isOverLimit ? AVOID : isNearLimit ? TERRACOTTA : INK_FADED,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {charCount}/{maxChars}
          </span>
        </div>
      )}
    </div>
  );
}
