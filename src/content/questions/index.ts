import { LevelCode, MeaningMatchQuestion } from "../../types/content";
import { a1Questions } from "./a1";
import { a2Questions } from "./a2";
import { b1Questions } from "./b1";
import { b2Questions } from "./b2";
import { c1Questions } from "./c1";
import { c2Questions } from "./c2";

export const allQuestions: MeaningMatchQuestion[] = [
  ...a1Questions,
  ...a2Questions,
  ...b1Questions,
  ...b2Questions,
  ...c1Questions,
  ...c2Questions,
];

let activeQuestions: MeaningMatchQuestion[] = allQuestions;

export function setRuntimeQuestions(questions: MeaningMatchQuestion[]): void {
  if (questions.length === 0) {
    activeQuestions = allQuestions;
    return;
  }

  // Remote content overrides the matching bundled item. Keeping other bundled
  // levels available preserves overdue review sessions while only the active
  // level has been downloaded and cached for this launch.
  const remoteById = new Map(questions.map((question) => [question.id, question]));
  const merged = allQuestions.map((question) => remoteById.get(question.id) || question);
  const remoteOnly = questions.filter((question) => !allQuestions.some((fallback) => fallback.id === question.id));
  activeQuestions = [...merged, ...remoteOnly];
}

export function getAllQuestions(): MeaningMatchQuestion[] {
  return activeQuestions;
}

export const questionsByLevel: Record<LevelCode, MeaningMatchQuestion[]> = {
  A1: a1Questions,
  A2: a2Questions,
  B1: b1Questions,
  B2: b2Questions,
  C1: c1Questions,
  C2: c2Questions,
};

/**
 * Validates the question dataset for uniqueness of IDs, prompt-answer integrity, and duplicate checks.
 */
export function validateQuestionDatabase(): { valid: boolean; duplicateIds: string[]; invalidQuestions: string[] } {
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const invalidQuestions: string[] = [];

  for (const q of allQuestions) {
    if (seenIds.has(q.id)) {
      duplicateIds.push(q.id);
    }
    seenIds.add(q.id);

    const correctAnswer = q.meaning || q.answer;
    const word = q.word || q.prompt;
    const options = q.options || [correctAnswer, ...q.wrongOptions];

    const hasLearningMetadata = Boolean(
      q.partOfSpeech && q.exampleSentence && q.exampleTranslation && q.contextNote && q.pronunciation && q.hint
    );
    if (!word || !correctAnswer || !options.includes(correctAnswer) || options.length < 2 || !hasLearningMetadata) {
      invalidQuestions.push(q.id);
    }
  }

  return {
    valid: duplicateIds.length === 0 && invalidQuestions.length === 0,
    duplicateIds,
    invalidQuestions,
  };
}

export const CONTENT_VERSION = "1.2.0";

export function getQuestionById(id: string): MeaningMatchQuestion | undefined {
  return activeQuestions.find((q) => q.id === id);
}

export function findQuestionByWord(word: string): MeaningMatchQuestion | undefined {
  const norm = word.toLowerCase().trim();
  return activeQuestions.find(
    (q) =>
      (q.word && q.word.toLowerCase().trim() === norm) ||
      (q.prompt && q.prompt.toLowerCase().trim() === norm)
  );
}

export function searchQuestions(query: string, level?: LevelCode): MeaningMatchQuestion[] {
  const norm = query.toLowerCase().trim();
  const pool = level ? getQuestionsByLevel(level) : activeQuestions;
  if (!norm) return pool;
  return pool.filter(
    (q) =>
      (q.word && q.word.toLowerCase().includes(norm)) ||
      (q.meaning && q.meaning.toLowerCase().includes(norm)) ||
      (q.prompt && q.prompt.toLowerCase().includes(norm)) ||
      (q.topic && q.topic.toLowerCase().includes(norm))
  );
}

