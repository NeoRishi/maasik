'use client';

import { useEffect, useState } from 'react';
import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={[
        'sticky top-0 z-50 h-16 w-full transition-colors duration-300',
        scrolled
          ? 'bg-cream/85 backdrop-blur border-b border-sand'
          : 'bg-cream border-b border-transparent',
      ].join(' ')}
      aria-label="Primary"
    >
      <div className="max-w-6xl mx-auto h-full px-6 md:px-8 lg:px-12 flex items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-3 group"
          aria-label="MAASIK home"
        >
          <span className="font-display font-medium text-terracotta text-[18px] tracking-widest3 uppercase">
            {COPY.brand.name}
          </span>
          <span
            aria-hidden="true"
            className="hidden sm:inline-block h-4 w-px bg-sand"
          />
          <span className="hidden sm:inline-block font-body text-[12px] text-ink-faded">
            {COPY.brand.parent}
          </span>
        </a>

        <CtaButton
          location="nav"
          href="#pricing"
          className="inline-flex items-center h-9 px-4 rounded-[4px] bg-terracotta hover:bg-terracotta-deep text-cream text-[13px] font-body font-medium tracking-wide transition-colors"
          ariaLabel="Go to pricing"
        >
          <span className="hidden sm:inline">{COPY.nav.cta}</span>
          <span className="sm:hidden">{COPY.nav.ctaMobile}</span>
        </CtaButton>
      </div>
    </nav>
  );
}
