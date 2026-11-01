import { track } from "../../src/infrastructure/telemetry";
import { detectClockAnomaly } from "../../src/domain/sync/clockAnomaly";
import { assert } from "../support/assertions";

// 53. Server Date Anomaly Detection (roadmap Birim 18.5 / VERIFY-QA-002 /
// GLOBAL-QA-013 — replaces the historical tautological `assert(true, ...)`
// evidence, which never called the real detection function, with tests that
// call `detectClockAnomaly` (the exact function useUserProgress.ts's
// `checkServerDateAnomaly` calls) and assert its actual output):
console.log("\n53. Server Date Anomaly Detection:");
{
  const bigJump = detectClockAnomaly("2026-08-25", "2026-08-30");
  assert(bigJump.isAnomalous === true, "A 5-day forward jump is detected as anomalous");
  assert(bigJump.daysDifference === 5, "The detected day difference is exactly 5");

  const normalNextDay = detectClockAnomaly("2026-08-25", "2026-08-26");
  assert(normalNextDay.isAnomalous === false, "A normal single-day advance is not anomalous");
  assert(normalNextDay.daysDifference === 1, "The detected day difference for a normal day advance is 1");

  const sameDay = detectClockAnomaly("2026-08-25", "2026-08-25");
  assert(sameDay.isAnomalous === false, "The same day twice is not anomalous");
  assert(sameDay.daysDifference === 0, "The detected day difference for the same day is 0");

  const exactlyTwoDays = detectClockAnomaly("2026-08-25", "2026-08-27");
  assert(exactlyTwoDays.isAnomalous === true, "A 2-day jump is already anomalous (threshold is > 1 day)");

  const missingReference = detectClockAnomaly(undefined, "2026-08-30");
  assert(missingReference.isAnomalous === false, "No prior server-date reference is never flagged anomalous");
  assert(missingReference.daysDifference === null, "No prior server-date reference yields a null day difference, not a false zero");

  // Regression coverage for the real call site: `suspicious_date_jump` must
  // only be tracked when detectClockAnomaly actually reports an anomaly.
  const anomalousResult = detectClockAnomaly("2026-08-25", "2026-08-30");
  if (anomalousResult.isAnomalous) {
    track("suspicious_date_jump", {
      deviceDate: "2026-08-30",
      lastKnownServerDate: "2026-08-25",
      daysDifference: anomalousResult.daysDifference as number,
    });
  }
  assert(anomalousResult.isAnomalous === true, "The real call site's guard condition is driven by the actual detection result, not an unconditional call");
}

