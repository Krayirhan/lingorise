import { bringForward, RELEARN_DELAY_MS } from "../../src/domain/review/spacedRepetition";
import { DAY_MS } from "../support/learningFixtures";
import { archiveDailyQuests, DAILY_QUEST_PRACTICE_ID, DAILY_QUEST_REVIEW_ID } from "../../src/domain/gamification/badges";
import { assert } from "../support/assertions";

// 55. Daily Quest Archiving & Manual Reschedule (roadmap 18-srs-flow-hardening.md CORE-003):
console.log("\n55. Daily Quest Archiving & Manual Reschedule:");
{
  const quests = [
    { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 20, target: 20, xpReward: 30, completed: true },
    { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 0, target: 1, xpReward: 20, completed: false },
  ];
  const archived = archiveDailyQuests(quests, "2026-08-24");
  assert(archived.length === 1, "archiveDailyQuests only archives quests that were actually completed");
  assert(archived[0].questId === DAILY_QUEST_PRACTICE_ID, "The archived entry references the completed quest's id");
  assert(archived[0].date === "2026-08-24", "The archived entry is stamped with the closing date, not today's date");

  const noneCompleted = [
    { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 5, target: 20, xpReward: 30, completed: false },
  ];
  assert(
    archiveDailyQuests(noneCompleted, "2026-08-24").length === 0,
    "archiveDailyQuests archives nothing when no quest was completed"
  );

  const now = 1_000_000_000_000;
  const farOutItem = {
    status: "learning" as const,
    attempts: 3,
    correctCount: 1,
    wrongCount: 2,
    consecutiveWrongCount: 2,
    repetitions: 1,
    distinctCorrectDays: 1,
    intervalDays: 30,
    easeFactor: 2.5,
    nextReviewAt: now + 30 * DAY_MS,
  };
  const broughtForward = bringForward(farOutItem, now);
  assert(
    broughtForward.nextReviewAt === now + RELEARN_DELAY_MS,
    "bringForward pulls a far-future review in to the standard relearn delay"
  );

  const alreadySoonItem = { ...farOutItem, nextReviewAt: now + 5 * 60 * 1000 };
  const stillSoon = bringForward(alreadySoonItem, now);
  assert(
    stillSoon.nextReviewAt === alreadySoonItem.nextReviewAt,
    "bringForward never pushes a review LATER — an already-soon item is left untouched"
  );
}

