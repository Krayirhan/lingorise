import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { DAY_MS } from "../support/learningFixtures";
import { calculateGardenProgress } from "../../src/domain/gamification/xp";
import { recordLearningOutcome, summarizeMastery } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import { assert } from "../support/assertions";

// 36. Multi-day simulation — the flows a single device session can't observe
console.log("\n36. Multi-Day Simulation (7 days, roadmap Birim 4.2):");
{
  const words = getQuestionsByLevel("A1").slice(0, 5);
  const correctAnswerFor = (q: (typeof words)[number]) => q.meaning || q.answer || "";

  let state: UserData = { ...DEFAULT_USER_DATA, learningProgress: {} };
  const startDate = new Date("2026-01-01T09:00:00Z").getTime();

  for (let day = 0; day < 7; day += 1) {
    const dayTime = startDate + day * DAY_MS;
    const dayISO = new Date(dayTime).toISOString().slice(0, 10);

    // Every word answered correctly, once per day — this is exactly the
    // pattern that requires the "2 distinct days" mastery rule to be
    // exercised across real day boundaries, not a single test call.
    for (const word of words) {
      const before = state.learningProgress[word.id];
      const outcome = recordLearningOutcome(before, true, dayISO, dayTime);
      state = {
        ...state,
        learningProgress: { ...state.learningProgress, [word.id]: outcome },
      };
    }
  }

  const finalMastery = summarizeMastery(state.learningProgress, words.map((w) => w.id));
  assert(
    finalMastery.mastered === words.length,
    `All ${words.length} words answered correctly across 7 distinct days are mastered (got ${finalMastery.mastered})`
  );

  const gardenAfterWeek = calculateGardenProgress(finalMastery.mastered);
  assert(gardenAfterWeek.stage === "sprout", "5 mastered words is still early-stage — the garden does not overreact to a small sample");
}

