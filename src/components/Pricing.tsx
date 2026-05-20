'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { Card, CardContent } from '@/components/ui/card';
import { NumberTicker } from './magic-ui/number-ticker';
import { Marquee } from './magic-ui/marquee';

const VEDIC_MONTHS = [
  'Chaitra',
  'Vaishakha',
  'Jyeshtha',
  'Ashadha',
  'Shravana',
  'Bhadrapada',
  'Ashwina',
  'Kartika',
  'Margashirsha',
  'Pausha',
  'Magha',
  'Phalguna',
];

const CURRENT_MONTH = 'Jyeshtha';

export function Pricing() {
  const reduced = useReducedMotion();
  const tier = COPY.pricing.tier;

  return (
    <section id="pricing" className="w-full bg-terracotta-darker text-cream relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(201,154,77,0.18),transparent_70%)]"
      />

      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40 relative">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="font-mono text-[11px] tracking-widest3 uppercase text-saffron">
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

        <div className="mt-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={
              reduced ? undefined : { y: -4, transition: { duration: 0.2 } }
            }
            className="relative w-full max-w-[460px]"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-px rounded-[7px] bg-gradient-to-br from-saffron/40 via-transparent to-saffron/20 opacity-60 blur-[1px]"
            />
            <Card className="relative bg-cream-warm text-ink rounded-[6px] border border-saffron/40 shadow-cta p-0 overflow-visible">
              <CardContent className="p-8 md:p-10 flex flex-col">
                <p className="font-mono text-[11px] text-saffron-deep tracking-widest3 uppercase">
                  {tier.label}
                </p>

                <div className="mt-6 flex items-baseline gap-3 flex-wrap">
                  <span
                    className="font-display font-normal text-ink leading-none"
                    style={{ fontSize: '64px', lineHeight: 1 }}
                  >
                    ₹
                    <NumberTicker value={99} className="inline-block" />
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
                        className="h-4 w-4 text-saffron-deep shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <CtaButton
                    location="pricing"
                    className="group block w-full text-center bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[15px] rounded-[4px] px-6 py-4 transition-all hover:shadow-cta"
                  >
                    <span className="inline-flex items-center gap-2">
                      {tier.cta}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </CtaButton>
                </div>

                <p className="mt-4 text-center font-body text-[12px] text-ink-faded">
                  {COPY.pricing.caveat}
                </p>

                <div className="mt-5 flex items-center justify-center gap-3 font-mono text-[10px] tracking-widest2 uppercase text-ink-faded">
                  <span>UPI</span>
                  <span aria-hidden="true" className="h-2 w-px bg-sand-deep" />
                  <span>Cards</span>
                  <span aria-hidden="true" className="h-2 w-px bg-sand-deep" />
                  <span>Net Banking</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-20">
          <p className="text-center font-mono text-[10px] tracking-widest3 uppercase text-cream/45 mb-4">
            The Vedic year, edition by edition
          </p>
          <Marquee pauseOnHover className="[--duration:55s] [--gap:3rem]">
            {VEDIC_MONTHS.map((m) => (
              <span
                key={m}
                className={`font-display italic text-[22px] md:text-[26px] whitespace-nowrap ${
                  m === CURRENT_MONTH
                    ? 'text-saffron'
                    : 'text-cream/35 hover:text-cream/70 transition-colors'
                }`}
              >
                {m}
                {m === CURRENT_MONTH ? (
                  <span className="ml-2 align-middle inline-block h-1.5 w-1.5 rounded-full bg-saffron animate-soft-pulse" />
                ) : null}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
