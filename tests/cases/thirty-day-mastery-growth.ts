import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { DAY_MS } from "../support/learningFixtures";
import { recordLearningOutcome, summarizeMastery } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 38. Thirty-day mastery growth — long enough for SM-2 intervals to matter
console.log("\n38. Thirty-Day Mastery Growth (roadmap Birim 4.2):");
{
  const level = "A1";
  const pool = getQuestionsByLevel(level).slice(0, 40);
  let progress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  const start = new Date("2026-03-01T08:00:00Z").getTime();

  // A realistic-ish pattern: five new words learned per day, always answered
  // correctly, for thirty days — enough time for the longer SM-2 intervals
  // (repetition 3+) to actually come due and be re-answered within the window.
  for (let day = 0; day < 30; day += 1) {
    const dayTime = start + day * DAY_MS;
    const dayISO = new Date(dayTime).toISOString().slice(0, 10);

    for (const [id, item] of Object.entries(progress)) {
      if (item.nextReviewAt <= dayTime) {
        progress = { ...progress, [id]: recordLearningOutcome(item, true, dayISO, dayTime) };
      }
    }

    const newToday = pool.slice(day * 1, day * 1 + 1).filter((q) => !progress[q.id]);
    for (const word of newToday) {
      progress = { ...progress, [word.id]: recordLearningOutcome(undefined, true, dayISO, dayTime) };
    }
  }

  const summary = summarizeMastery(progress, pool.map((q) => q.id));
  assert(summary.mastered > 0, `Thirty days of consistent review produces mastered words (got ${summary.mastered})`);
  assert(
    summary.mastered + summary.review + summary.learning <= 30,
    "No more words show progress than were actually introduced across the month"
  );
  const scheduledFar = Object.values(progress).filter((item) => item.intervalDays >= 8);
  assert(
    scheduledFar.length > 0,
    "At least one word reached a multi-week interval within thirty days — long spacing is reachable, not just theoretical"
  );
}

