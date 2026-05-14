'use client';

import { COPY } from '@/lib/constants';
import { SampleReportMockup } from '@/components/SampleReportMockup';
import { MotionSection } from '@/components/motion/MotionSection';

export function SamplePreview() {
  return (
    <section id="sample" className="bg-cream-deep paper-grain w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <MotionSection className="text-center">
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            {COPY.samplePreview.label}
          </p>
          <h2
            className="font-display font-normal text-ink mt-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">
              {COPY.samplePreview.heading}
            </em>
          </h2>
          <p
            className="font-display italic text-ink-soft mt-3 max-w-copy mx-auto"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
          >
            {COPY.samplePreview.subheading}
          </p>
        </MotionSection>

        <MotionSection delay={0.15} className="mt-16">
          {/* Mobile: horizontal scroller. Desktop: centered composite. */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-x-auto no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
                <SampleReportMockup className="snap-start" />
              </div>
              <p className="mt-4 font-mono text-[10px] text-ink-faded tracking-widest2 uppercase text-center">
                {COPY.samplePreview.scrollHint}
              </p>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <SampleReportMockup />
          </div>
        </MotionSection>

        {/* Annotation row */}
        <MotionSection
          delay={0.1}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 max-w-5xl mx-auto"
        >
          {COPY.samplePreview.pageAnnotations.map((page) => (
            <div key={page.label}>
              <p className="font-mono text-[11px] text-terracotta tracking-widest2 uppercase">
                {page.label}
              </p>
              <p className="font-body text-[13px] text-ink mt-2 leading-snug">
                {page.caption}
              </p>
            </div>
          ))}
        </MotionSection>
      </div>
    </section>
  );
}
