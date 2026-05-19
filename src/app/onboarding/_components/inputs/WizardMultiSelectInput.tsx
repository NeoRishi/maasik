'use client';

interface Option {
  value: string;
  label: string;
  description?: string;
  exclusive?: boolean;
}

interface WizardMultiSelectInputProps {
  options: Option[];
  value: string[] | null;
  onChange: (value: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

const TERRACOTTA = '#C84B31';
const TERRACOTTA_TINT = 'rgba(200, 75, 49, 0.08)';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

export default function WizardMultiSelectInput({
  options,
  value,
  onChange,
  maxSelections,
  disabled,
}: WizardMultiSelectInputProps) {
  const selected = value ?? [];
  const atMax = maxSelections ? selected.length >= maxSelections : false;

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    const opt = options.find((o) => o.value === optionValue);
    const isCurrentlySelected = selected.includes(optionValue);

    if (opt?.exclusive) {
      // Clicking an exclusive option toggles only itself.
      // If selecting, clear everything else; if deselecting, just clear it.
      if (isCurrentlySelected) {
        onChange([]);
      } else {
        onChange([optionValue]);
      }
      return;
    }

    // Non-exclusive option: deselect any exclusive option first
    const exclusiveValues = options.filter((o) => o.exclusive).map((o) => o.value);
    let next = selected.filter((v) => !exclusiveValues.includes(v));

    if (isCurrentlySelected) {
      next = next.filter((v) => v !== optionValue);
    } else if (!atMax) {
      next = [...next, optionValue];
    }
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const isDisabledOption = disabled || (atMax && !isSelected && !option.exclusive);
        return (
          <label
            key={option.value}
            onClick={() => !isDisabledOption && toggleOption(option.value)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              minHeight: 60,
              padding: '16px 18px',
              borderRadius: 12,
              border: isSelected
                ? `2px solid ${TERRACOTTA}`
                : `1.5px solid ${SAND_DEEP}`,
              background: isSelected ? TERRACOTTA_TINT : CREAM_WARM,
              cursor: isDisabledOption ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: isDisabledOption ? 0.5 : 1,
              userSelect: 'none',
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                flexShrink: 0,
                marginTop: 2,
                borderRadius: 4,
                border: `2px solid ${isSelected ? TERRACOTTA : SAND_DEEP}`,
                background: isSelected ? TERRACOTTA : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              aria-hidden
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 'clamp(15px, 1.4vw, 17px)',
                  fontWeight: 500,
                  color: INK,
                  lineHeight: 1.4,
                  display: 'block',
                }}
              >
                {option.label}
              </span>
              {option.description && (
                <p
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: INK_FADED,
                    lineHeight: 1.4,
                  }}
                >
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
