import { allQuestions } from "../support/bundledCatalogue";
import { DAY_MS } from "../support/learningFixtures";
import { applyPracticeAnswer } from "../../src/domain/practice/answer";
import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 20. Review XP is capped to once per word per day
console.log("\n20. Review XP Farming Guard:");
export const reviewQuestion = allQuestions[0];
export const correctAnswer = reviewQuestion.meaning || reviewQuestion.answer || "";
export const dueRecord = recordLearningOutcome(undefined, true, "2026-08-01", Date.now() - 10 * DAY_MS);

export let farmState: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 0,
  // Already earned its first-encounter XP, and its schedule has come around.
  rewardedQuestionIds: [reviewQuestion.id],
  solvedQuestionIds: [reviewQuestion.id],
  learningProgress: { [reviewQuestion.id]: { ...dueRecord, nextReviewAt: Date.now() - 1000 } },
};

farmState = applyPracticeAnswer(farmState, reviewQuestion, correctAnswer, 10);
export const xpAfterFirstReview = farmState.xp;
assert(xpAfterFirstReview === 5, "Clearing a due review pays +5 XP");

farmState = applyPracticeAnswer(farmState, reviewQuestion, "yanlış-cevap", 10);
farmState = applyPracticeAnswer(farmState, reviewQuestion, correctAnswer, 10);
assert(farmState.xp === xpAfterFirstReview, "Repeating the same word the same day pays no further XP");

// A known word that is NOT due must not pay at all
export let notDueState: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 0,
  rewardedQuestionIds: [reviewQuestion.id],
  learningProgress: { [reviewQuestion.id]: { ...dueRecord, nextReviewAt: Date.now() + 5 * DAY_MS } },
};
notDueState = applyPracticeAnswer(notDueState, reviewQuestion, correctAnswer, 10);
assert(notDueState.xp === 0, "Replaying a word that is not due pays no XP");

