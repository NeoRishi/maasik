'use client';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  INITIAL_FLOW_STATE,
  currentFlat,
  flowReducer,
  progressPercent,
} from '../_lib/flow-state';
import { TIMINGS, screenVariants } from '../_lib/flow-timings';
import {
  clearProgress,
  isLocalStorageAvailable,
  loadProgress,
  saveProgress,
  type StoredProgress,
} from '../_lib/progress-storage';
import { FLAT_QUESTIONS, TOTAL_QUESTIONS } from '../_lib/question-flat';
import type { OnboardingDraft } from '../_lib/validation';

// Coerce legacy saved drafts (Q1 was single-select before the multi-select migration).
function migrateLegacyAnswers(answers: OnboardingDraft): OnboardingDraft {
  const out = { ...answers } as Record<string, unknown>;
  if (typeof out.primary_goal === 'string' && out.primary_goal.length > 0) {
    out.primary_goal = [out.primary_goal];
  }
  return out as OnboardingDraft;
}
import TopBar from './TopBar';
import ProgressBar from './ProgressBar';
import WelcomeScreen from './WelcomeScreen';
import QuestionScreen from './QuestionScreen';
import ReviewScreen from './ReviewScreen';
import PaymentScreen from './PaymentScreen';
import CalibratingScreen from './CalibratingScreen';
import ConfirmationScreen from './ConfirmationScreen';

