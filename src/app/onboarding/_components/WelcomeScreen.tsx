'use client';

import { relativeDaysAgo } from '../_lib/progress-storage';

interface WelcomeScreenProps {
  onStart: () => void;
  resumeAvailable?: { savedAt: number } | null;
  onResume?: () => void;
  onStartOver?: () => void;
}

export default function WelcomeScreen({
  onStart,
  resumeAvailable,
  onResume,
  onStartOver,
}: WelcomeScreenProps) {
  return (
    <div className="mx-auto max-w-prose540 px-6 pt-24 md:pt-40 pb-20">
      {resumeAvailable && (
        <div
          style={{
            marginBottom: 28,
            padding: '12px 16px',
            border: '1px solid #d9c9a7',
            borderRadius: 10,
            background: 'rgba(253, 248, 238, 0.7)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: '#4a3f31' }}>
            You started this {relativeDaysAgo(resumeAvailable.savedAt)}. Resume where you left off?
          </span>
          <span style={{ display: 'flex', gap: 14, fontSize: 14 }}>
            <button
              type="button"
              onClick={onResume}
              style={{
                background: 'none',
                border: 'none',
                color: '#C84B31',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onStartOver}
              style={{
                background: 'none',
                border: 'none',
                color: '#8a7d6a',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              Start over
            </button>
          </span>
        </div>
      )}

      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8a7d6a',
          marginBottom: 24,
        }}
      >
        Before we begin
      </p>

      <h1
        className="font-display"
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          lineHeight: 1.15,
          color: '#2D2A26',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          marginBottom: 24,
        }}
      >
        A few questions about your rhythm.
      </h1>

      <p
        style={{
          fontSize: 17,
          lineHeight: 1.6,
          color: '#4a3f31',
          marginBottom: 40,
          maxWidth: 520,
        }}
      >
        This takes about 6 minutes. Your answers shape your first MAASIK blueprint, your monthly nutrition document. Take it at your own pace. Your progress saves automatically.
      </p>

      <button
        type="button"
        onClick={onStart}
        style={{
          background: '#C84B31',
          color: '#FAF3E7',
          padding: '16px 32px',
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.02em',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 12px 30px -12px rgba(122, 40, 24, 0.45)',
        }}
      >
        Begin
      </button>
    </div>
  );
}
