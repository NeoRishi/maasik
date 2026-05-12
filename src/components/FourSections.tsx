import { COPY } from '@/lib/constants';

export function FourSections() {
  return (
    <section id="four-sections" className="bg-cream w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
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

        <div className="mt-16 space-y-16">
          {COPY.fourSections.cards.map((card) => (
            <article
              key={card.number}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 border-t border-sand pt-12"
            >
              <div className="md:col-span-1">
                <div
                  className="font-display font-light text-terracotta leading-none"
                  style={{ fontSize: '64px' }}
                >
                  {card.number}
                </div>
              </div>
              <div className="md:col-span-3 max-w-[640px]">
                <h3 className="font-display font-normal text-ink text-[24px]">
                  {card.title}
                </h3>
                <p className="font-body text-[15px] leading-relaxed text-ink-soft mt-3">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
