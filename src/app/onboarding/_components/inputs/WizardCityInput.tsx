'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface WizardCityInputProps {
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  class?: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
  };
}

const TERRACOTTA = '#C84B31';
const CREAM_WARM = '#fdf8ee';
const SAND_DEEP = '#d9c9a7';
const INK = '#2D2A26';
const INK_FADED = '#8a7d6a';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEBOUNCE_MS = 400;
const MIN_QUERY = 2;

function shortLabel(r: NominatimResult): string {
  const a = r.address ?? {};
  // Prefer the top-level `name` (Nominatim's canonical entity name for the matched relation —
  // e.g. "Pune" for the Pune city relation, even when address.city is not populated).
  const place =
    r.name ||
    a.city ||
    a.town ||
    a.village ||
    a.municipality ||
    a.suburb ||
    a.county ||
    a.state_district;
  const raw = [place, a.state, a.country].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  );
  // Drop consecutive duplicates (e.g. "Pune, Pune, Maharashtra, India").
  const deduped: string[] = [];
  for (const p of raw) {
    if (deduped[deduped.length - 1]?.toLowerCase() !== p.toLowerCase()) deduped.push(p);
  }
  if (deduped.length >= 2) return deduped.join(', ');
  if (deduped.length === 1) return deduped[0];
  return r.display_name;
}

// Drop results that are clearly broader than a city/town (states, countries, continents)
// so the dropdown doesn't get cluttered with non-actionable suggestions.
function isCityLevel(r: NominatimResult): boolean {
  const t = (r.type ?? '').toLowerCase();
  if (t === 'state' || t === 'country' || t === 'continent' || t === 'region') return false;
  return true;
}

export default function WizardCityInput({
  value,
  onChange,
  placeholder,
  maxLength = 200,
  disabled = false,
}: WizardCityInputProps) {
  const [query, setQuery] = useState<string>(value ?? '');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  // Tracks whether the current query text matches a suggestion the user actively picked.
  const acceptedRef = useRef<string | null>(value ?? null);

  // Keep input synced if parent resets value (e.g. on resume).
  useEffect(() => {
    if (value !== null && value !== query) {
      setQuery(value);
      acceptedRef.current = value;
    }
  }, [value]);

  // Close dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runSearch = (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&accept-language=en`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      },
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((results: NominatimResult[]) => {
        const arr = Array.isArray(results) ? results : [];
        // Prefer city-level matches; if the filter removes everything (rare), fall back to the raw list.
        const filtered = arr.filter(isCityLevel);
        setSuggestions(filtered.length > 0 ? filtered : arr);
        setOpen(true);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setSuggestions([]);
        setLoading(false);
      });
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    onChange(next);
    acceptedRef.current = null;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < MIN_QUERY) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(next.trim()), DEBOUNCE_MS);
  };

  const handlePick = (r: NominatimResult) => {
    const label = shortLabel(r);
    setQuery(label);
    onChange(label);
    acceptedRef.current = label;
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TERRACOTTA;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${TERRACOTTA}22`;
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = SAND_DEEP;
          e.currentTarget.style.boxShadow = 'none';
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        style={{
          height: 56,
          padding: '0 18px',
          borderRadius: 12,
          border: `1.5px solid ${SAND_DEEP}`,
          background: CREAM_WARM,
          color: INK,
          fontSize: 17,
          fontFamily: 'inherit',
          outline: 'none',
          width: '100%',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: CREAM_WARM,
            border: `1.5px solid ${SAND_DEEP}`,
            borderRadius: 12,
            padding: 6,
            margin: 0,
            listStyle: 'none',
            maxHeight: 260,
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: '0 12px 28px -16px rgba(45, 42, 38, 0.25)',
          }}
        >
          {loading && suggestions.length === 0 && (
            <li style={{ padding: '10px 12px', color: INK_FADED, fontSize: 14 }}>Searching…</li>
          )}
          {suggestions.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(r)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 15,
                  color: INK,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200, 75, 49, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {shortLabel(r)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
