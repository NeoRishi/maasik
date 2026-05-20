// Single source of truth for all flow transition timings.
// Tune values here, not in component code.

export const TIMINGS = {
  // Per-question transition (Q4 -> Q5).
  // Outgoing: fade out + slide up 8px, 250ms ease-out.
  // Incoming: 400ms delay, then fade in + slide up from 16px below, 500ms ease-out.
  // Total perceived buffer between questions: ~650ms.
  questionOutMs: 250,
  questionInDelayMs: 400,
  questionInMs: 500,

  // Per-section transition: same as per-question, plus an 800ms section
  // nameplate crossfade at the top.
  sectionCrossfadeMs: 800,

  // Assessment -> Review screen.
  reviewPauseMs: 1200,

  // Review -> Payment.
  paymentTransitionMs: 600,

  // Calibrating interstitial: hold for 3500ms before transitioning to confirmation.
  calibratingHoldMs: 3500,
  // Three lines fade in at these offsets within the hold.
  calibratingLineOffsetsMs: [0, 1200, 2400] as const,

  // Save indicator: how long "Saved" stays visible after a debounced write.
  savedIndicatorMs: 1200,
  // localStorage write debounce.
  saveDebounceMs: 400,
} as const;

// Framer-motion variant set, shared across the flow.
// Slides up 16px, fades in over questionInMs.
export const screenVariants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMINGS.questionInMs / 1000,
      delay: TIMINGS.questionInDelayMs / 1000,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: TIMINGS.questionOutMs / 1000,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};
