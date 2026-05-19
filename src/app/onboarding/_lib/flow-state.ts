// State machine for the assessment flow.
// One useReducer drives every phase. No new runtime dependency.

import { EMPTY_DRAFT, type OnboardingDraft } from './validation';
import { FLAT_QUESTIONS, TOTAL_QUESTIONS } from './question-flat';
import { QUESTIONS } from './questions';

export type FlowPhase =
  | 'welcome'
  | 'question'
  | 'review'
  | 'payment'
  | 'calibrating'
  | 'confirmation';

export interface FlowState {
  phase: FlowPhase;
  questionIndex: number; // 0-based position in FLAT_QUESTIONS
  answers: OnboardingDraft;
  // When true, the next NEXT action should return to review (used after an Edit jump).
  returnToReview: boolean;
  // Hydration flag; first paint waits for localStorage check.
  hydrated: boolean;
}

export const INITIAL_FLOW_STATE: FlowState = {
  phase: 'welcome',
  questionIndex: 0,
  answers: seedDefaults({ ...EMPTY_DRAFT }),
  returnToReview: false,
  hydrated: false,
};

function seedDefaults(draft: OnboardingDraft): OnboardingDraft {
  const next = { ...draft };
  for (const q of QUESTIONS) {
    if (q.defaultValue !== undefined && (next as Record<string, unknown>)[q.field] == null) {
      (next as Record<string, unknown>)[q.field] = q.defaultValue;
    }
    if (q.defaultSecondaryValue !== undefined && q.secondaryField) {
      if ((next as Record<string, unknown>)[q.secondaryField] == null) {
        (next as Record<string, unknown>)[q.secondaryField] = q.defaultSecondaryValue;
      }
    }
  }
  return next;
}

export type FlowAction =
  | { type: 'HYDRATE'; payload: Partial<FlowState> }
  | { type: 'BEGIN' } // welcome -> first question
  | { type: 'ANSWER'; field: string; value: unknown }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'JUMP_TO_QUESTION'; index: number; fromReview?: boolean }
  | { type: 'ENTER_REVIEW' }
  | { type: 'ENTER_PAYMENT' }
  | { type: 'PAYMENT_SUCCESS' }
  | { type: 'ENTER_CONFIRMATION' }
  | { type: 'RESET' };

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };

    case 'BEGIN':
      return { ...state, phase: 'question', questionIndex: 0 };

    case 'ANSWER': {
      const next = { ...state.answers, [action.field]: action.value } as OnboardingDraft;
      return { ...state, answers: next };
    }

    case 'NEXT': {
      if (state.phase !== 'question') return state;
      // After editing from review, jump straight back to review.
      if (state.returnToReview) {
        return { ...state, phase: 'review', returnToReview: false };
      }
      const last = state.questionIndex >= TOTAL_QUESTIONS - 1;
      if (last) {
        return { ...state, phase: 'review' };
      }
      return { ...state, questionIndex: state.questionIndex + 1 };
    }

    case 'BACK': {
      if (state.phase !== 'question') return state;
      if (state.questionIndex <= 0) return state;
      return { ...state, questionIndex: state.questionIndex - 1 };
    }

    case 'JUMP_TO_QUESTION': {
      const clamped = Math.max(0, Math.min(TOTAL_QUESTIONS - 1, action.index));
      return {
        ...state,
        phase: 'question',
        questionIndex: clamped,
        returnToReview: !!action.fromReview,
      };
    }

    case 'ENTER_REVIEW':
      return { ...state, phase: 'review', returnToReview: false };

    case 'ENTER_PAYMENT':
      return { ...state, phase: 'payment' };

    case 'PAYMENT_SUCCESS':
      return { ...state, phase: 'calibrating' };

    case 'ENTER_CONFIRMATION':
      return { ...state, phase: 'confirmation' };

    case 'RESET':
      return {
        ...INITIAL_FLOW_STATE,
        answers: seedDefaults({ ...EMPTY_DRAFT }),
        hydrated: true,
      };

    default:
      return state;
  }
}

// Helpers consumed by components.
export function currentFlat(state: FlowState) {
  return FLAT_QUESTIONS[state.questionIndex];
}

export function hasAnswered(state: FlowState, field: string): boolean {
  const v = (state.answers as Record<string, unknown>)[field];
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

export function progressPercent(state: FlowState): number {
  if (state.phase === 'welcome') return 0;
  if (state.phase === 'review' || state.phase === 'payment' || state.phase === 'calibrating' || state.phase === 'confirmation') {
    return 100;
  }
  // question phase
  return Math.round(((state.questionIndex + 1) / TOTAL_QUESTIONS) * 100);
}
