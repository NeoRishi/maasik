'use client';

import { TALLY_URL } from '@/lib/constants';
import { track } from './PostHogProvider';

type Location =
  | 'hero'
  | 'nav'
  | 'pricing_monthly'
  | 'pricing_annual'
  | 'footer';

type Props = {
  location: Location;
  children: React.ReactNode;
  className?: string;
  href?: string;
  ariaLabel?: string;
};

export function CtaButton({
  location,
  children,
  className,
  href,
  ariaLabel,
}: Props) {
  const target = href ?? TALLY_URL;
  const handleClick = () => {
    track('cta_clicked', { location });
  };
  return (
    <a
      href={target}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={className}
      rel="noopener"
    >
      {children}
    </a>
  );
}
