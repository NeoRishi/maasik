'use client';

interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

interface WizardNumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  config?: NumberConfig;
  disabled?: boolean;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

export default function WizardNumberInput({
  value,
  onChange,
  config,
  disabled,
}: WizardNumberInputProps) {
  const { min, max, step = 1, unit, placeholder } = config ?? {};

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            onChange(null);
            return;
          }
          const num = parseFloat(raw);
          if (!isNaN(num)) onChange(num);
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          height: 52,
          padding: '0 16px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK,
          fontSize: 16,
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
      {unit && (
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: INK_FADED,
            minWidth: 36,
            textAlign: 'left',
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}
