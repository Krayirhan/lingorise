import { LevelCode } from "../../types/content";

/**
 * Difficulty and XP were flat constants (10 XP, difficulty 1) regardless of
 * level or word — a C2 word paid the same as an A1 word. This derives both
 * from something real: the level a word belongs to, with word length as a
 * light tiebreaker within a level.
 */
const LEVEL_BASE_DIFFICULTY: Record<LevelCode, 1 | 2 | 3 | 4 | 5> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 3,
  C1: 4,
  C2: 5,
};

const LEVEL_BASE_XP: Record<LevelCode, number> = {
  A1: 10,
  A2: 15,
  B1: 20,
  B2: 25,
  C1: 30,
  C2: 35,
};

/** Long or multi-word entries nudge difficulty up within their level's band. */
export function computeDifficulty(level: LevelCode, word: string): 1 | 2 | 3 | 4 | 5 {
  const base = LEVEL_BASE_DIFFICULTY[level];
  const isLong = word.length >= 9 || word.includes(" ");
  return Math.min(5, base + (isLong ? 1 : 0)) as 1 | 2 | 3 | 4 | 5;
}

export function computeXpReward(level: LevelCode, word: string): number {
  const base = LEVEL_BASE_XP[level];
  const isLong = word.length >= 9 || word.includes(" ");
  return base + (isLong ? 5 : 0);
}
