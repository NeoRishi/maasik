// Flattens the 7 PARTS into a single FLAT_QUESTIONS array of 25 entries.
// Each entry knows its position in the overall flow and which section it belongs to.

import { PARTS, QUESTIONS, type Question, type Part } from './questions';

export interface FlatQuestion {
  question: Question;
  /** 1-indexed section number (matches Part.number). */
  sectionIndex: number;
  /** Display name for the section, uppercase-ready. */
  sectionName: string;
  /** 1-indexed position in the full flow (1..25). */
  indexInFlow: number;
  /** Total questions in the full flow (25). */
  totalInFlow: number;
  /** 1-indexed position within this section. */
  indexInSection: number;
  /** Total questions in this section. */
  totalInSection: number;
}

function buildFlat(): FlatQuestion[] {
  const flat: FlatQuestion[] = [];
  const total = QUESTIONS.length;
  let cursor = 0;

  for (const part of PARTS as Part[]) {
    const inPart = QUESTIONS.filter((q) => q.part === part.number);
    inPart.forEach((q, i) => {
      cursor += 1;
      flat.push({
        question: q,
        sectionIndex: part.number,
        sectionName: part.title,
        indexInFlow: cursor,
        totalInFlow: total,
        indexInSection: i + 1,
        totalInSection: inPart.length,
      });
    });
  }

  return flat;
}

export const FLAT_QUESTIONS: FlatQuestion[] = buildFlat();
export const TOTAL_QUESTIONS = FLAT_QUESTIONS.length;

export function flatQuestionIndexByField(field: string): number {
  return FLAT_QUESTIONS.findIndex((f) => f.question.field === field);
}
