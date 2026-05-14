'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { track } from './PostHogProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Pricing() {
  const reduced = useReducedMotion();

  return (
    <section id="pricing" className="w-full bg-terracotta-darker text-cream">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="font-mono text-[11px] tracking-widest3 uppercase text-cream/60">
            {COPY.pricing.label}
          </p>
          <h2
            className="font-display font-normal text-cream mt-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">{COPY.pricing.heading}</em>
          </h2>
          <p
            className="font-display italic mt-3 max-w-copy mx-auto text-cream/85"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
          >
            {COPY.pricing.subheading}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {COPY.pricing.tiers.map((tier, idx) => {
            const ctaLocation =
              tier.id === 'annual' ? 'pricing_annual' : 'pricing_monthly';
            const isPopular = Boolean(tier.badge);
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: reduced ? 0 : idx * 0.08,
                }}
                whileHover={
                  reduced
                    ? undefined
                    : { y: -4, transition: { duration: 0.2 } }
                }
                onMouseEnter={() =>
                  track('pricing_card_hover', { tier: tier.id })
                }
                className="relative"
              >
                <Card
                  className={`relative bg-cream-warm text-ink rounded-[6px] border ${isPopular ? 'border-terracotta/40 shadow-cta' : 'border-sand-deep/60 shadow-sm'} p-0 h-full flex flex-col overflow-visible`}
                >
                  {isPopular && (
                    <motion.div
                      animate={
                        reduced
                          ? undefined
                          : { scale: [1, 1.04, 1], opacity: [1, 0.92, 1] }
                      }
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute -top-3 right-5 z-10"
                    >
                      <Badge className="bg-terracotta hover:bg-terracotta text-cream font-mono text-[10px] tracking-widest2 uppercase rounded-[2px] border-0 shadow-sm">
                        {tier.badge}
                      </Badge>
                    </motion.div>
                  )}

                  <CardContent className="p-8 md:p-10 flex flex-col flex-1">
                    <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
                      {tier.label}
                    </p>
                    <div className="mt-6 flex items-baseline gap-3">
                      <span
                        className="font-display font-normal text-ink"
                        style={{ fontSize: '56px', lineHeight: 1 }}
                      >
                        {tier.price}
                      </span>
                      <span className="font-body text-[15px] text-ink-faded">
                        {tier.slash}
                      </span>
                    </div>

                    <hr className="border-0 border-t border-sand my-8" />

                    <ul className="space-y-3 font-body text-[14px] text-ink">
                      {tier.bullets.map((b) => (
                        <li key={b} className="flex gap-2.5 items-start">
                          <Check
                            className="h-4 w-4 text-terracotta shrink-0 mt-0.5"
                            aria-hidden
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <CtaButton
                        location={ctaLocation}
                        className="block w-full text-center bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[15px] rounded-[4px] px-6 py-4 transition-all hover:shadow-cta"
                      >
                        {tier.cta}
                      </CtaButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center font-body text-[13px] text-cream/70 max-w-[640px] mx-auto">
          {COPY.pricing.caveat}
        </p>
      </div>
    </section>
  );
}