export default function AssessmentFlow() {
  const [state, dispatch] = useReducer(flowReducer, INITIAL_FLOW_STATE);
  const [resumeOffer, setResumeOffer] = useState<StoredProgress | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [showReviewIntro, setShowReviewIntro] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const available = isLocalStorageAvailable();
    setStorageOk(available);
    if (!available) {
      dispatch({ type: 'HYDRATE', payload: {} });
      return;
    }
    const saved = loadProgress();
    if (saved) {
      // Offer to resume, but stay on welcome until the user picks.
      setResumeOffer(saved);
      dispatch({ type: 'HYDRATE', payload: { phase: 'welcome' } });
    } else {
      dispatch({ type: 'HYDRATE', payload: {} });
    }
  }, []);

  // Persist on every state change once hydrated. Skip on welcome to avoid writing an empty draft.
  useEffect(() => {
    if (!state.hydrated) return;
    if (state.phase === 'welcome') return;
    if (state.phase === 'calibrating' || state.phase === 'confirmation') return;
    saveProgress(state.phase, state.questionIndex, state.answers, TIMINGS.saveDebounceMs);
  }, [state]);

  // Clear localStorage once payment is confirmed.
  useEffect(() => {
    if (state.phase === 'calibrating' || state.phase === 'confirmation') {
      clearProgress();
    }
  }, [state.phase]);

  // Show the "Reviewing your responses" microcopy during the assessment -> review pause.
  const enterReviewWithPause = useCallback(() => {
    setShowReviewIntro(true);
    const t = setTimeout(() => {
      setShowReviewIntro(false);
      dispatch({ type: 'ENTER_REVIEW' });
    }, TIMINGS.reviewPauseMs);
    return () => clearTimeout(t);
  }, []);

  const handleBegin = () => dispatch({ type: 'BEGIN' });

  const handleResume = () => {
    if (!resumeOffer) return;
    const migrated = migrateLegacyAnswers(resumeOffer.answers);
    dispatch({
      type: 'HYDRATE',
      payload: {
        phase: resumeOffer.phase === 'welcome' ? 'question' : resumeOffer.phase,
        questionIndex: resumeOffer.questionIndex,
        answers: { ...INITIAL_FLOW_STATE.answers, ...migrated },
      },
    });
    setResumeOffer(null);
  };

  const handleStartOver = () => {
    clearProgress();
    setResumeOffer(null);
    dispatch({ type: 'RESET' });
  };

  const handleAnswer = useCallback((field: string, value: unknown) => {
    dispatch({ type: 'ANSWER', field, value });
  }, []);

  const handleNext = useCallback(() => {
    const isLast = state.questionIndex >= TOTAL_QUESTIONS - 1;
    const goingToReview = state.returnToReview || isLast;
    if (goingToReview && !state.returnToReview) {
      // Last question -> longer pause + microcopy before review.
      enterReviewWithPause();
      return;
    }
    dispatch({ type: 'NEXT' });
  }, [state.questionIndex, state.returnToReview, enterReviewWithPause]);

  const handleBack = useCallback(() => dispatch({ type: 'BACK' }), []);

  const handleEditJump = useCallback((idx: number) => {
    dispatch({ type: 'JUMP_TO_QUESTION', index: idx, fromReview: true });
  }, []);

  const handleEnterPayment = useCallback(() => {
    dispatch({ type: 'ENTER_PAYMENT' });
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    dispatch({ type: 'PAYMENT_SUCCESS' });
  }, []);

  const handleCalibratingDone = useCallback(() => {
    dispatch({ type: 'ENTER_CONFIRMATION' });
  }, []);

  const flat = state.phase === 'question' ? currentFlat(state) : null;
  const showChrome = state.phase === 'question';

  if (!state.hydrated) {
    return (
      <main className="min-h-[100dvh] bg-cream">
        <div className="mx-auto max-w-prose540 px-6 py-16 text-center">
          <p style={{ color: '#8a7d6a', fontSize: 14 }}>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-cream paper-grain">
      <ProgressBar percent={progressPercent(state)} visible={showChrome} />

      <TopBar
        sectionIndex={flat?.sectionIndex}
        sectionName={flat?.sectionName}
        indexInFlow={flat?.indexInFlow}
        totalInFlow={flat?.totalInFlow}
        minimal={!showChrome}
      />

      {!storageOk && state.phase !== 'confirmation' && state.phase !== 'calibrating' && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: '#fbf0ec',
            color: '#6b2a1a',
            fontSize: 12,
            textAlign: 'center',
            zIndex: 45,
            borderBottom: '1px solid rgba(107, 42, 26, 0.2)',
          }}
        >
          Your progress will not be saved if you leave this page.
        </div>
      )}

      {showReviewIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(250, 243, 231, 0.92)',
            zIndex: 55,
          }}
        >
          <p
            style={{
              fontSize: 16,
              color: '#8a7d6a',
              letterSpacing: '0.02em',
            }}
          >
            Reviewing your responses.
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {state.phase === 'welcome' && (
          <motion.div
            key="welcome"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <WelcomeScreen
              onStart={handleBegin}
              resumeAvailable={resumeOffer}
              onResume={handleResume}
              onStartOver={handleStartOver}
            />
          </motion.div>
        )}

        {state.phase === 'question' && flat && (
          <motion.div
            key={`q-${state.questionIndex}`}
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <QuestionScreen
              flat={flat}
              answers={state.answers}
              onAnswer={handleAnswer}
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={state.questionIndex > 0}
              isLast={state.questionIndex === FLAT_QUESTIONS.length - 1}
              returnToReview={state.returnToReview}
            />
          </motion.div>
        )}

        {state.phase === 'review' && (
          <motion.div
            key="review"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <ReviewScreen
              answers={state.answers}
              onEdit={handleEditJump}
              onContinue={handleEnterPayment}
            />
          </motion.div>
        )}

        {state.phase === 'payment' && (
          <motion.div
            key="payment"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <PaymentScreen
              answers={state.answers}
              onAnswer={handleAnswer}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </motion.div>
        )}

        {state.phase === 'calibrating' && (
          <motion.div
            key="calibrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CalibratingScreen onComplete={handleCalibratingDone} />
          </motion.div>
        )}

        {state.phase === 'confirmation' && (
          <motion.div
            key="confirmation"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <ConfirmationScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
