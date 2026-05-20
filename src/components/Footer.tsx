'use client';

import { COPY } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-cream-deep border-t border-sand w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="border-t border-sand py-6 flex flex-col md:flex-row items-center md:justify-between gap-4 text-center">
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

        <div className="border-b border-sand py-4 text-center">
          <p className="font-body text-[11px] leading-snug text-ink-faded max-w-3xl mx-auto">
            {COPY.footer.disclaimer}
          </p>
        </div>

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
