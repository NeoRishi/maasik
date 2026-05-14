import { cn } from '@/lib/utils';

type PageProps = {
  className?: string;
  children: React.ReactNode;
};

function Page({ className, children }: PageProps) {
  return (
    <div
      className={cn(
        'relative bg-cream-warm aspect-[1/1.414] w-[280px] sm:w-[300px] md:w-[260px] lg:w-[300px] shrink-0 overflow-hidden rounded-[6px] shadow-report ring-1 ring-sand-deep/40',
        className,
      )}
    >
      <div className="absolute inset-0 px-6 py-7 flex flex-col text-ink">
        {children}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[8px] text-terracotta tracking-widest3 uppercase">
      {children}
    </p>
  );
}

function HairLine() {
  return <div className="h-px bg-sand-deep/60 my-2" />;
}

function CoverPage() {
  return (
    <Page>
      <Eyebrow>The MAASIK Blueprint</Eyebrow>
      <p className="mt-1 font-mono text-[8px] text-ink-faded tracking-widest2 uppercase">
        Issue 01 · Shukla Paksha
      </p>

      <div className="mt-auto">
        <p className="font-sanskrit text-[10px] text-terracotta italic">
          ज्येष्ठ · ग्रीष्म ऋतु
        </p>
        <h3 className="font-display italic text-[28px] leading-[1.05] text-ink mt-2">
          Jyeshtha
        </h3>
        <p className="font-display text-[11px] text-ink-soft mt-1.5">
          The month of fierce sun &amp;<br />
          quiet midday surrender.
        </p>
        <HairLine />
        <p className="font-mono text-[7px] text-ink-faded tracking-widest2 uppercase">
          02 May → 16 May 2026
        </p>
        <p className="font-mono text-[7px] text-ink-faded tracking-widest2 uppercase mt-0.5">
          Vikram Samvat 2082
        </p>
      </div>

      <div className="absolute bottom-5 right-5 text-right">
        <p className="font-mono text-[7px] text-terracotta tracking-widest2 uppercase">
          For
        </p>
        <p className="font-display italic text-[11px] text-ink mt-0.5">
          Ananya R.
        </p>
        <p className="font-mono text-[7px] text-ink-faded tracking-widest2 uppercase mt-0.5">
          Pune · Pitta-Vata
        </p>
      </div>

      <svg
        className="absolute -bottom-12 -right-12 w-32 h-32 text-terracotta/8"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle cx="50" cy="50" r="40" fill="currentColor" />
        <circle cx="60" cy="42" r="36" fill="var(--maasik-cream-warm)" />
      </svg>
    </Page>
  );
}

