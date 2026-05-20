'use client';

import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={
        {
          '--shimmer-width': `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        'mx-auto inline-block',
        'text-ink-faded',
        'bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%]',
        'animate-shimmer',
        '[background-image:linear-gradient(90deg,transparent_0,rgba(200,75,49,0.65)_50%,transparent_100%)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
