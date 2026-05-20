'use client';

import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  reverse?: boolean;
}

export function Marquee({
  className,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  reverse = false,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1.5rem] [gap:var(--gap)]',
        vertical ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around [gap:var(--gap)]',
            vertical
              ? 'animate-marquee-vertical flex-col'
              : 'animate-marquee flex-row',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
