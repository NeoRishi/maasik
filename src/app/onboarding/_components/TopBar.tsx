'use client';

import { useEffect, useState } from 'react';
import { onSave } from '../_lib/progress-storage';
import { TIMINGS } from '../_lib/flow-timings';

interface TopBarProps {
  sectionIndex?: number;
  sectionName?: string;
  indexInFlow?: number;
  totalInFlow?: number;
  /** Hide the section + counter slot (used on welcome / review / payment / calibrating / confirmation). */
  minimal?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function TopBar({
  sectionIndex,
  sectionName,
  indexInFlow,
  totalInFlow,
  minimal,
}: TopBarProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    const off = onSave((success) => {
      setSaveStatus(success ? 'saved' : 'error');
      if (success) {
        const t = setTimeout(() => setSaveStatus('idle'), TIMINGS.savedIndicatorMs);
        return () => clearTimeout(t);
      }
    });
    return off;
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 2,
        left: 0,
        right: 0,
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(250, 243, 231, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8a7d6a',
        }}
      >
        MAASIK
      </span>

      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#8a7d6a',
          textAlign: 'center',
          flex: 1,
          paddingLeft: 16,
          paddingRight: 16,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          opacity: minimal || !sectionName ? 0 : 1,
          transition: 'opacity 800ms ease',
        }}
      >
        {sectionName && indexInFlow && totalInFlow && (
          <>
            Section {sectionIndex}: {sectionName.toUpperCase()} · Q{indexInFlow} of {totalInFlow}
          </>
        )}
      </span>

      <span
        aria-live="polite"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: saveStatus === 'error' ? '#6b2a1a' : '#8a7d6a',
          opacity: saveStatus === 'idle' ? 0 : 1,
          transition: 'opacity 220ms ease',
          minWidth: 56,
          textAlign: 'right',
        }}
      >
        {saveStatus === 'saving' && 'Saving...'}
        {saveStatus === 'saved' && 'Saved'}
        {saveStatus === 'error' && 'Save failed'}
      </span>
    </div>
  );
}
