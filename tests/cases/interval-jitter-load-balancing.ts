import { applyIntervalJitter, nextIntervalDays } from "../../src/domain/review/spacedRepetition";
import { assert } from "../support/assertions";

// 49. Interval Jitter & Load Balancing (roadmap Birim 18.1):
console.log("\n49. Interval Jitter & Load Balancing (roadmap Birim 18.1):");
{
  // 1 and 3-day fixed steps are never jittered
  assert(applyIntervalJitter(1, () => 1.0) === 1, "Interval 1 day is untouched by jitter");
  assert(applyIntervalJitter(2, () => 1.0) === 2, "Interval 2 days is untouched by jitter");
  assert(applyIntervalJitter(3, () => 1.0) === 3, "Interval 3 days is untouched by jitter");
  assert(applyIntervalJitter(3, () => 0.0) === 3, "Interval 3 days is untouched even with min random");

  // Deterministic random injection test: days = 100, ratio = 0.05 -> range = 5
  // random = 0 -> offset = -5 -> 95
  assert(applyIntervalJitter(100, () => 0) === 95, "applyIntervalJitter min boundary (-5% at 100 days)");
  // random = 0.9999 -> offset = +5 -> 105
  assert(applyIntervalJitter(100, () => 0.9999) === 105, "applyIntervalJitter max boundary (+5% at 100 days)");
  // random = 0.5 -> offset = 0 -> 100
  assert(applyIntervalJitter(100, () => 0.5) === 100, "applyIntervalJitter midpoint (0% offset at 100 days)");

  // Minimum floor test: jittered value never falls below JITTER_MIN_DAYS (4)
  assert(applyIntervalJitter(4, () => 0) >= 4, "applyIntervalJitter never falls below JITTER_MIN_DAYS (4)");

  // nextIntervalDays behavior with repetition steps
  assert(nextIntervalDays(1, 0, 2.5) === 1, "nextIntervalDays for repetition 1 remains exactly 1 day");
  assert(nextIntervalDays(2, 1, 2.5) === 3, "nextIntervalDays for repetition 2 remains exactly 3 days");

  // Multi-item load balancing simulation: 20 words scheduled on the same day
  const simulatedIntervals = new Set<number>();
  for (let i = 0; i < 20; i++) {
    // repetitions = 3, previousInterval = 8, easeFactor = 2.5 -> grown = 20
    const interval = nextIntervalDays(3, 8, 2.5);
    simulatedIntervals.add(interval);
  }
  // ±5% of 20 is ±1 (19, 20, 21) -> at least 2 distinct values out of 20 samples (~30% variation)
  assert(
    simulatedIntervals.size >= 2,
    `20 simulated words scheduled on the same day distribute across multiple days (${simulatedIntervals.size} distinct intervals)`
  );
}

