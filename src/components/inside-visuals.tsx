'use client';

export function ArchetypeMini() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream to-cream-deep">
      <div className="relative rotate-[-2deg] bg-cream-warm border border-saffron/50 px-5 py-4 shadow-[0_12px_30px_-18px_rgba(122,40,24,0.35)] transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105">
        <p className="font-mono text-[8px] tracking-widest3 uppercase text-terracotta">
          GREESHMA
        </p>
        <p className="mt-1.5 font-display italic font-light text-ink text-[18px] leading-tight">
          The Anchored
          <br />
          Builder
        </p>
      </div>
    </div>
  );
}

export function BodyHeatMini() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream to-saffron-soft/40">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="transition-transform duration-500 group-hover:scale-110"
      >
        <defs>
          <radialGradient id="flameGrad" cx="0.5" cy="0.7" r="0.5">
            <stop offset="0%" stopColor="#C84B31" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#C99A4D" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C99A4D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M60 88 C42 88 32 74 32 60 C32 48 40 40 44 32 C48 38 52 42 52 48 C52 38 58 28 60 18 C68 32 76 40 80 50 C84 60 84 70 80 76 C76 84 70 88 60 88 Z"
          fill="url(#flameGrad)"
          stroke="#A6361F"
          strokeWidth="0.6"
          opacity="0.85"
        />
        <path
          d="M50 100 L70 100"
          stroke="#6B5D52"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M58 96 L62 100 L66 96"
          stroke="#6B5D52"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function TasteMapMini() {
  const tastes: Array<{ label: string; r: number; color: string }> = [
    { label: 'Sweet', r: 28, color: '#C99A4D' },
    { label: 'Bitter', r: 22, color: '#6B7F4F' },
    { label: 'Astringent', r: 18, color: '#4F5F39' },
    { label: 'Sour', r: 10, color: '#B85C3A' },
    { label: 'Salty', r: 9, color: '#7A2818' },
    { label: 'Pungent', r: 8, color: '#A6361F' },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cream">
      <svg
        width="220"
        height="120"
        viewBox="0 0 220 120"
        className="transition-transform duration-500 group-hover:scale-105"
      >
        {tastes.map((t, i) => (
          <circle
            key={t.label}
            cx={22 + i * 35}
            cy={60}
            r={t.r}
            fill={t.color}
            opacity={i < 3 ? 0.85 : 0.35}
          />
        ))}
      </svg>
    </div>
  );
}

export function DayHeatMini() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8 bg-cream">
      <div className="relative h-3 w-full rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-khus-soft via-saffron via-50% to-terracotta" />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[9px] tracking-widest2 uppercase text-ink-faded">
        <span>5 AM</span>
        <span>9 AM</span>
        <span>1 PM</span>
        <span>5 PM</span>
        <span>9 PM</span>
      </div>
      <div className="relative mt-4 h-px w-full bg-sand">
        {[12, 30, 48, 65, 80].map((pct) => (
          <span
            key={pct}
            className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-terracotta border border-cream"
            style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
          />
        ))}
      </div>
      <p className="mt-4 text-center font-display italic text-[13px] text-ink-soft transition-colors duration-300 group-hover:text-terracotta-deep">
        Lunch big. Dinner small. Walk before 8.
      </p>
    </div>
  );
}

export function AnchorsMini() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cream">
      <div className="flex flex-col gap-3 w-[60%]">
        {[100, 78, 86, 70, 92].map((w, i) => (
          <div
            key={i}
            className="h-px bg-saffron transition-all duration-500 group-hover:bg-terracotta"
            style={{ width: `${w}%`, opacity: 0.45 + i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

export function GroceryMini() {
  const items = [
    { c: '#6B7F4F', label: 'methi' },
    { c: '#C99A4D', label: 'jeera' },
    { c: '#B85C3A', label: 'tomato' },
    { c: '#4F5F39', label: 'curry' },
    { c: '#7A2818', label: 'cinnamon' },
    { c: '#C8D2B3', label: 'pudina' },
  ];
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-2 p-6 bg-cream">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex flex-col items-center justify-center gap-1.5 transition-transform duration-500 group-hover:scale-105"
        >
          <span
            className="h-8 w-8 rounded-full border border-current/30"
            style={{ backgroundColor: it.c, opacity: 0.85 }}
            aria-hidden="true"
          />
          <span className="font-mono text-[8px] uppercase tracking-widest2 text-ink-faded">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CommitmentMini() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream-warm to-saffron-soft/40 px-6">
      <p className="text-center font-display italic text-ink text-[18px] leading-snug transition-transform duration-500 group-hover:scale-[1.03]">
        Lunch big.
        <br />
        Dinner small.
        <br />
        <span className="text-terracotta-deep">Walk before 8.</span>
      </p>
    </div>
  );
}
