'use client';

import { COPY, finalHeadingDynamic } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { MotionSection } from './motion/MotionSection';

type Props = { daysToNext: number };

export function Footer({ daysToNext }: Props) {
  return (
    <footer className="bg-cream-deep border-t border-sand w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
        {/* Part 1: Final CTA banner */}
        <MotionSection className="py-20 md:py-24 text-center">
          <h2
            className="font-display font-normal text-ink max-w-[600px] mx-auto"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">
              {finalHeadingDynamic(daysToNext)}
            </em>
          </h2>
          <p
            className="font-display italic text-ink-soft mt-3"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
          >
            {COPY.footer.finalSub}
          </p>
          <div className="mt-8 flex justify-center">
            <CtaButton
              location="footer"
              className="inline-flex items-center justify-center bg-terracotta hover:bg-terracotta-deep text-cream font-display font-medium text-[18px] rounded-[4px] px-12 py-5 transition-all hover:shadow-cta"
            >
              {COPY.footer.finalCta}
            </CtaButton>
          </div>
        </MotionSection>

        {/* Part 2: Legal row */}
        <div className="border-t border-b border-sand py-6 flex flex-col md:flex-row items-center md:justify-between gap-4 text-center">
          <p className="font-mono text-[11px] text-ink-faded tracking-widest2 uppercase">
            {COPY.footer.legalLeft}
          </p>
          <ul className="flex items-center gap-6 font-body text-[13px] text-ink">
            {COPY.footer.legalCenter.map((label) => {
              const href = label.startsWith('Contact')
                ? `mailto:${label.split(': ')[1] ?? 'hello@neorishi.io'}`
                : `#${label.toLowerCase()}`;
              return (
                <li key={label}>
                  <a
                    href={href}
                    className="hover:text-terracotta transition-colors"
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="font-mono text-[11px] text-ink-faded tracking-widest2 uppercase">
            {COPY.footer.legalRight}
          </p>
        </div>

        {/* Part 3: Final visual signature */}
        <div className="pt-6 pb-10 text-center">
          <p className="font-sanskrit italic text-[16px] text-ink-faded">
            {COPY.footer.closingSanskrit}
          </p>
          <p className="mt-2 font-mono text-[10px] text-ink-faded tracking-widest2 uppercase">
            {COPY.footer.closingTranslation}
          </p>
        </div>
      </div>
    </footer>
  );
}
