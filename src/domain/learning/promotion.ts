import { LevelCode } from "../../types/content";
import { LearningItemProgress } from "../../types/user";
import { getNextLevel, getQuestionsByLevel, isLevelReady } from "../../content/questions";
import { summarizeMastery } from "./mastery";

/**
 * Share of a level that must be genuinely recalled before its badge is earned.
 * Deliberately short of 100%: a language level is not a checklist, and holding
 * the badge hostage to the last stubborn word would punish real fluency.
 */
export const PROMOTION_THRESHOLD_PERCENT = 80;

export interface PromotionState {
  /** Mastery of the level the learner currently wears. */
  masteredPercent: number;
  /** Percentage still needed before the badge is earned. */
  remainingPercent: number;
  /** True once the current level has been genuinely consolidated. */
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
  learningProgress: Record<string, LearningItemProgress>,
  celebratedLevels: string[] = []
): PromotionState {
  const levelQuestions = getQuestionsByLevel(level);
  const mastery = summarizeMastery(learningProgress || {}, levelQuestions.map((q) => q.id));
  const isEarned = mastery.masteredPercent >= PROMOTION_THRESHOLD_PERCENT;
  const nextLevel = getNextLevel(level);

  return {
    masteredPercent: mastery.masteredPercent,
    remainingPercent: Math.max(0, PROMOTION_THRESHOLD_PERCENT - mastery.masteredPercent),
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
  learningProgress: Record<string, LearningItemProgress>
): { isAhead: boolean; currentMasteredPercent: number; isTargetReady: boolean } {
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentQuestions = getQuestionsByLevel(current);
  const mastery = summarizeMastery(
    learningProgress || {},
    currentQuestions.map((q) => q.id)
  );

  return {
    isAhead:
      order.indexOf(target) > order.indexOf(current) &&
      mastery.masteredPercent < PROMOTION_THRESHOLD_PERCENT,
    currentMasteredPercent: mastery.masteredPercent,
    isTargetReady: isLevelReady(target),
  };
}
