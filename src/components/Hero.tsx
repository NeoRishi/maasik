import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';

const STAGGER = 60; // ms between elements

function delay(i: number): React.CSSProperties {
  return { animationDelay: `${i * STAGGER}ms` };
}

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-bg relative w-full min-h-[90vh] flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 lg:px-12 py-24 md:py-28">
        {/* Decorative terracotta line — visual signature */}
        <div
          aria-hidden="true"
          className="hero-anim h-px w-[60px] bg-terracotta mb-10"
          style={delay(0)}
        />

        {/* Eyebrow */}
        <p
          className="hero-anim font-mono text-[11px] text-terracotta tracking-widest3 uppercase"
          style={delay(1)}
        >
          {COPY.hero.eyebrow}
        </p>

        {/* Headline */}
        <h1
          className="hero-anim font-display font-light text-ink mt-6 leading-[1.02]"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            ...delay(2),
          }}
        >
          <span className="block">{COPY.hero.headlineLineOne}</span>
          <span className="block">
            <em className="italic font-light">
              {COPY.hero.headlineLineTwoItalic}
            </em>
            {COPY.hero.headlineLineTwoAfter}
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="hero-anim font-display italic text-ink-soft mt-8 max-w-copy"
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            lineHeight: 1.4,
            ...delay(3),
          }}
        >
          {COPY.hero.subheadline}
        </p>

        {/* Body paragraph */}
        <p
          className="hero-anim font-body text-[1.125rem] leading-relaxed text-ink mt-6 max-w-copy"
          style={delay(4)}
        >
          {COPY.hero.body}
        </p>

        {/* CTA block */}
        <div
          className="hero-anim mt-12 flex flex-col items-start gap-4"
          style={delay(5)}
        >
          <CtaButton
            location="hero"
            className="inline-flex items-center justify-center bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[16px] rounded-[4px] px-8 py-4 transition-all hover:shadow-cta"
          >
            {COPY.hero.primaryCta}
          </CtaButton>
          <a
            href="#sample"
            className="font-body text-[14px] text-ink-faded hover:text-terracotta underline underline-offset-4 transition-colors"
          >
            {COPY.hero.secondaryCta}
          </a>
        </div>

        {/* Trust micro-line */}
        <p
          className="hero-anim mt-8 font-body text-[13px] text-ink-faded"
          style={delay(6)}
        >
          {COPY.hero.trustLine}
        </p>

        {/* Hero footer meta */}
        <div className="hero-anim mt-20" style={delay(7)}>
          <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mb-2">
            {COPY.hero.monthMetaLabel}
          </p>
          <div className="h-px w-full bg-sand" />
        </div>
      </div>
    </section>
  );
}
