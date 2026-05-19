'use client';

import { COPY } from '@/lib/constants';
import { MotionSection } from './motion/MotionSection';

export function TheProblem() {
  return (
    <section id="the-problem" className="bg-cream-warm w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <MotionSection className="md:col-span-5">
            <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
              {COPY.theProblem.label}
            </p>
            <div className="h-px w-[60px] bg-terracotta mt-8" />
          </MotionSection>

          <MotionSection delay={0.12} className="md:col-span-7">
            <h2
              className="font-display font-normal text-ink"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 1.1,
              }}
            >
              <em className="italic font-normal">
                {COPY.theProblem.heading}
              </em>
            </h2>
            <div className="mt-8 max-w-copy space-y-6">
              {COPY.theProblem.body.map((p, i) => (
                <p
                  key={i}
                  className="font-body text-[1.125rem] leading-relaxed text-ink"
                >
                  {p}
                </p>
              ))}
            </div>
          </MotionSection>
        </div>
      </div>
    </section>
  );
}
