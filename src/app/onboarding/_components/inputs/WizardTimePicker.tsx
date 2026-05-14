'use client';

interface WizardTimePickerProps {
  value: string | null; // "HH:MM" 24-hour
  onChange: (v: string) => void;
  disabled?: boolean;
  label?: string;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

function normalize(v: string | null): string {
  if (!v) return '';
  // Accept "HH:MM" or "HH:MM:SS" — return "HH:MM" for input[type=time]
  const m = v.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

export default function WizardTimePicker({
  value,
  onChange,
  disabled = false,
  label,
}: WizardTimePickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: INK_FADED,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
      )}
      <input
        type="time"
        value={normalize(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          height: 52,
          padding: '0 16px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK,
          fontSize: 17,
          fontFamily: 'inherit',
          fontVariantNumeric: 'tabular-nums',
          outline: 'none',
          width: '100%',
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
