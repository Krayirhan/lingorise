import { MeaningMatchQuestion } from "../models/content";

/**
 * Replaces per-word spaced-repetition mastery as the level-completion gate
 * (roadmap 18-srs-flow-hardening.md, 2026-08-26 "sınav" redesign): a level
 * is finished by passing one completion exam drawn from the whole level,
 * not by resurfacing individual words for reinforcement over days or weeks.
 */
export const EXAM_QUESTION_COUNT = 60;
export const EXAM_PASS_COUNT = 50;

function shuffle<T>(list: T[], random: () => number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function withProductionTask(question: MeaningMatchQuestion): MeaningMatchQuestion {
  return {
    ...question,
    collocation: question.collocation || question.word,
    productionPrompt: question.productionPrompt || "Use the target word in a clear sentence that shows its meaning.",
  };
}

function pickFromBand(pool: MeaningMatchQuestion[], min: number, max: number, count: number, random: () => number): MeaningMatchQuestion[] {
  const band = pool.filter((q) => {
    const d = q.difficulty || 1;
    return d >= min && d <= max;
  });
  return shuffle(band, random).slice(0, count);
}

/**
 * Builds an exam from every curriculum topic, then applies the difficulty
 * spread inside each topic. This prevents a learner from passing a level by
 * getting an accidental concentration of questions from one familiar domain.
 */
function pickTopicQuota(pool: MeaningMatchQuestion[], count: number, random: () => number): MeaningMatchQuestion[] {
  const topicGroups = new Map<string, MeaningMatchQuestion[]>();
  pool.forEach((question) => {
    const key = question.topicId || question.topic;
    topicGroups.set(key, [...(topicGroups.get(key) || []), question]);
  });
  const groups = [...topicGroups.values()].filter((items) => items.length > 0);
  if (!groups.length) return [];

  const baseQuota = Math.floor(count / groups.length);
  let remainder = count - baseQuota * groups.length;
  const selected: MeaningMatchQuestion[] = [];
  for (const group of groups) {
    const quota = Math.min(group.length, baseQuota + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder -= 1;
    const easyCount = Math.floor(quota / 3);
    const mediumCount = Math.floor(quota / 3);
    const hardCount = quota - easyCount - mediumCount;
    const difficultyBalanced = [
      ...pickFromBand(group, 1, 2, easyCount, random),
      ...pickFromBand(group, 3, 3, mediumCount, random),
      ...pickFromBand(group, 4, 5, hardCount, random),
    ];
    const used = new Set(difficultyBalanced.map((item) => item.id));
    selected.push(...difficultyBalanced, ...shuffle(group.filter((item) => !used.has(item.id)), random).slice(0, quota - difficultyBalanced.length));
  }
  if (selected.length < Math.min(count, pool.length)) {
    const used = new Set(selected.map((item) => item.id));
    selected.push(...shuffle(pool.filter((item) => !used.has(item.id)), random).slice(0, count - selected.length));
  }
  return shuffle(selected, random).slice(0, count).map(withProductionTask);
}

/**
 * 60 questions from the level's full word pool — not just words the learner
 * has already met — split evenly across easy (1-2) / medium (3) / hard (4-5)
 * difficulty so passing reflects real command of the level, not which unit
 * happened to come up in daily practice. If a level doesn't have enough
 * words in some band to fill its third, the remaining slots are filled from
 * whatever's left over rather than padding with duplicate questions.
 */
export function buildLevelExam(pool: MeaningMatchQuestion[], random: () => number = Math.random): MeaningMatchQuestion[] {
  return pickTopicQuota(pool, Math.min(EXAM_QUESTION_COUNT, pool.length), random);
}

/** A level needs enough real content to actually seat a 60-question exam. */
export function isExamAvailable(pool: MeaningMatchQuestion[]): boolean {
  return pool.length >= EXAM_PASS_COUNT;
}

export function isExamPassed(correctCount: number): boolean {
  return correctCount >= EXAM_PASS_COUNT;
}

/** Counts each exam question once, making the 50/60 gate safe against duplicate submissions. */
export function countExamCorrectAnswers(records: Array<{ questionId: string; isCorrect: boolean }>): number {
  const seen = new Set<string>();
  return records.reduce((count, record) => {
    if (seen.has(record.questionId)) return count;
    seen.add(record.questionId);
    return count + (record.isCorrect ? 1 : 0);
  }, 0);
}
