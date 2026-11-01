import { CONTENT_UNIT_SIZE } from "./constants";
import { getCurriculumUnits } from "./curriculum";
import { LevelCode, MeaningMatchQuestion } from "../models/content";

export const LEVEL_READY_MIN_QUESTIONS = 100;
export const LEVEL_ORDER: readonly LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const EDITORIAL_HOLD_LEVELS = new Set<LevelCode>(["B1", "B2", "C1", "C2"]);

export interface LevelUnitInfo {
  unitIndex: number;
  unitCount: number;
  questions: MeaningMatchQuestion[];
  learnedInUnit: number;
}

/** A learner-selectable level must meet both the reviewed release threshold and item-shape requirements. */
export function isLevelReady(level: LevelCode, questions: MeaningMatchQuestion[]): boolean {
  if (EDITORIAL_HOLD_LEVELS.has(level)) return false;
  return questions.length >= LEVEL_READY_MIN_QUESTIONS && questions.every((question) =>
    question.status === "published" &&
    Boolean(question.topicId && question.unitId && question.lessonId && question.exampleSentence && question.exampleTranslation && question.contextNote && question.hint && question.pronunciation)
  );
}

/** Publication approval is distinct from learner availability and requires recorded human review evidence. */
export function isLevelEditoriallyApproved(questions: MeaningMatchQuestion[]): boolean {
  return questions.length >= LEVEL_READY_MIN_QUESTIONS && questions.every((question) =>
    question.editorialStatus === "approved" &&
    Boolean(question.editorialReview?.reviewId && question.editorialReview.reviewerId && question.editorialReview.reviewedAt && question.editorialReview.rubricVersion)
  );
}

export function getNextLevel(level: LevelCode): LevelCode | null {
  const index = LEVEL_ORDER.indexOf(level);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

export function getLevelOrder(): LevelCode[] {
  return [...LEVEL_ORDER];
}

/** Returns the active unit for this level and the learner's known question ids. */
export function getLevelUnitInfo(
  level: LevelCode,
  levelQuestions: MeaningMatchQuestion[],
  solvedQuestionIds: string[]
): LevelUnitInfo {
  const curriculumUnits = getCurriculumUnits(level, levelQuestions);
  const units = curriculumUnits.length
    ? curriculumUnits.map((unit) => levelQuestions.filter((question) => unit.questionIds.includes(question.id)))
    : Array.from({ length: Math.max(1, Math.ceil(levelQuestions.length / CONTENT_UNIT_SIZE)) }, (_, index) =>
      levelQuestions.slice(index * CONTENT_UNIT_SIZE, (index + 1) * CONTENT_UNIT_SIZE)
    );
  const unitCount = units.length;

  for (let unitIndex = 0; unitIndex < unitCount; unitIndex += 1) {
    const questions = units[unitIndex];
    const learnedInUnit = questions.filter((question) => solvedQuestionIds.includes(question.id)).length;
    if (learnedInUnit < questions.length) return { unitIndex, unitCount, questions, learnedInUnit };
  }

  const lastIndex = Math.max(0, unitCount - 1);
  const questions = units[lastIndex];
  return { unitIndex: lastIndex, unitCount, questions, learnedInUnit: questions.length };
}

/** Identifies the transition that completes the unit that was active before an answer. */
export function detectUnitJustCompleted(
  level: LevelCode,
  levelQuestions: MeaningMatchQuestion[],
  previousSolvedIds: string[],
  nextSolvedIds: string[]
): { unitIndex: number; wordsInUnit: number } | null {
  const before = getLevelUnitInfo(level, levelQuestions, previousSolvedIds);
  if (before.learnedInUnit >= before.questions.length) return null;

  const learnedAfter = before.questions.filter((question) => nextSolvedIds.includes(question.id)).length;
  if (learnedAfter < before.questions.length) return null;
  return { unitIndex: before.unitIndex, wordsInUnit: before.questions.length };
}
