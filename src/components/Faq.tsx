'use client';

import { useEffect, useRef, useState } from 'react';
import { COPY } from '@/lib/constants';
import { track } from './PostHogProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function Faq() {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [openValue, setOpenValue] = useState<string | undefined>(undefined);

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

          <Accordion
            type="single"
            collapsible
            value={openValue}
            onValueChange={(v) => {
              setOpenValue(v);
              if (v) {
                const idx = Number(v.replace('faq-', ''));
                track('faq_question_open', {
                  index: idx,
                  question: COPY.faq.items[idx]?.q,
                });
              }
            }}
            className="mt-12"
          >
            {COPY.faq.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                ref={(el: HTMLDivElement | null) => {
                  itemRefs.current[i] = el;
                }}
                data-faq-index={i}
                className="border-b border-sand last:border-b-0"
              >
                <AccordionTrigger className="font-display font-medium text-[18px] text-ink py-6 hover:no-underline group">
                  <span className="text-left pr-4 group-hover:text-terracotta-deep transition-colors">
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="font-body text-[15px] leading-relaxed text-ink-soft pb-7 pr-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
