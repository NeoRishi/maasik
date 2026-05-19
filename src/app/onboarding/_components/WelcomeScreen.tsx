'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="mx-auto max-w-prose540 px-6 py-12 md:py-16">
      <div className="text-center mb-10">
        <p
          className="font-display text-[10px] uppercase tracking-widest3 text-ink-faded mb-3"
          style={{ letterSpacing: '0.35em' }}
        >
          MAASIK
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
          Map your Rhythm Profile
        </h1>
        <div
          className="mt-6 mx-auto"
          style={{ width: 60, height: 1, background: '#d9c9a7' }}
        />
      </div>

      <section className="mb-8">
        <h2 className="font-display text-xl text-ink mb-3">What you’ll get</h2>
        <ul className="diamond-list space-y-2 text-[15px] leading-relaxed text-ink-soft">
          <li>A personalized 4-page PDF every Vedic month</li>
          <li>Built on traditional Indian nutrition systems, calibrated to your Rhythm Profile</li>
          <li>Delivered on the first day of each Vedic month (Shukla Pratipada)</li>
        </ul>
      </section>

      <section
        className="mb-8 px-5 py-4 rounded-xl"
        style={{ background: '#fdf8ee', border: '1px solid #e8dcc1' }}
      >
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-ink-faded font-semibold">
              Time to complete
            </p>
            <p className="text-lg font-display text-ink">3 minutes</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-ink-faded font-semibold">
              Total questions
            </p>
            <p className="text-lg font-display text-ink">25</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl text-ink mb-3">How to answer</h2>
        <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
          <p>
            Most questions are single-select. Pick the option that fits you most of the time, not
            your best day or your worst day. Be honest; this isn’t a test.
          </p>
          <p>
            For multi-select questions (medical conditions, allergies), check all that apply, or
            select “None”.
          </p>
          <p>
            For free-text questions, a sentence or two is enough. Don’t overthink.
          </p>
          <p>
            If two options feel equally true, pick the one that’s been true for the longest stretch
            of your life.
          </p>
          <p>
            There is no right answer. We use these inputs to map your Rhythm Profile and your
            current life context. The output blueprint will be calibrated to you, not a generic
            template.
          </p>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="font-body font-semibold text-cream"
          style={{
            background: '#C84B31',
            padding: '14px 28px',
            borderRadius: 999,
            fontSize: 15,
            boxShadow: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Get started →
        </button>
      </div>
    </div>
  );
}
