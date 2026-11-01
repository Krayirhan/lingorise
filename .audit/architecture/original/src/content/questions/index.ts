import { LevelCode, MeaningMatchQuestion } from "../../types/content";
import { a1Questions } from "./a1";
import { a2Questions } from "./a2";
import { b1Questions } from "./b1";
import { b2Questions } from "./b2";
import { c1Questions } from "./c1";
import { c2Questions } from "./c2";
import { enrichQuestionsWithCurriculum, getCurriculumUnits } from "../curriculum";

export const allQuestions: MeaningMatchQuestion[] = enrichQuestionsWithCurriculum([
  ...a1Questions,
  ...a2Questions,
  ...b1Questions,
  ...b2Questions,
  ...c1Questions,
  ...c2Questions,
]);

let activeQuestions: MeaningMatchQuestion[] = allQuestions;

export function setRuntimeQuestions(questions: MeaningMatchQuestion[]): void {
  if (questions.length === 0) {
    activeQuestions = allQuestions;
    return;
  }

  // Remote content overrides the matching bundled item. Keeping other bundled
  // levels available preserves overdue review sessions while only the active
  // level has been downloaded and cached for this launch.
  //
  // Teaching-enrichment fields (example sentences, hints, context notes, ...)
  // are backfilled from the bundled item when the remote one lacks them —
  // the published Firestore catalogue has lagged behind bundled content
  // enrichment before, and a thin remote row should never blank out a
  // hand-written example sentence that already ships in the app.
  const remoteById = new Map(questions.map((question) => [question.id, question]));
  const merged = allQuestions.map((question) => {
    const remote = remoteById.get(question.id);
    if (!remote) return question;
    return {
      ...remote,
      exampleSentence: remote.exampleSentence || question.exampleSentence,
      exampleTranslation: remote.exampleTranslation || question.exampleTranslation,
      contextNote: remote.contextNote || question.contextNote,
      hint: remote.hint || question.hint,
      phonetic: remote.phonetic || question.phonetic,
      pronunciation: remote.pronunciation || question.pronunciation,
      partOfSpeech: remote.partOfSpeech || question.partOfSpeech,
      cefr: remote.cefr || question.cefr,
      senseId: remote.senseId || question.senseId,
      learningItemKind: remote.learningItemKind || question.learningItemKind,
      register: remote.register || question.register,
      source: remote.source || question.source,
      reviewer: remote.reviewer || question.reviewer,
      reviewedAt: remote.reviewedAt || question.reviewedAt,
      editorialReview: remote.editorialReview || question.editorialReview,
      editorialStatus: remote.editorialStatus || question.editorialStatus,
    };
  });
  const remoteOnly = questions.filter((question) => !allQuestions.some((fallback) => fallback.id === question.id));
  activeQuestions = enrichQuestionsWithCurriculum([...merged, ...remoteOnly]);
}

export function getAllQuestions(): MeaningMatchQuestion[] {
  return activeQuestions;
}

export const questionsByLevel: Record<LevelCode, MeaningMatchQuestion[]> = {
  A1: allQuestions.filter((question) => question.level === "A1"),
  A2: allQuestions.filter((question) => question.level === "A2"),
  B1: allQuestions.filter((question) => question.level === "B1"),
  B2: allQuestions.filter((question) => question.level === "B2"),
  C1: allQuestions.filter((question) => question.level === "C1"),
  C2: allQuestions.filter((question) => question.level === "C2"),
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

// A curriculum migration changes the stable unit/lesson membership, so an
// interrupted session created against the former positional units must be
// rebuilt from the current catalogue on the next launch.
// 2.3 quarantines B1–C2 from the remotely published catalogue until their
// rewritten content has evidence-backed editorial approval.
export const CONTENT_VERSION = "2.3.0";

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
import { CONTENT_UNIT_SIZE } from "../../domain/learning/constants";
export { CONTENT_UNIT_SIZE } from "../../domain/learning/constants";

/**
 * Fewest words a level needs before it is worth sending a learner into it.
 * Below this a level is announced as coming soon rather than offered, so a
 * promotion never opens onto an empty room.
 */
export const LEVEL_READY_MIN_QUESTIONS = 100;

/** Levels withheld from learner selection while their catalogue is rewritten. */
const EDITORIAL_HOLD_LEVELS = new Set<LevelCode>(["B1", "B2", "C1", "C2"]);

export function isLevelReady(level: LevelCode): boolean {
  if (EDITORIAL_HOLD_LEVELS.has(level)) return false;
  const questions = getQuestionsByLevel(level);
  return questions.length >= LEVEL_READY_MIN_QUESTIONS && questions.every((question) =>
    question.status === "published" &&
    Boolean(question.topicId && question.unitId && question.lessonId && question.exampleSentence && question.exampleTranslation && question.contextNote && question.hint && question.pronunciation)
  );
}

/** Editorial readiness is intentionally separate from whether a learner can enter a level. */
export function isLevelEditoriallyApproved(level: LevelCode): boolean {
  const questions = getQuestionsByLevel(level);
  return questions.length >= LEVEL_READY_MIN_QUESTIONS && questions.every((question) =>
    question.editorialStatus === "approved" &&
    Boolean(question.editorialReview?.reviewId && question.editorialReview.reviewerId && question.editorialReview.reviewedAt && question.editorialReview.rubricVersion)
  );
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
  const curriculumUnits = getCurriculumUnits(level, levelQuestions);
  // B1–C2 use their legacy fallback until their curriculum is authored.
  const units = curriculumUnits.length
    ? curriculumUnits.map((unit) => levelQuestions.filter((question) => unit.questionIds.includes(question.id)))
    : Array.from({ length: Math.max(1, Math.ceil(levelQuestions.length / CONTENT_UNIT_SIZE)) }, (_, index) =>
      levelQuestions.slice(index * CONTENT_UNIT_SIZE, (index + 1) * CONTENT_UNIT_SIZE)
    );
  const unitCount = units.length;

  for (let unitIndex = 0; unitIndex < unitCount; unitIndex += 1) {
    const questions = units[unitIndex];
    const learnedInUnit = questions.filter((question) => solvedQuestionIds.includes(question.id)).length;
    if (learnedInUnit < questions.length) {
      return { unitIndex, unitCount, questions, learnedInUnit };
    }
  }

  const lastIndex = Math.max(0, unitCount - 1);
  const questions = units[lastIndex];
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
