import { inferQuality } from "../../src/domain/review/qualitySignal";
import { assert } from "../support/assertions";

// 46. Indirect quality signal (roadmap Birim 3 §3.1) — observational only,
// not yet driving scheduleNextReview (that's §3.2, deferred to S12).
console.log("\n46. Indirect Quality Signal (roadmap Birim 3 §3.1):");
{
  assert(inferQuality(2000, false, false) === 0, "A wrong answer with no hint scores the lowest quality (0)");
  assert(inferQuality(2000, true, false) === 1, "A wrong answer that still used a hint scores slightly higher (1) — the hint shows some engagement");
  assert(inferQuality(2000, false, true) === 5, "A fast, clean, correct first try scores the maximum (5)");
  assert(inferQuality(5000, false, true) === 4, "A correct first try that took longer scores lower than an instant one (4)");
  assert(inferQuality(15000, false, true) === 3, "A correct but slow answer scores lower still (3)");
  assert(inferQuality(1000, true, true) === 3, "A correct answer that needed a hint is capped at 3 even if it was fast — it wasn't a clean recall");
  assert(inferQuality(1000, false, true, 2) === 3, "A correct answer on a retry (attemptNumber > 1) is capped at 3 even without a hint — same reasoning");
  assert(
    inferQuality(500, false, true) >= inferQuality(500, false, true, 2),
    "A clean first-try answer never scores lower than the same answer after a prior wrong attempt"
  );
}

