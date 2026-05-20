'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  number: string;
  description: string;
  className?: string;
  visual?: ReactNode;
}

export function BentoCard({
  name,
  number,
  description,
  className,
  visual,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-[6px]',
        'bg-cream-warm border border-sand',
        'transition-all duration-300 hover:border-saffron/60 hover:shadow-[0_18px_40px_-22px_rgba(201,154,77,0.45)]',
        className,
      )}
    >
      {visual ? (
        <div className="relative flex-1 overflow-hidden">{visual}</div>
      ) : null}

      <div className="relative z-10 p-6 md:p-7 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] text-saffron tracking-widest2">
            {number}
          </span>
          <h3 className="font-display italic text-ink text-[20px] leading-tight">
            {name}
          </h3>
        </div>
        <p className="mt-3 font-body text-[14px] leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-saffron/0 via-saffron/0 to-saffron/0 group-hover:from-saffron/[0.04] group-hover:via-saffron/0 group-hover:to-saffron/[0.06] transition-colors duration-500" />
    </div>
  );
}
