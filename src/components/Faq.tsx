'use client';

import { useEffect, useRef } from 'react';
import { COPY } from '@/lib/constants';
import { track } from './PostHogProvider';

export function Faq() {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const fired = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number(
            (entry.target as HTMLElement).dataset.faqIndex ?? -1,
          );
          if (entry.isIntersecting && idx >= 0 && !fired.has(idx)) {
            fired.add(idx);
            track('faq_question_view', {
              index: idx,
              question: COPY.faq.items[idx]?.q,
            });
          }
        }
      },
      { threshold: 0.4 },
    );
    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" className="bg-cream w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="max-w-[720px] mx-auto">
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            {COPY.faq.label}
          </p>
          <h2
            className="font-display font-normal text-ink mt-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">{COPY.faq.heading}</em>
          </h2>

          <div className="mt-12 divide-y divide-sand">
            {COPY.faq.items.map((item, i) => (
              <div
                key={item.q}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-faq-index={i}
                className="py-8"
              >
                <h3 className="font-display font-medium text-[18px] text-ink">
                  {item.q}
                </h3>
                <p className="font-body text-[15px] leading-relaxed text-ink-soft mt-3">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
