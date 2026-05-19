'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

const HEIGHT_CM_MIN = 120;
const HEIGHT_CM_MAX = 220;
const WEIGHT_KG_MIN = 30;
const WEIGHT_KG_MAX = 200;

function feetInchesToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54);
}

function cmToFeetInches(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - ft * 12);
  if (inches === 12) return { ft: ft + 1, inches: 0 };
  return { ft, inches };
}

function kgToLbs(kg: number): number {
  return Math.round(kg / 0.453592);
}

function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

function range(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

export default function WizardUnitToggleInput({
  mode,
  value,
  onChange,
  disabled,
}: WizardUnitToggleInputProps) {
  const units = mode === 'height' ? HEIGHT_UNITS : WEIGHT_UNITS;
  const [unit, setUnit] = useState<HeightUnit | WeightUnit>(units[0]);

  // Display state per unit.
  const [cmStr, setCmStr] = useState<string>('');
  const [ftStr, setFtStr] = useState<string>('');
  const [inchesStr, setInchesStr] = useState<string>('');
  const [kgStr, setKgStr] = useState<string>('');
  const [lbsStr, setLbsStr] = useState<string>('');
  const hydrated = useRef(false);

  // Hydrate display state from canonical value when it changes from outside (e.g. resume).
  useEffect(() => {
    if (hydrated.current) return;
    if (value === null || value === undefined) {
      hydrated.current = true;
      return;
    }
    hydrated.current = true;
    if (mode === 'height') {
      setCmStr(String(value));
      const f = cmToFeetInches(value);
      setFtStr(String(f.ft));
      setInchesStr(String(f.inches));
    } else {
      setKgStr(String(value));
      setLbsStr(String(kgToLbs(value)));
    }
  }, [value, mode]);

  const cmOptions = useMemo(() => range(HEIGHT_CM_MIN, HEIGHT_CM_MAX), []);
  const ftOptions = useMemo(() => range(3, 7), []);
  const inchOptions = useMemo(() => range(0, 11), []);
  const kgOptions = useMemo(() => range(WEIGHT_KG_MIN, WEIGHT_KG_MAX), []);
  const lbsOptions = useMemo(
    () => range(kgToLbs(WEIGHT_KG_MIN), kgToLbs(WEIGHT_KG_MAX)),
    [],
  );

  const handleCmChange = (raw: string) => {
    setCmStr(raw);
    if (!raw) {
      onChange(null);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onChange(n);
    const f = cmToFeetInches(n);
    setFtStr(String(f.ft));
    setInchesStr(String(f.inches));
  };

  const handleFtInChange = (nextFt: string, nextIn: string) => {
    setFtStr(nextFt);
    setInchesStr(nextIn);
    const ft = parseInt(nextFt, 10);
    const inches = parseInt(nextIn, 10);
    if (Number.isNaN(ft) || Number.isNaN(inches)) {
      onChange(null);
      return;
    }
    const cm = feetInchesToCm(ft, inches);
    onChange(cm);
    setCmStr(String(cm));
  };

  const handleKgChange = (raw: string) => {
    setKgStr(raw);
    if (!raw) {
      onChange(null);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    onChange(n);
    setLbsStr(String(kgToLbs(n)));
  };

  const handleLbsChange = (raw: string) => {
    setLbsStr(raw);
    if (!raw) {
      onChange(null);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const kg = lbsToKg(n);
    onChange(kg);
    setKgStr(String(Math.round(kg)));
  };

  const selectStyle = (filled: boolean): React.CSSProperties => ({
    flex: 1,
    height: 56,
    padding: '0 44px 0 18px',
    borderRadius: 12,
    border: `1.5px solid ${SAND_DEEP}`,
    background: CREAM_WARM,
    color: filled ? INK : 'rgba(45, 42, 38, 0.5)',
    fontSize: 17,
    fontFamily: 'inherit',
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    minWidth: 0,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1L6 6L11 1' stroke='%238a7d6a' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 18px center',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {mode === 'height' && unit === 'cm' && (
          <>
            <select
              value={cmStr}
              onChange={(e) => handleCmChange(e.target.value)}
              disabled={disabled}
              style={selectStyle(!!cmStr)}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            >
              <option value="" disabled>
                Select height
              </option>
              {cmOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ color: INK_FADED, fontSize: 14, minWidth: 32 }}>cm</span>
          </>
        )}
        {mode === 'height' && unit === 'ft' && (
          <>
            <select
              value={ftStr}
              onChange={(e) => handleFtInChange(e.target.value, inchesStr || '0')}
              disabled={disabled}
              style={selectStyle(!!ftStr)}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            >
              <option value="" disabled>
                ft
              </option>
              {ftOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ color: INK_FADED, fontSize: 14 }}>ft</span>
            <select
              value={inchesStr}
              onChange={(e) => handleFtInChange(ftStr || '0', e.target.value)}
              disabled={disabled}
              style={{ ...selectStyle(!!inchesStr), width: 96, flex: 'none' }}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            >
              <option value="" disabled>
                in
              </option>
              {inchOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ color: INK_FADED, fontSize: 14 }}>in</span>
          </>
        )}
        {mode === 'weight' && unit === 'kg' && (
          <>
            <select
              value={kgStr}
              onChange={(e) => handleKgChange(e.target.value)}
              disabled={disabled}
              style={selectStyle(!!kgStr)}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            >
              <option value="" disabled>
                Select weight
              </option>
              {kgOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ color: INK_FADED, fontSize: 14, minWidth: 32 }}>kg</span>
          </>
        )}
        {mode === 'weight' && unit === 'lbs' && (
          <>
            <select
              value={lbsStr}
              onChange={(e) => handleLbsChange(e.target.value)}
              disabled={disabled}
              style={selectStyle(!!lbsStr)}
              onFocus={(e) => focusOn(e)}
              onBlur={(e) => focusOff(e)}
            >
              <option value="" disabled>
                Select weight
              </option>
              {lbsOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ color: INK_FADED, fontSize: 14, minWidth: 32 }}>lbs</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {units.map((u) => {
          const active = u === unit;
          return (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u as HeightUnit | WeightUnit)}
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

function focusOn(e: React.FocusEvent<HTMLSelectElement>) {
  e.currentTarget.style.borderColor = TERRACOTTA;
  e.currentTarget.style.boxShadow = `0 0 0 3px ${TERRACOTTA}22`;
}

function focusOff(e: React.FocusEvent<HTMLSelectElement>) {
  e.currentTarget.style.borderColor = SAND_DEEP;
  e.currentTarget.style.boxShadow = 'none';
}
