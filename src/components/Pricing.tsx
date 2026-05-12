'use client';

import { COPY } from '@/lib/constants';
import { CtaButton } from './CtaButton';
import { track } from './PostHogProvider';

export function Pricing() {
  return (
    <section id="pricing" className="w-full bg-terracotta-darker text-cream">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="text-center">
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
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {COPY.pricing.tiers.map((tier) => {
            const ctaLocation =
              tier.id === 'annual' ? 'pricing_annual' : 'pricing_monthly';
            return (
              <div
                key={tier.id}
                onMouseEnter={() =>
                  track('pricing_card_hover', { tier: tier.id })
                }
                className="relative bg-cream text-ink rounded-[4px] border border-sand shadow-sm p-8 md:p-10 flex flex-col"
              >
                {tier.badge && (
                  <span className="absolute -top-3 right-4 inline-flex items-center bg-terracotta text-cream font-mono text-[10px] tracking-widest2 uppercase px-2 py-1 rounded-[2px]">
                    {tier.badge}
                  </span>
                )}
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

                <ul className="diamond-list space-y-3 font-body text-[14px] text-ink">
                  {tier.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <CtaButton
                    location={ctaLocation}
                    className="block w-full text-center bg-terracotta hover:bg-terracotta-deep text-cream font-body font-medium text-[15px] rounded-[4px] px-6 py-4 transition-colors"
                  >
                    {tier.cta}
                  </CtaButton>
                </div>
              </div>
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