function ProfilePage() {
  return (
    <Page>
      <Eyebrow>Section 01 · Your Month</Eyebrow>
      <h3 className="font-display text-[16px] leading-tight text-ink mt-2">
        Greeshma Ritu pacifies your <em className="italic">Pitta</em>.
      </h3>

      {/* Profile strip */}
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[
          { k: 'Prakriti', v: 'Pitta-Vata' },
          { k: 'BMI', v: '22.4' },
          { k: 'Goal', v: 'Energy' },
        ].map((b) => (
          <div
            key={b.k}
            className="border border-sand-deep/50 rounded-[3px] p-1.5"
          >
            <p className="font-mono text-[6px] text-ink-faded tracking-widest2 uppercase">
              {b.k}
            </p>
            <p className="font-display text-[9px] text-ink mt-0.5">{b.v}</p>
          </div>
        ))}
      </div>

      <p className="font-body text-[8px] leading-[1.5] text-ink-soft mt-3">
        Greeshma sharpens digestion in some and burns it out in others. For your
        Pitta-Vata constitution, the next 14 days call for cooling sweetness,
        not stimulation. Less salt. More coconut. Earlier dinners.
      </p>

      {/* Dosha bar */}
      <div className="mt-3">
        <p className="font-mono text-[7px] text-terracotta tracking-widest2 uppercase">
          Your Dosha Scores
        </p>
        <div className="mt-1.5 space-y-1">
          {[
            { d: 'Vata', w: 38, c: 'bg-ink-faded' },
            { d: 'Pitta', w: 52, c: 'bg-terracotta' },
            { d: 'Kapha', w: 22, c: 'bg-favor' },
          ].map((r) => (
            <div key={r.d} className="flex items-center gap-2">
              <span className="font-mono text-[7px] text-ink w-7">{r.d}</span>
              <div className="flex-1 h-1 bg-sand rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', r.c)}
                  style={{ width: `${r.w}%` }}
                />
              </div>
              <span className="font-mono text-[7px] text-ink-faded w-4 text-right">
                {r.w}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto bg-cream-deep/70 rounded-[3px] p-2 border-l-2 border-terracotta">
        <p className="font-display italic text-[8px] leading-snug text-ink">
          &ldquo;Madhura rasa shamayati pitta&rdquo; — sweet taste pacifies
          fire. Lean into ripe mango, coconut water, soaked almonds.
        </p>
      </div>
    </Page>
  );
}

function DietPage() {
  const rows = [
    { cat: 'Grains', favour: 'Rice · Wheat', avoid: 'Bajra · Corn' },
    { cat: 'Pulses', favour: 'Moong · Toor', avoid: 'Urad · Kulthi' },
    { cat: 'Veg', favour: 'Bottle gourd', avoid: 'Brinjal · Chilli' },
    { cat: 'Fruits', favour: 'Mango · Pear', avoid: 'Sour citrus' },
    { cat: 'Dairy', favour: 'Buttermilk', avoid: 'Hard cheese' },
    { cat: 'Spices', favour: 'Coriander', avoid: 'Mustard seed' },
  ];
  return (
    <Page>
      <Eyebrow>Section 02 · Diet Blueprint</Eyebrow>
      <h3 className="font-display text-[15px] leading-tight text-ink mt-2">
        What to favour. <em className="italic">What to skip.</em>
      </h3>

      <div className="mt-3 border border-sand-deep/50 rounded-[3px] overflow-hidden">
        <div className="grid grid-cols-[1fr_1.2fr_1.2fr] bg-sand/40">
          {['', 'Favour', 'Avoid'].map((h, i) => (
            <div
              key={i}
              className="font-mono text-[6px] text-ink tracking-widest2 uppercase px-1.5 py-1"
            >
              {h}
            </div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={r.cat}
            className={cn(
              'grid grid-cols-[1fr_1.2fr_1.2fr] text-[7px] leading-tight',
              i % 2 === 1 && 'bg-cream-deep/40',
            )}
          >
            <div className="font-display text-ink px-1.5 py-1">{r.cat}</div>
            <div className="font-body text-favor px-1.5 py-1">{r.favour}</div>
            <div className="font-body text-avoid px-1.5 py-1">{r.avoid}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="font-mono text-[7px] text-terracotta tracking-widest2 uppercase">
          Your Ideal Day
        </p>
        <ul className="mt-1 space-y-0.5">
          {[
            ['06:30', 'Warm water · soaked almonds'],
            ['08:00', 'Stewed apple + ghee'],
            ['13:00', 'Rice · moong dal · lauki'],
            ['16:30', 'Coconut water + 2 dates'],
            ['19:30', 'Roti · sabzi · buttermilk'],
          ].map(([t, v]) => (
            <li key={t} className="flex gap-2 text-[7px]">
              <span className="font-mono text-terracotta w-7">{t}</span>
              <span className="font-body text-ink-soft">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}

function GroceryPage() {
  return (
    <Page>
      <Eyebrow>Section 03 · Grocery &amp; Routine</Eyebrow>
      <h3 className="font-display text-[15px] leading-tight text-ink mt-2">
        Two weeks of clarity.
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="font-mono text-[7px] text-favor tracking-widest2 uppercase">
            Do
          </p>
          <ul className="mt-1 space-y-0.5 font-body text-[7px] text-ink-soft">
            <li>· Eat before 8 PM</li>
            <li>· Soak almonds overnight</li>
            <li>· Cool baths, not cold</li>
            <li>· Walk before sunrise</li>
            <li>· Coconut water daily</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[7px] text-avoid tracking-widest2 uppercase">
            Don&rsquo;t
          </p>
          <ul className="mt-1 space-y-0.5 font-body text-[7px] text-ink-soft">
            <li>· Skip lunch</li>
            <li>· Drink iced water</li>
            <li>· Heavy late dinners</li>
            <li>· Caffeine after 2 PM</li>
            <li>· Excessive sun 12–3</li>
          </ul>
        </div>
      </div>

      <div className="mt-3 border-t border-sand-deep/50 pt-2">
        <p className="font-mono text-[7px] text-terracotta tracking-widest2 uppercase">
          Anchor Mantra
        </p>
        <p className="font-sanskrit text-[10px] text-ink mt-1 italic">
          शीतलं मधुरं स्निग्धम्
        </p>
        <p className="font-display italic text-[8px] text-ink-soft mt-0.5 leading-snug">
          Cool. Sweet. Unctuous. The three qualities of Greeshma food.
        </p>
      </div>

      <div className="mt-auto pt-2 border-t border-sand-deep/40">
        <p className="font-mono text-[6px] text-ink-faded tracking-widest2 uppercase">
          Next issue · Aashada · 17 May 2026
        </p>
        <p className="font-display italic text-[8px] text-ink mt-0.5">
          Stay aligned, Ananya.
        </p>
      </div>
    </Page>
  );
}

export function SampleReportMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex gap-3 md:gap-4 items-stretch',
        className,
      )}
      aria-label="A composite preview of the four pages of a MAASIK monthly report"
    >
      <CoverPage />
      <ProfilePage />
      <DietPage />
      <GroceryPage />
    </div>
  );
}
