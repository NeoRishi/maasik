'use client';

import { COPY } from '@/lib/constants';
import { MotionSection } from './motion/MotionSection';
import { BentoGrid, BentoCard } from './magic-ui/bento-grid';
import {
  ArchetypeMini,
  BodyHeatMini,
  TasteMapMini,
  DayHeatMini,
  AnchorsMini,
  GroceryMini,
  CommitmentMini,
} from './inside-visuals';

const VISUAL_FOR: Record<string, () => JSX.Element> = {
  '01': ArchetypeMini,
  '02': BodyHeatMini,
  '03': TasteMapMini,
  '04': DayHeatMini,
  '05': AnchorsMini,
  '06': GroceryMini,
  '07': CommitmentMini,
};

const SPAN_FOR: Record<string, string> = {
  '01': 'md:col-span-4 md:row-span-1',
  '02': 'md:col-span-2 md:row-span-1',
  '03': 'md:col-span-2 md:row-span-1',
  '04': 'md:col-span-4 md:row-span-1',
  '05': 'md:col-span-2 md:row-span-1',
  '06': 'md:col-span-2 md:row-span-1',
  '07': 'md:col-span-2 md:row-span-1',
};

export function InsideEdition() {
  return (
    <section id="inside" className="bg-cream-warm w-full border-t border-khus/15">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <MotionSection>
          <div className="max-w-[720px] mx-auto text-center">
            <p className="font-mono text-[11px] text-saffron tracking-widest3 uppercase">
              {COPY.inside.label}
            </p>
            <h2
              className="font-display font-normal text-ink mt-6"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                lineHeight: 1.1,
              }}
            >
              <em className="italic font-normal">{COPY.inside.heading}</em>
            </h2>
            <p
              className="font-display italic text-ink-soft mt-4"
              style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
            >
              {COPY.inside.subheading}
            </p>
          </div>

          <BentoGrid className="mt-16 md:auto-rows-[20rem]">
            {COPY.inside.items.map((item) => {
              const Visual = VISUAL_FOR[item.n];
              return (
                <BentoCard
                  key={item.n}
                  number={item.n}
                  name={item.title}
                  description={item.body}
                  className={SPAN_FOR[item.n]}
                  visual={Visual ? <Visual /> : null}
                />
              );
            })}
          </BentoGrid>

          <p className="mt-12 text-center font-body italic text-[14px] text-ink-faded max-w-[640px] mx-auto">
            {COPY.inside.closingLine}
          </p>

          <div className="mt-24 archetype-fragment">
            <div className="text-center mb-8">
              <p className="font-mono text-[10px] text-ink-faded tracking-widest3 uppercase">
                A real archetype card from this month
              </p>
              <div className="mx-auto mt-3 h-px w-12 bg-saffron/60" />
            </div>
            <div className="archetype-card">
              <div className="archetype-ornament" aria-hidden="true">
                <svg width="120" height="14" viewBox="0 0 120 14" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="7" x2="48" y2="7" stroke="#C99A4D" strokeWidth="0.75" opacity="0.7" />
                  <circle cx="60" cy="7" r="4" fill="none" stroke="#C99A4D" strokeWidth="0.75" opacity="0.85" />
                  <circle cx="60" cy="7" r="1.5" fill="#C99A4D" />
                  <line x1="72" y1="7" x2="120" y2="7" stroke="#C99A4D" strokeWidth="0.75" opacity="0.7" />
                </svg>
              </div>

              <div className="archetype-season">Greeshma · Peak Summer</div>

              <h3 className="archetype-name">The Anchored Builder</h3>

              <p className="archetype-tagline">
                Warm in build. Focused in mind. Building things slowly, on purpose.
              </p>

              <div className="tendency-grid">
                <div className="tendency">
                  <div className="t-label">Body tends to be</div>
                  <div className="t-value">Warm &amp; Steady</div>
                </div>
                <div className="tendency">
                  <div className="t-label">Mind tends to be</div>
                  <div className="t-value">Focused &amp; Methodical</div>
                </div>
                <div className="tendency">
                  <div className="t-label">This season asks</div>
                  <div className="t-value">Cool &amp; Lighten</div>
                </div>
              </div>

              <p className="archetype-verse">
                &ldquo;I work with depth, not speed.
                <br />
                This summer asks me to cool, not push.&rdquo;
              </p>

              <div className="archetype-readout">
                <span>Pune</span>
                <span className="sep">·</span>
                <span>BMI 29.1</span>
                <span className="sep">·</span>
                <span>Sedentary Work</span>
              </div>
            </div>
          </div>
        </MotionSection>
      </div>

      <style jsx>{`
        .archetype-fragment {
          --saffron: #c99a4d;
          --terracotta-card: #b85c3a;
          --terracotta-deep-card: #8e3f26;
          --ink-card: #1a1611;
          --ink-mute: #6b5d52;
          --rule: rgba(26, 22, 17, 0.12);
          --cream-card: #f7f1e5;
          --khus-deep: #4f5f39;
          --serif-display: var(--font-fraunces), Georgia, serif;
          --serif-body: var(--font-newsreader), Georgia, serif;
          --sans-card: var(--font-inter-tight), system-ui, sans-serif;
        }

        .archetype-fragment .archetype-card {
          background: var(--cream-card);
          border: 1px solid rgba(201, 154, 77, 0.45);
          padding: 56px 28px 48px;
          margin: 0 auto;
          max-width: 720px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 600px) {
          .archetype-fragment .archetype-card {
            padding: 72px 56px 64px;
          }
        }

        .archetype-fragment .archetype-card::before,
        .archetype-fragment .archetype-card::after {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: var(--saffron);
          border-style: solid;
          border-width: 0;
          opacity: 0.7;
        }
        .archetype-fragment .archetype-card::before {
          top: 14px;
          left: 14px;
          border-top-width: 1px;
          border-left-width: 1px;
        }
        .archetype-fragment .archetype-card::after {
          bottom: 14px;
          right: 14px;
          border-bottom-width: 1px;
          border-right-width: 1px;
        }

        .archetype-fragment .archetype-ornament {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .archetype-fragment .archetype-season {
          font-family: var(--sans-card);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--terracotta-card);
          margin-bottom: 20px;
        }

        .archetype-fragment .archetype-name {
          font-family: var(--serif-display);
          font-weight: 300;
          font-style: italic;
          font-size: clamp(36px, 8vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.015em;
          color: var(--ink-card);
          margin-bottom: 14px;
          font-variation-settings: 'opsz' 96, 'SOFT' 60;
        }

        .archetype-fragment .archetype-tagline {
          font-family: var(--serif-body);
          font-size: 15px;
          font-style: italic;
          color: var(--ink-mute);
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.45;
        }

        .archetype-fragment .tendency-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin: 40px 0 32px;
          padding: 28px 0;
          border-top: 1px solid var(--rule);
          border-bottom: 1px solid var(--rule);
        }
        @media (min-width: 600px) {
          .archetype-fragment .tendency-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        .archetype-fragment .tendency .t-label {
          font-family: var(--sans-card);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-mute);
          margin-bottom: 10px;
        }
        .archetype-fragment .tendency .t-value {
          font-family: var(--serif-display);
          font-weight: 500;
          font-style: italic;
          font-size: 18px;
          color: var(--terracotta-deep-card);
          line-height: 1.25;
        }

        .archetype-fragment .archetype-verse {
          font-family: var(--serif-display);
          font-weight: 300;
          font-style: italic;
          font-size: clamp(17px, 3.5vw, 20px);
          line-height: 1.45;
          color: var(--khus-deep);
          margin: 16px auto 8px;
          max-width: 440px;
        }

        .archetype-fragment .archetype-readout {
          font-family: var(--sans-card);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-mute);
          padding-top: 28px;
          margin-top: 16px;
          border-top: 1px dashed var(--rule);
        }
        .archetype-fragment .archetype-readout span {
          padding: 0 8px;
        }
        .archetype-fragment .archetype-readout .sep {
          color: var(--saffron);
        }
      `}</style>
    </section>
  );
}
