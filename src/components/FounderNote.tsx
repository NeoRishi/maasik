'use client';

import { COPY } from '@/lib/constants';
import { MotionSection } from './motion/MotionSection';

export function FounderNote() {
  return (
    <section id="founder" className="bg-cream-warm w-full border-t border-sand">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-32 lg:py-40">
        <MotionSection>
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            {COPY.founderNote.label}
          </p>
          <h2
            className="font-display font-normal text-ink mt-6"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">{COPY.founderNote.heading}</em>
          </h2>
          <div className="mt-8 space-y-6">
            {COPY.founderNote.body.map((p, i) => (
              <p
                key={i}
                className="font-body text-[1.0625rem] md:text-[1.125rem] leading-relaxed text-ink"
              >
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10 border-t border-sand pt-6">
            <p className="font-display italic text-ink text-[20px]">
              {COPY.founderNote.signature}
            </p>
            <p className="font-mono text-[11px] text-ink-faded tracking-widest2 uppercase mt-1">
              {COPY.founderNote.role}
            </p>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
