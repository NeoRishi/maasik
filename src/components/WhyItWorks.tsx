'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { COPY } from '@/lib/constants';

function CalendarGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="6" y="9" width="28" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="6" y1="15" x2="34" y2="15" stroke="currentColor" strokeWidth="1" />
      <line x1="13" y1="6" x2="13" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="27" y1="6" x2="27" y2="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="14" cy="22" r="1.5" fill="currentColor" />
      <circle cx="20" cy="22" r="1.5" fill="#C99A4D" />
      <circle cx="26" cy="22" r="1.5" fill="currentColor" />
      <circle cx="14" cy="28" r="1.5" fill="currentColor" />
      <circle cx="20" cy="28" r="1.5" fill="currentColor" />
      <circle cx="26" cy="28" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PersonGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 34 C8 26 13 22 20 22 C27 22 32 26 32 34" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="20" cy="14" r="2" fill="#C99A4D" opacity="0.7" />
    </svg>
  );
}

function ScrollGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M10 8 L28 8 L28 30 C28 32.2 26.2 34 24 34 L12 34 C9.8 34 8 32.2 8 30 L8 10 C8 8.9 8.9 8 10 8 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="13" y1="14" x2="23" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1="13" y1="19" x2="23" y2="19" stroke="currentColor" strokeWidth="1" />
      <line x1="13" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1" />
      <path d="M28 8 C30.2 8 32 9.8 32 12 C32 14.2 30.2 16 28 16" fill="none" stroke="#C99A4D" strokeWidth="1" />
    </svg>
  );
}

const GLYPHS = [CalendarGlyph, PersonGlyph, ScrollGlyph];

export function WhyItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="why" className="bg-cream w-full border-t border-khus/15 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(107,127,79,0.08),transparent_70%)]"
      />
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40 relative">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-[11px] text-saffron tracking-widest3 uppercase">
            {COPY.whyItWorks.label}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7">
          {COPY.whyItWorks.blocks.map((block, i) => {
            const Glyph = GLYPHS[i];
            return (
              <motion.article
                key={block.heading}
                initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{
                  duration: 0.6,
                  delay: reduced ? 0 : i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  reduced
                    ? undefined
                    : { y: -6, transition: { duration: 0.25 } }
                }
                className="group relative bg-cream-warm border border-sand rounded-[6px] p-8 md:p-10 transition-colors duration-300 hover:border-khus/45 hover:shadow-[0_18px_40px_-22px_rgba(79,95,57,0.4)]"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-8 bottom-8 w-px bg-khus/30 group-hover:bg-khus group-hover:w-[2px] transition-all duration-300"
                />

                <div className="text-khus-deep mb-6 transition-transform duration-300 group-hover:-rotate-3">
                  <Glyph />
                </div>

                <h3
                  className="font-display italic font-normal text-ink"
                  style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.875rem)', lineHeight: 1.2 }}
                >
                  {block.heading}
                </h3>
                <p className="mt-5 font-body text-[15px] md:text-[16px] leading-relaxed text-ink-soft">
                  {block.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
