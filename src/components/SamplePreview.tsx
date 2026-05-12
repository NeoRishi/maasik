import { COPY } from '@/lib/constants';

export function SamplePreview() {
  return (
    <section id="sample" className="bg-cream-deep w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-24 md:py-32 lg:py-40">
        <div className="text-center">
          <p className="font-mono text-[11px] text-terracotta tracking-widest3 uppercase">
            {COPY.samplePreview.label}
          </p>
          <h2
            className="font-display font-normal text-ink mt-6"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
            }}
          >
            <em className="italic font-normal">
              {COPY.samplePreview.heading}
            </em>
          </h2>
          <p
            className="font-display italic text-ink-soft mt-3 max-w-copy mx-auto"
            style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}
          >
            {COPY.samplePreview.subheading}
          </p>
        </div>

        <div className="mt-16">
          {/* Mobile: horizontal scroller with hint. Desktop: full-width image. */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-x-auto no-scrollbar -mx-6 px-6 snap-x snap-mandatory">
                <img
                  src="/sample-report-preview.png"
                  alt="A blurred composite of the four pages of a sample MAASIK monthly report"
                  className="block min-w-[1200px] h-auto rounded-[4px] shadow-report snap-start"
                />
              </div>
              <p className="mt-3 font-mono text-[10px] text-ink-faded tracking-widest2 uppercase text-center">
                {COPY.samplePreview.scrollHint}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/sample-report-preview.png"
              alt="A blurred composite of the four pages of a sample MAASIK monthly report"
              className="block w-full h-auto rounded-[4px] shadow-report"
            />
          </div>
        </div>

        {/* Annotation row */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {COPY.samplePreview.pageAnnotations.map((page) => (
            <div key={page.label}>
              <p className="font-mono text-[11px] text-terracotta tracking-widest2 uppercase">
                {page.label}
              </p>
              <p className="font-body text-[13px] text-ink mt-2 leading-snug">
                {page.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
