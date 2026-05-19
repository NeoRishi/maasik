'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { COPY } from '@/lib/constants';
import { MotionSection } from './motion/MotionSection';
import { Card, CardContent } from '@/components/ui/card';

export function FourSections() {
  const reduced = useReducedMotion();
  return (
    <section id="inside-each-issue" className="bg-cream w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <MotionSection>
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            {COPY.fourSections.label}
          </p>
          <h2
            className="font-display font-normal text-ink mt-6 max-w-3xl"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">{COPY.fourSections.heading}</em>
          </h2>
        </MotionSection>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {COPY.fourSections.cards.map((card, idx) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: reduced ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: reduced ? 0 : idx * 0.08,
              }}
            >
              <Card className="h-full bg-cream-warm border border-sand rounded-[6px] shadow-none hover:shadow-cta transition-shadow duration-300">
                <CardContent className="p-8 md:p-10 flex flex-col h-full">
                  <div
                    className="font-display font-light text-terracotta leading-none"
                    style={{ fontSize: '48px' }}
                  >
                    {card.number}
                  </div>
                  <h3 className="font-display font-normal text-ink text-[22px] mt-6 leading-snug">
                    {card.title}
                  </h3>
                  <p className="font-body text-[15px] leading-relaxed text-ink-soft mt-4">
                    {card.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
