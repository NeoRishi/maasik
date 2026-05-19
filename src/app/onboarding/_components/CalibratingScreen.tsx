'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TIMINGS } from '../_lib/flow-timings';

interface CalibratingScreenProps {
  onComplete: () => void;
}

const LINES = [
  'Reading your responses.',
  'Calibrating your Rhythm Profile.',
  'Preparing your first blueprint.',
];

export default function CalibratingScreen({ onComplete }: CalibratingScreenProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, TIMINGS.calibratingHoldMs);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '1.5px solid #C84B31',
          marginBottom: 40,
        }}
        aria-hidden
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
        }}
        aria-live="polite"
      >
        {LINES.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: TIMINGS.calibratingLineOffsetsMs[i] / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              fontSize: 18,
              color: '#4a3f31',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
