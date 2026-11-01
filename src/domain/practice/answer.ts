import { evaluateBadges, updateDailyQuests } from "../gamification/badges";
import { recordLearningOutcome } from "../learning/mastery";
import { MeaningMatchQuestion } from "../models/content";
import { UserData } from "../models/user";
import { isItemDue } from "../review/spacedRepetition";


export type PracticeSessionMode = "PRACTICE" | "EXAM" | "CHECKPOINT";

/** Flat payout for clearing a due review, capped to once per word per day. */
const REVIEW_XP_REWARD = 5;

/** Calculates the XP delta for one submitted answer using the same rules as the state transition. */
export function calculatePracticeAnswerXp(
  previous: Pick<UserData, "learningProgress" | "rewardedQuestionIds" | "dailyReviewXpIds" | "dailyQuests">,
  question: MeaningMatchQuestion,
  picked: string,
  xpReward: number,
  sessionMode: PracticeSessionMode = "PRACTICE",
  now: number = Date.now()
): number {
  const isCorrect = picked === (question.meaning || question.answer);
  if (!isCorrect) return 0;

  const existingItem = previous.learningProgress?.[question.id];
  const isFirstEncounter = !previous.rewardedQuestionIds.includes(question.id);
  const wordXp = isFirstEncounter
    ? xpReward
    : isItemDue(existingItem, now) && !(previous.dailyReviewXpIds || []).includes(question.id)
      ? REVIEW_XP_REWARD
      : 0;
  if (sessionMode === "EXAM" || sessionMode === "CHECKPOINT") return wordXp;

  const questEvent = isFirstEncounter ? "PRACTICE" : "REVIEW";
  const questResult = updateDailyQuests(previous.dailyQuests, { type: questEvent, isCorrect });
  return wordXp + questResult.bonusXpEarned;
}

/** Applies one submitted answer without depending on React or navigation. */
export function applyPracticeAnswer(
  previous: UserData,
  question: MeaningMatchQuestion,
  picked: string,
  xpReward: number,
  sessionMode: PracticeSessionMode = "PRACTICE",
  now: number = Date.now(),
  today: string = new Date(now).toISOString().slice(0, 10),
  random: () => number = Math.random
): UserData {
  const correctAnswer = question.meaning || question.answer;
  const isCorrect = picked === correctAnswer;

  const nextSolved = [...previous.solvedQuestionIds];
  const nextRewarded = [...previous.rewardedQuestionIds];
  const nextReviewXpIds = [...(previous.dailyReviewXpIds || [])];

  // What a word is worth follows the word's own state, not the label on the
  // session it appeared in — a single daily session now mixes both kinds.
  const existingItem = previous.learningProgress?.[question.id];
  const isFirstEncounter = !nextRewarded.includes(question.id);
  const wasDue = isItemDue(existingItem, now);

  if (isCorrect) {
    if (isFirstEncounter) {
      nextRewarded.push(question.id);
      if (!nextSolved.includes(question.id)) {
        nextSolved.push(question.id);
      }
    } else if (wasDue && !nextReviewXpIds.includes(question.id)) {
      // One payout per word per day, and only for words that were actually
      // due — otherwise replaying known words would mint XP on demand.
      nextReviewXpIds.push(question.id);
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
    sessionMode === "EXAM" || sessionMode === "CHECKPOINT"
      ? { updatedQuests: previous.dailyQuests, bonusXpEarned: 0 }
      : updateDailyQuests(previous.dailyQuests, { type: questEvent, isCorrect });
  // Keep the persisted transition and the UI/session summary on the same
  // single XP calculation path.
  const xpEarned = calculatePracticeAnswerXp(previous, question, picked, xpReward, sessionMode, now);
  const nextXp = previous.xp + xpEarned;


  // The recall record is the single source of truth for both progress and
  // scheduling, so it is updated for every answer.
  const nextLearningProgress = {
    ...(previous.learningProgress || {}),
    [question.id]: recordLearningOutcome(existingItem, isCorrect, today, now, random),
  };

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
