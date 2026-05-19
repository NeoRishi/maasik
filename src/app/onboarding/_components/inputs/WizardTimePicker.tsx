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
  const m = v.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const hh = m[1].padStart(2, '0');
  const minute = parseInt(m[2], 10);
  // Snap to nearest 30 so prefilled "06:30" or "22:30" matches the dropdown options.
  const snapped = minute < 15 ? '00' : minute < 45 ? '30' : '00';
  const hour = minute >= 45 ? (parseInt(hh, 10) + 1) % 24 : parseInt(hh, 10);
  return `${String(hour).padStart(2, '0')}:${snapped}`;
}

function formatLabel(hh: number, mm: number): string {
  const period = hh < 12 ? 'AM' : 'PM';
  const display = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${display}:${String(mm).padStart(2, '0')} ${period}`;
}

const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const out: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      out.push({ value, label: formatLabel(h, m) });
    }
  }
  return out;
})();

export default function WizardTimePicker({
  value,
  onChange,
  disabled = false,
  label,
}: WizardTimePickerProps) {
  const selected = normalize(value);
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
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          height: 56,
          padding: '0 18px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: selected ? INK : 'rgba(45, 42, 38, 0.5)',
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
        {!selected && (
          <option value="" disabled>
            Pick a time
          </option>
        )}
        {TIME_SLOTS.map((slot) => (
          <option key={slot.value} value={slot.value}>
            {slot.label}
          </option>
        ))}
      </select>
    </div>
  );
}
