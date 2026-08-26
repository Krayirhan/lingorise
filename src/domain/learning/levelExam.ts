import { LevelCode, MeaningMatchQuestion } from "../../types/content";
import { getQuestionsByLevel } from "../../content/questions";

/**
 * Replaces per-word spaced-repetition mastery as the level-completion gate
 * (roadmap 18-srs-flow-hardening.md, 2026-08-26 "sınav" redesign): a level
 * is finished by passing one completion exam drawn from the whole level,
 * not by resurfacing individual words for reinforcement over days or weeks.
 */
export const EXAM_QUESTION_COUNT = 60;
export const EXAM_PASS_COUNT = 50;

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickFromBand(pool: MeaningMatchQuestion[], min: number, max: number, count: number): MeaningMatchQuestion[] {
  const band = pool.filter((q) => {
    const d = q.difficulty || 1;
    return d >= min && d <= max;
  });
  return shuffle(band).slice(0, count);
}

/**
 * 60 questions from the level's full word pool — not just words the learner
 * has already met — split evenly across easy (1-2) / medium (3) / hard (4-5)
 * difficulty so passing reflects real command of the level, not which unit
 * happened to come up in daily practice. If a level doesn't have enough
 * words in some band to fill its third, the remaining slots are filled from
 * whatever's left over rather than padding with duplicate questions.
 */
export function buildLevelExam(level: LevelCode): MeaningMatchQuestion[] {
  const pool = getQuestionsByLevel(level);
  const perBand = Math.floor(EXAM_QUESTION_COUNT / 3);

  const easy = pickFromBand(pool, 1, 2, perBand);
  const medium = pickFromBand(pool, 3, 3, perBand);
  const hard = pickFromBand(pool, 4, 5, perBand);

  let combined = [...easy, ...medium, ...hard];
  if (combined.length < Math.min(EXAM_QUESTION_COUNT, pool.length)) {
    const usedIds = new Set(combined.map((q) => q.id));
    const leftover = shuffle(pool.filter((q) => !usedIds.has(q.id)));
    combined = [...combined, ...leftover.slice(0, EXAM_QUESTION_COUNT - combined.length)];
  }
  return shuffle(combined).slice(0, EXAM_QUESTION_COUNT);
}

/** A level needs enough real content to actually seat a 60-question exam. */
export function isExamAvailable(level: LevelCode): boolean {
  return getQuestionsByLevel(level).length >= EXAM_PASS_COUNT;
}

export function isExamPassed(correctCount: number): boolean {
  return correctCount >= EXAM_PASS_COUNT;
}
