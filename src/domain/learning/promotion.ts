import { LevelCode } from "../../types/content";
import { getNextLevel, isLevelReady } from "../../content/questions";

/**
 * A level is complete when its 60-question exam is passed (50+ correct —
 * see domain/learning/levelExam.ts), not by a per-word mastery percentage.
 * Reinforcement/spaced-repetition tracking of individual words was retired
 * (roadmap 18-srs-flow-hardening.md, 2026-08-26): daily practice never
 * repeats a word, and "finishing" a level is a single deliberate exam, not
 * something that quietly accumulates over days of resurfaced words.
 */
export interface PromotionState {
  /** True once the level's completion exam has been passed. */
  isEarned: boolean;
  /** The level that follows, if there is one. */
  nextLevel: LevelCode | null;
  /** Whether that next level actually has enough content to enter. */
  isNextLevelReady: boolean;
  /** True when the learner should be congratulated right now. */
  shouldCelebrate: boolean;
}

export function evaluatePromotion(
  level: LevelCode,
  passedLevelExams: LevelCode[] = [],
  celebratedLevels: string[] = []
): PromotionState {
  const isEarned = passedLevelExams.includes(level);
  const nextLevel = getNextLevel(level);

  return {
    isEarned,
    nextLevel,
    isNextLevelReady: nextLevel ? isLevelReady(nextLevel) : false,
    shouldCelebrate: isEarned && !celebratedLevels.includes(level),
  };
}

/**
 * How ready a learner is for a level they are considering. This never blocks
 * the choice — it only lets the app say something honest before they jump.
 */
export function assessLevelChoice(
  target: LevelCode,
  current: LevelCode,
  passedLevelExams: LevelCode[] = []
): { isAhead: boolean; isTargetReady: boolean } {
  const order: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return {
    isAhead: order.indexOf(target) > order.indexOf(current) && !passedLevelExams.includes(current),
    isTargetReady: isLevelReady(target),
  };
}
