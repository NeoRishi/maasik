'use client';

import { useEffect } from 'react';
import { track } from './PostHogProvider';

const THRESHOLDS = [25, 50, 75, 100] as const;

export function ScrollDepthTracker() {
  useEffect(() => {
    const fired = new Set<number>();

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          track(`scroll_depth_${t}`, { depth: t });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
