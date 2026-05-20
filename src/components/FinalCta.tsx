'use client';

import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { MotionSection } from './motion/MotionSection';

export function FinalCta() {
  return (
    <section className="bg-cream-deep border-t border-khus/15 w-full relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_60%,rgba(201,154,77,0.22),transparent_70%)]"
      />

      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-20 md:py-28 text-center relative">
        <MotionSection>
          <p
            className="font-display italic text-ink max-w-[680px] mx-auto"
            style={{
              fontSize: 'clamp(1.5rem, 3.6vw, 2.25rem)',
              lineHeight: 1.25,
            }}
          >
            {COPY.finalCta.line}
          </p>
          <div className="mt-10 flex justify-center">
            <CtaButton
              location="footer"
              className="group relative inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[16px] rounded-[4px] px-10 py-4 transition-all hover:shadow-cta hover:-translate-y-0.5 duration-200"
            >
              <span>{COPY.finalCta.cta}</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </CtaButton>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
