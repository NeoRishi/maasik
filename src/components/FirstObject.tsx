'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function FirstObject() {
  const reduced = useReducedMotion();

  return (
    <section
      id="first-object"
      aria-label="A note from NeoRishi"
      className="w-full bg-cream"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28 md:py-36 text-center">
        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-ink"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            lineHeight: 1.5,
          }}
        >
          This is the first object NeoRishi makes.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
            delay: reduced ? 0 : 0.1,
          }}
          className="mt-3 font-display text-ink-faded"
          style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)',
            lineHeight: 1.55,
          }}
        >
          More is being built. Subscribers see it first.
        </motion.p>
      </div>
    </section>
  );
}
