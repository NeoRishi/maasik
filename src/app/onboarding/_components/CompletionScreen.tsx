'use client';

interface CompletionScreenProps {
  onContinue: () => void;
  submitting: boolean;
  errorMessage: string | null;
}

export default function CompletionScreen({
  onContinue,
  submitting,
  errorMessage,
}: CompletionScreenProps) {
  return (
    <div className="mx-auto max-w-prose540 px-6 py-12 md:py-20 text-center">
      <p
        className="font-display text-[10px] uppercase mb-3 text-ink-faded"
        style={{ letterSpacing: '0.35em' }}
      >
        MAASIK
      </p>

      <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight mb-4">
        That’s it, you’re done.
      </h1>

      <div
        className="mx-auto mb-8"
        style={{ width: 60, height: 1, background: '#d9c9a7' }}
      />

      <p className="text-[15px] leading-relaxed text-ink-soft max-w-md mx-auto mb-6">
        Next: you’ll see a quick preview of your personalized blueprint, then a one-tap secure
        payment.
      </p>

      <div
        className="mx-auto mb-10 px-6 py-5 rounded-xl text-left max-w-sm"
        style={{ background: '#fdf8ee', border: '1px solid #e8dcc1' }}
      >
        <p className="text-[11px] uppercase tracking-widest text-ink-faded font-semibold mb-2">
          Introductory price
        </p>
        <p className="font-display text-2xl text-ink mb-1">₹99</p>
        <p className="text-[13px] text-ink-faded">for your first month</p>
        <div className="my-3" style={{ height: 1, background: '#e8dcc1' }} />
        <p className="text-[12px] text-ink-faded leading-relaxed">
          ₹499/month or ₹4,999/year thereafter.
        </p>
      </div>

      {errorMessage && (
        <div
          className="mx-auto mb-6 px-4 py-3 rounded-lg text-left max-w-sm"
          style={{ background: '#fbf0ec', border: '1px solid #d9b4a5', color: '#6b2a1a' }}
        >
          <p className="text-[13px] font-semibold mb-1">We hit a snag</p>
          <p className="text-[13px] leading-snug">{errorMessage}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={submitting}
        className="font-body font-semibold text-cream"
        style={{
          background: '#C84B31',
          padding: '14px 28px',
          borderRadius: 999,
          fontSize: 15,
          boxShadow: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
          border: 'none',
          cursor: submitting ? 'wait' : 'pointer',
          letterSpacing: '0.02em',
          opacity: submitting ? 0.7 : 1,
          minWidth: 260,
        }}
      >
        {submitting ? 'Preparing your secure payment page…' : 'Continue to payment →'}
      </button>

      {submitting && (
        <p className="mt-4 text-[12px] text-ink-faded">This usually takes a few seconds.</p>
      )}
    </div>
  );
}