export function getQuestionsByLevel(level: LevelCode): MeaningMatchQuestion[] {
  const matches = activeQuestions.filter((question) => question.level === level);
  return matches.length > 0 ? matches : questionsByLevel[level] || questionsByLevel.A1;
}

/**
 * Words per unit. Kept small on purpose: at ten new words a day a 30-word unit
 * finishes in about three days, so the sense of completing something arrives
 * often instead of once a week.
 */
export const CONTENT_UNIT_SIZE = 30;

/**
 * Fewest words a level needs before it is worth sending a learner into it.
 * Below this a level is announced as coming soon rather than offered, so a
 * promotion never opens onto an empty room.
 */
export const LEVEL_READY_MIN_QUESTIONS = 100;

export function isLevelReady(level: LevelCode): boolean {
  return getQuestionsByLevel(level).length >= LEVEL_READY_MIN_QUESTIONS;
}

const LEVEL_ORDER: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** The level that follows this one, or null at the top of the ladder. */
export function getNextLevel(level: LevelCode): LevelCode | null {
  const index = LEVEL_ORDER.indexOf(level);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

export function getLevelOrder(): LevelCode[] {
  return [...LEVEL_ORDER];
}

export interface LevelUnitInfo {
  /** Zero-based index of the unit currently being worked through. */
  unitIndex: number;
  /** How many units this level is divided into. */
  unitCount: number;
  questions: MeaningMatchQuestion[];
  learnedInUnit: number;
}

/** Where the learner stands inside the level: which unit, and how far into it. */
export function getLevelUnitInfo(level: LevelCode, solvedQuestionIds: string[]): LevelUnitInfo {
  const levelQuestions = getQuestionsByLevel(level);
  const unitCount = Math.max(1, Math.ceil(levelQuestions.length / CONTENT_UNIT_SIZE));

  for (let unitIndex = 0; unitIndex < unitCount; unitIndex += 1) {
    const questions = levelQuestions.slice(unitIndex * CONTENT_UNIT_SIZE, (unitIndex + 1) * CONTENT_UNIT_SIZE);
    const learnedInUnit = questions.filter((question) => solvedQuestionIds.includes(question.id)).length;
    if (learnedInUnit < questions.length) {
      return { unitIndex, unitCount, questions, learnedInUnit };
    }
  }

  const lastIndex = Math.max(0, unitCount - 1);
  const questions = levelQuestions.slice(lastIndex * CONTENT_UNIT_SIZE);
  return { unitIndex: lastIndex, unitCount, questions, learnedInUnit: questions.length };
}

/**
 * Detects whether `nextSolvedIds` just finished the unit `prevSolvedIds` was
 * still working through — the exact moment worth logging for roadmap Birim
 * 2's "days to finish a unit" signal. Checked against the SAME unit rather
 * than comparing getLevelUnitInfo's unitIndex before/after, because that
 * function falls back to the last unit's index once a level is fully
 * finished — a naive index comparison would miss a level's final unit.
 */
export function detectUnitJustCompleted(
  level: LevelCode,
  prevSolvedIds: string[],
  nextSolvedIds: string[]
): { unitIndex: number; wordsInUnit: number } | null {
  const before = getLevelUnitInfo(level, prevSolvedIds);
  if (before.learnedInUnit >= before.questions.length) return null;

  const learnedAfter = before.questions.filter((q) => nextSolvedIds.includes(q.id)).length;
  if (learnedAfter < before.questions.length) return null;

  return { unitIndex: before.unitIndex, wordsInUnit: before.questions.length };
}

/** Returns the first unfinished unit for the current runtime catalogue. */
export function getCurrentLevelUnitQuestions(level: LevelCode, solvedQuestionIds: string[]): MeaningMatchQuestion[] {
  return getLevelUnitInfo(level, solvedQuestionIds).questions;
}

export function getQuestionsByTopic(topic: string, level?: LevelCode): MeaningMatchQuestion[] {
  const pool = level ? getQuestionsByLevel(level) : activeQuestions;
  return pool.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
}
