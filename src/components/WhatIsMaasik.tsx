'use client';

import { COPY } from '@/lib/constants';
import { MotionSection } from './motion/MotionSection';

export function WhatIsMaasik() {
  return (
    <section id="what-is-maasik" className="bg-cream-warm w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <MotionSection className="md:col-span-5">
            <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
              {COPY.whatIsMaasik.label}
            </p>
            <p className="font-sanskrit italic text-ink mt-10 text-[22px] leading-snug">
              {COPY.whatIsMaasik.sanskritVerse}
            </p>
            <p
              className="font-display italic text-ink-faded mt-3 text-[13px]"
              style={{ letterSpacing: '0.05em' }}
            >
              {COPY.whatIsMaasik.sanskritTranslation}
            </p>
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
                {COPY.whatIsMaasik.heading}
              </em>
            </h2>
            <div className="mt-6 max-w-copy space-y-6">
              {COPY.whatIsMaasik.body.map((p, i) => (
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
