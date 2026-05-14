'use client';

import { useState, useEffect, useRef } from 'react';

export type UnitMode = 'height' | 'weight';

interface WizardUnitToggleInputProps {
  mode: UnitMode;
  /** Canonical value: cm for height, kg for weight. */
  value: number | null;
  onChange: (canonical: number | null) => void;
  disabled?: boolean;
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

const HEIGHT_UNITS = ['cm', 'ft'] as const;
const WEIGHT_UNITS = ['kg', 'lbs'] as const;

type HeightUnit = (typeof HEIGHT_UNITS)[number];
type WeightUnit = (typeof WEIGHT_UNITS)[number];

function toCm(unit: HeightUnit, primary: number, inches: number): number {
  if (unit === 'cm') return primary;
  // ft + inches → cm
  return Math.round((primary * 12 + inches) * 2.54);
}

function cmToFeet(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - ft * 12);
  if (inches === 12) return { ft: ft + 1, inches: 0 };
  return { ft, inches };
}

function toKg(unit: WeightUnit, primary: number): number {
  if (unit === 'kg') return Math.round(primary * 10) / 10;
  return Math.round(primary * 0.453592 * 10) / 10;
}

function kgToLbs(kg: number): number {
  return Math.round(kg / 0.453592);
}

export default function WizardUnitToggleInput({
  mode,
  value,
  onChange,
  disabled,
}: WizardUnitToggleInputProps) {
  const units = mode === 'height' ? HEIGHT_UNITS : WEIGHT_UNITS;
  const [unit, setUnit] = useState<HeightUnit | WeightUnit>(units[0]);

  // Local display state — keeps the user's typed-in value before we convert.
  const [primary, setPrimary] = useState<string>('');
  const [inches, setInches] = useState<string>('0');
  const hydrated = useRef(false);

  // Hydrate display from canonical value when it changes from outside.
  useEffect(() => {
    if (value === null || value === undefined) {
      if (!hydrated.current) {
        hydrated.current = true;
      }
      return;
    }
    if (hydrated.current) return;
    hydrated.current = true;
    if (mode === 'height') {
      if (unit === 'cm') setPrimary(String(value));
      else {
        const f = cmToFeet(value);
        setPrimary(String(f.ft));
        setInches(String(f.inches));
      }
    } else {
      if (unit === 'kg') setPrimary(String(value));
      else setPrimary(String(kgToLbs(value)));
    }
  }, [value, mode, unit]);

  const handlePrimaryChange = (raw: string) => {
    setPrimary(raw);
    if (raw === '') {
      onChange(null);
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (mode === 'height') {
      const inchesNum = parseFloat(inches) || 0;
      onChange(toCm(unit as HeightUnit, num, inchesNum));
    } else {
      onChange(toKg(unit as WeightUnit, num));
    }
  };

  const handleInchesChange = (raw: string) => {
    setInches(raw);
    if (mode !== 'height' || unit !== 'ft') return;
    const primNum = parseFloat(primary) || 0;
    const inchesNum = raw === '' ? 0 : parseFloat(raw);
    if (isNaN(inchesNum)) return;
    onChange(toCm('ft', primNum, inchesNum));
  };

  const switchUnit = (next: HeightUnit | WeightUnit) => {
    if (next === unit) return;
    // Convert canonical → new display unit
    if (value !== null && value !== undefined) {
      if (mode === 'height') {
        if (next === 'cm') {
          setPrimary(String(value));
          setInches('0');
        } else {
          const f = cmToFeet(value);
          setPrimary(String(f.ft));
          setInches(String(f.inches));
        }
      } else {
        if (next === 'kg') setPrimary(String(value));
        else setPrimary(String(kgToLbs(value)));
      }
    }
    setUnit(next);
  };

  const primaryPlaceholder = (() => {
    if (mode === 'height') return unit === 'cm' ? 'e.g., 170' : 'ft';
    return unit === 'kg' ? 'e.g., 65' : 'e.g., 145';
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="number"
          inputMode="decimal"
          value={primary}
          onChange={(e) => handlePrimaryChange(e.target.value)}
          placeholder={primaryPlaceholder}
          disabled={disabled}
          style={inputStyle(disabled)}
          onFocus={(e) => focusOn(e)}
          onBlur={(e) => focusOff(e)}
        />
        {mode === 'height' && unit === 'ft' && (
          <>
            <span style={{ color: INK_FADED, fontSize: 14 }}>ft</span>
            <input
              type="number"
              inputMode="decimal"
              value={inches}
              onChange={(e) => handleInchesChange(e.target.value)}
              placeholder="in"
              disabled={disabled}
              style={{ ...inputStyle(disabled), width: 80, flex: 'none' }}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            />
            <span style={{ color: INK_FADED, fontSize: 14 }}>in</span>
          </>
        )}
        {!(mode === 'height' && unit === 'ft') && (
          <span style={{ color: INK_FADED, fontSize: 14, minWidth: 32 }}>{unit}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {units.map((u) => {
          const active = u === unit;
          return (
            <button
              key={u}
              type="button"
              onClick={() => switchUnit(u as HeightUnit | WeightUnit)}
              disabled={disabled}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                border: active ? `2px solid ${TERRACOTTA}` : `1.5px solid ${SAND_DEEP}`,
                background: active ? 'rgba(200, 75, 49, 0.08)' : CREAM_WARM,
                color: active ? TERRACOTTA : INK_FADED,
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {u === 'ft' ? 'feet + in' : u}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function inputStyle(disabled: boolean | undefined): React.CSSProperties {
  return {
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
    minWidth: 0,
  };
}

function focusOn(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = TERRACOTTA;
  e.currentTarget.style.boxShadow = `0 0 0 3px ${TERRACOTTA}22`;
}

function focusOff(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = SAND_DEEP;
  e.currentTarget.style.boxShadow = 'none';
}
