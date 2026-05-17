'use client';

import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { MotionStagger, MotionStaggerItem } from './motion/MotionSection';
import { MoonVisual } from './MoonVisual';

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-bg paper-grain relative w-full min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Moon — decorative, lazy-styled, hidden on small screens to protect LCP */}
      <MoonVisual className="pointer-events-none absolute right-[-8%] top-[10%] hidden lg:block w-[520px] xl:w-[640px] opacity-90" />

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 lg:px-12 py-24 md:py-28 relative z-10">
        <MotionStagger staggerChildren={0.07}>
          <MotionStaggerItem className="h-px w-[60px] bg-terracotta mb-10" />

          <MotionStaggerItem
            as="h1"
            className="font-display font-light text-ink leading-[1.02]"
          >
            <span
              className="block"
              style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)' }}
            >
              <span className="block">{COPY.hero.headlineLineOne}</span>
              <span className="block">
                {COPY.hero.headlineLineTwoBefore}
                <em className="italic font-light">
                  {COPY.hero.headlineLineTwoItalic}
                </em>
                {COPY.hero.headlineLineTwoAfter}
              </span>
            </span>
          </MotionStaggerItem>

          <MotionStaggerItem
            as="p"
            className="font-display italic text-ink-soft mt-8 max-w-copy"
          >
            <span
              style={{
                fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
                lineHeight: 1.45,
              }}
            >
              {COPY.hero.subheadline}
            </span>
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-10 flex flex-col items-start gap-4">
            <CtaButton
              location="hero"
              className="inline-flex items-center justify-center bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[16px] rounded-[4px] px-8 py-4 transition-all hover:shadow-cta hover:-translate-y-0.5 duration-200"
            >
              {COPY.hero.primaryCta}
            </CtaButton>
            <a
              href="#sample"
              className="font-body text-[14px] text-ink-faded hover:text-terracotta underline underline-offset-4 transition-colors"
            >
              {COPY.hero.secondaryCta}
            </a>
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-8 max-w-copy">
            <ul className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-6 gap-y-2 font-body text-[13px] text-ink-faded">
              {COPY.hero.trustStrip.map((line, i) => (
                <li key={line} className="flex items-center gap-2">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden md:inline-block h-3 w-px bg-sand"
                    />
                  )}
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-20">
            <p className="font-mono text-[10px] text-ink-faded tracking-widest2 uppercase mb-2">
              {COPY.hero.monthMetaLabel}
            </p>
            <div className="h-px w-full bg-sand" />
          </MotionStaggerItem>
        </MotionStagger>
      </div>
    </section>
  );
}
