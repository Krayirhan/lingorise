import { buildProgressAnalytics } from "../../src/features/progress/progressAnalyticsModel";
import { assert } from "../support/assertions";

assert(
  JSON.stringify(buildProgressAnalytics([])) === JSON.stringify({ answered: 0, correct: 0, accuracy: 0 }),
  "Progress analytics show zero accuracy before any answers"
);
assert(
  JSON.stringify(buildProgressAnalytics([
    { date: "2026-10-04", answers: 4, correct: 3, xp: 30 },
    { date: "2026-10-05", answers: 6, correct: 5, xp: 50 },
  ])) === JSON.stringify({ answered: 10, correct: 8, accuracy: 80 }),
  "Progress analytics aggregate practice history and round total accuracy"
);
