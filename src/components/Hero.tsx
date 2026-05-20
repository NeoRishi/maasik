'use client';

import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { MotionStagger, MotionStaggerItem } from './motion/MotionSection';
import { MoonVisual } from './MoonVisual';
import { AnimatedShinyText } from './magic-ui/shiny-text';

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-bg paper-grain relative w-full min-h-[92vh] flex items-center overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_20%,rgba(201,154,77,0.16),transparent_65%)]"
      />

      <MoonVisual className="pointer-events-none absolute right-[-8%] top-[10%] hidden lg:block w-[520px] xl:w-[640px] opacity-90" />

      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute right-[6%] top-[42%] rotate-[6deg] w-[260px] xl:w-[300px] bg-cream-warm/95 border border-saffron/40 shadow-[0_24px_60px_-30px_rgba(122,40,24,0.4)] backdrop-blur-sm px-6 py-7 z-[5]"
      >
        <p className="font-mono text-[9px] tracking-widest3 uppercase text-terracotta">
          GREESHMA · PEAK SUMMER
        </p>
        <p className="mt-3 font-display italic font-light text-ink text-[24px] xl:text-[28px] leading-tight">
          The Anchored Builder
        </p>
        <div className="mt-4 h-px w-full bg-saffron/35" />
        <p className="mt-4 font-display italic text-[12px] text-khus-deep leading-snug">
          Warm in build. Focused in mind.
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 md:px-8 lg:px-12 py-24 md:py-28 relative z-10">
        <MotionStagger staggerChildren={0.07}>
          <MotionStaggerItem className="mb-8 inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="block h-1.5 w-1.5 rounded-full bg-saffron animate-soft-pulse"
            />
            <AnimatedShinyText
              shimmerWidth={140}
              className="font-mono text-[11px] tracking-widest3 uppercase text-terracotta"
            >
              {COPY.hero.editionLabel}
            </AnimatedShinyText>
          </MotionStaggerItem>

          <MotionStaggerItem
            as="h1"
            className="font-display font-light text-ink leading-[1.02]"
          >
            <span
              className="block"
              style={{ fontSize: 'clamp(2.5rem, 7.2vw, 5.5rem)' }}
            >
              <span className="block">{COPY.hero.headlineLineOne}</span>
              <span className="block">
                {COPY.hero.headlineLineTwoBefore}
                <em className="italic font-light text-terracotta-deep">
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

          <MotionStaggerItem className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <CtaButton
              location="hero"
              className="group inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[16px] rounded-[4px] px-8 py-4 transition-all hover:shadow-cta hover:-translate-y-0.5 duration-200"
            >
              <span>{COPY.hero.primaryCta}</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </CtaButton>
            <a
              href="#inside"
              className="group inline-flex items-center gap-1.5 font-body text-[14px] text-ink-faded hover:text-terracotta underline underline-offset-4 transition-colors sm:ml-2"
            >
              <span>{COPY.hero.secondaryCta}</span>
            </a>
          </MotionStaggerItem>

          <MotionStaggerItem className="mt-10 max-w-copy">
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
        </MotionStagger>

        <a
          href="#inside"
          aria-label="Scroll to what's inside"
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-6 flex-col items-center gap-2 text-ink-faded hover:text-terracotta transition-colors group"
        >
          <span className="font-mono text-[10px] tracking-widest3 uppercase">
            Scroll
          </span>
          <span
            aria-hidden="true"
            className="block h-8 w-px bg-current group-hover:h-10 transition-all"
          />
        </a>
      </div>
    </section>
  );
}
