import { LevelCode, MeaningMatchQuestion } from "../types/content";
import { allQuestions, getCurrentLevelUnitQuestions, getQuestionsByLevel } from "../content/questions";

export function getNextPracticeQuestion(
  currentId: string | null,
  level: LevelCode,
  solvedIds: string[] = []
): MeaningMatchQuestion {
  const levelPool = getQuestionsByLevel(level);
  if (!levelPool || levelPool.length === 0) {
    return allQuestions[0];
  }

  // 1. Prefer unsolved questions first, excluding currentId
  const unsolved = levelPool.filter(
    (q) => !solvedIds.includes(q.id) && q.id !== currentId
  );
  if (unsolved.length > 0) {
    const chosen = unsolved[Math.floor(Math.random() * unsolved.length)];
    return chosen;
  }

  // 2. Otherwise pick any question from the level pool excluding currentId
  const otherCandidates = levelPool.filter((q) => q.id !== currentId);
  if (otherCandidates.length > 0) {
    const chosen = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
    return chosen;
  }

  return levelPool[0];
}

export function getRecommendedWord(
  level: LevelCode,
  solvedIds: string[] = []
): { word: string; meaning: string; level: LevelCode; topic: string; phonetic?: string; pronunciation?: string; exampleSentence?: string; exampleTranslation?: string } {
  const levelPool = getQuestionsByLevel(level);
  if (!levelPool || levelPool.length === 0) {
    const q = allQuestions[0];
    return {
      word: q.word || q.prompt || "",
      meaning: q.meaning || q.answer || "",
      level: q.level,
      topic: q.topic,
      phonetic: q.phonetic,
      pronunciation: q.pronunciation,
      exampleSentence: q.exampleSentence,
      exampleTranslation: q.exampleTranslation,
    };
  }

  // Day of year deterministic index so word changes every day
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Drawn from the unit being worked through, so the word of the day belongs
  // to today's actual lesson instead of somewhere further down the level.
  const unitPool = getCurrentLevelUnitQuestions(level, solvedIds);
  const unseenInUnit = unitPool.filter((q) => !solvedIds.includes(q.id));
  const unseenInLevel = levelPool.filter((q) => !solvedIds.includes(q.id));

  const candidatePool =
    unseenInUnit.length > 0
      ? unseenInUnit
      : unseenInLevel.length > 0
        ? unseenInLevel
        : unitPool.length > 0
          ? unitPool
          : levelPool;
  const candidate = candidatePool[dayOfYear % candidatePool.length];

  return {
    word: candidate.word || candidate.prompt || "",
    meaning: candidate.meaning || candidate.answer || "",
    level: candidate.level,
    topic: candidate.topic,
    phonetic: candidate.phonetic,
    pronunciation: candidate.pronunciation,
    exampleSentence: candidate.exampleSentence,
    exampleTranslation: candidate.exampleTranslation,
  };
}

// Vocabulary mastery lives in domain/learning/mastery.ts — it is derived from
// per-word recall records, not from a raw solved count.
