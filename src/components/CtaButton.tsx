'use client';

import { track } from './PostHogProvider';

type Location = 'hero' | 'nav' | 'pricing' | 'footer';

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
  const target = href ?? '/onboarding';
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
