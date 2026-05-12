import { COPY } from '@/lib/constants';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cream w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="text-center">
          <h2
            className="font-display font-normal text-ink"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">{COPY.howItWorks.heading}</em>
          </h2>
          <p
            className="font-display italic text-ink-soft mt-2 max-w-[480px] mx-auto"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
          >
            {COPY.howItWorks.subheading}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {COPY.howItWorks.steps.map((step) => (
            <div key={step.number}>
              <div
                className="font-display font-light text-terracotta leading-none"
                style={{ fontSize: '96px' }}
              >
                {step.number}
              </div>
              <h3 className="font-display font-medium text-ink text-[24px] mt-4">
                {step.title}
              </h3>
              <p className="font-body text-[15px] leading-relaxed text-ink-soft mt-3 max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
