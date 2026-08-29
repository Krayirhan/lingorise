import { MeaningMatchQuestion } from "../../types/content";
import { UserData } from "../../types/user";
import { isItemDue } from "../review/spacedRepetition";
import { evaluateBadges, updateDailyQuests } from "../gamification/badges";
import { recordLearningOutcome } from "../learning/mastery";
import { now as clockNow, todayISO } from "../../utils/clock";

export type PracticeSessionMode = "PRACTICE" | "EXAM";

/** Flat payout for clearing a due review, capped to once per word per day. */
const REVIEW_XP_REWARD = 5;

/** Applies one submitted answer without depending on React or navigation. */
export function applyPracticeAnswer(
  previous: UserData,
  question: MeaningMatchQuestion,
  picked: string,
  xpReward: number,
  sessionMode: PracticeSessionMode = "PRACTICE"
): UserData {
  const correctAnswer = question.meaning || question.answer;
  const isCorrect = picked === correctAnswer;
  const now = clockNow();

  let nextXp = previous.xp;
  let nextSolved = [...previous.solvedQuestionIds];
  let nextRewarded = [...previous.rewardedQuestionIds];
  let nextReviewXpIds = [...(previous.dailyReviewXpIds || [])];

  // What a word is worth follows the word's own state, not the label on the
  // session it appeared in — a single daily session now mixes both kinds.
  const existingItem = previous.learningProgress?.[question.id];
  const isFirstEncounter = !nextRewarded.includes(question.id);
  const wasDue = isItemDue(existingItem, now);

  if (isCorrect) {
    if (isFirstEncounter) {
      nextRewarded.push(question.id);
      nextXp += xpReward;
      if (!nextSolved.includes(question.id)) {
        nextSolved.push(question.id);
      }
    } else if (wasDue && !nextReviewXpIds.includes(question.id)) {
      // One payout per word per day, and only for words that were actually
      // due — otherwise replaying known words would mint XP on demand.
      nextReviewXpIds.push(question.id);
      nextXp += REVIEW_XP_REWARD;
    }
  }

  // The level-completion exam draws from the level's whole word pool — not
  // just words the learner has already met in daily practice (see
  // buildLevelExam's own doc comment) — and the daily practice quest is
  // sized to "what a learner actually has to answer in a daily session," not
  // to exam activity (see createDailyQuests). Progressing/completing the
  // daily quest from exam answers let the gamification economy be satisfied
  // by an activity it wasn't designed to measure (CORE-QA-001); XP,
  // rewarded/solved state, and mastery tracking below are unaffected — a
  // correctly-answered word is genuinely learned regardless of which
  // session type taught it.
  const questEvent = isFirstEncounter ? "PRACTICE" : "REVIEW";
  const questResult =
    sessionMode === "EXAM"
      ? { updatedQuests: previous.dailyQuests, bonusXpEarned: 0 }
      : updateDailyQuests(previous.dailyQuests, { type: questEvent, isCorrect });
  nextXp += questResult.bonusXpEarned;

  const today = todayISO();

  // The recall record is the single source of truth for both progress and
  // scheduling, so it is updated for every answer.
  const nextLearningProgress = {
    ...(previous.learningProgress || {}),
    [question.id]: recordLearningOutcome(existingItem, isCorrect, today, now),
  };

  const xpEarned = nextXp - previous.xp;
  const previousHistory = previous.practiceHistory || [];
  const hasTodayEntry = previousHistory.some((entry) => entry.date === today);
  const history = hasTodayEntry
    ? previousHistory.map((entry) =>
        entry.date === today
          ? {
              ...entry,
              answers: entry.answers + 1,
              correct: entry.correct + (isCorrect ? 1 : 0),
              xp: entry.xp + xpEarned,
            }
          : entry
      )
    : [...previousHistory, { date: today, answers: 1, correct: isCorrect ? 1 : 0, xp: xpEarned }];

  const intermediateState: UserData = {
    ...previous,
    xp: nextXp,
    solvedQuestionIds: nextSolved,
    rewardedQuestionIds: nextRewarded,
    dailyReviewXpIds: nextReviewXpIds,
    learningProgress: nextLearningProgress,
    dailyQuests: questResult.updatedQuests,
    practiceHistory: history.slice(-30),
    lastCompletedWord: {
      word: question.word || question.prompt || "",
      meaning: question.meaning || question.answer || "",
      level: question.level,
    },
  };

  return {
    ...intermediateState,
    unlockedBadges: evaluateBadges(intermediateState),
  };
}
