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
            as="p"
            className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase"
          >
            {COPY.hero.eyebrow}
          </MotionStaggerItem>

          <MotionStaggerItem
            as="h1"
            className="font-display font-light text-ink mt-6 leading-[1.02]"
          >
            <span
              className="block"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
            >
              <span className="block">{COPY.hero.headlineLineOne}</span>
              <span className="block">
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
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                lineHeight: 1.4,
              }}
            >
              {COPY.hero.subheadline}
            </span>
          </MotionStaggerItem>

          <MotionStaggerItem
            as="p"
            className="font-body text-[1.125rem] leading-relaxed text-ink mt-6 max-w-copy"
          >
            {COPY.hero.body}
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-12 flex flex-col items-start gap-4">
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

          <MotionStaggerItem
            as="p"
            className="mt-8 font-body text-[13px] text-ink-faded"
          >
            {COPY.hero.trustLine}
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
