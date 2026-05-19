'use client';

interface WizardShortTextInputProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email';
  autoComplete?: string;
  disabled?: boolean;
  maxLength?: number;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';

export default function WizardShortTextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  disabled,
  maxLength,
}: WizardShortTextInputProps) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      maxLength={maxLength}
      inputMode={type === 'email' ? 'email' : 'text'}
      style={{
        width: '100%',
        height: 56,
        padding: '0 18px',
        borderRadius: 12,
        border: `1.5px solid ${SAND_DEEP}`,
        background: CREAM_WARM,
        color: INK,
        fontSize: 17,
        fontFamily: 'inherit',
        outline: 'none',
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
  );
}
