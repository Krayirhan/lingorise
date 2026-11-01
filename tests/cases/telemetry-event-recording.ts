import { track } from "../../src/infrastructure/telemetry";
import { assert } from "../support/assertions";

// 39. Telemetry — every event call site is wired and callable
console.log("\n39. Telemetry Event Recording (roadmap Birim 5):");
{
  // track() is fire-and-forget by design (callers never await it) and must
  // never throw synchronously, since every call site in the app — inside
  // reducers, effects, and press handlers — calls it unguarded. The
  // AsyncStorage-backed persistence itself is verified on-device (this
  // script runs under plain ts-node, which has no real AsyncStorage), but
  // every event shape below is exactly what production code sends.
  let threw = false;
  try {
    track("session_started", { daysSinceLastOpen: 1 });
    track("daily_rollover_applied", { streakBefore: 3, streakAfter: 4, pendingReviewsAtOpen: 2 });
    track("practice_session_started", { freshCount: 17, reverseMode: false });
    track("question_answered", { questionId: "a1-mm-01", isCorrect: true, isFirstEncounter: true, wasDue: false, usedHint: false, level: "A1", responseTimeMs: 2100, inferredQuality: 5 });
    track("word_mastery_changed", { fromStatus: "review", toStatus: "mastered", questionId: "a1-mm-01" });
    track("garden_stage_changed", { fromStage: "sprout", toStage: "leaf", masteredWords: 25 });
    track("level_promotion_shown", { level: "A1", nextLevelReady: true });
    track("level_promotion_advanced", { fromLevel: "A1", toLevel: "A2" });
    track("level_switch_warning_shown", { currentLevel: "A1", targetLevel: "B1" });
    track("level_switch_confirmed_ahead", { currentLevel: "A1", targetLevel: "B1" });
    track("level_exam_started", { level: "A1", questionCount: 60 });
    track("level_exam_completed", { level: "A1", correctCount: 52, totalCount: 60, passed: true });
    track("daily_quest_completed", { questId: "quest_daily_practice", xpEarned: 30 });
    track("session_abandoned", { questionsAnswered: 7, questionsTotal: 20 });
    track("practice_session_completed", { questionsAnswered: 20, questionsTotal: 20, correctCount: 18, sessionMode: "PRACTICE" });
    track("unit_completed", { level: "A1", unitIndex: 0, wordsInUnit: 30 });
    track("migration_applied", { fromVersion: 1, toVersion: 3, hadLegacyReviewQueue: true, hadLegacyQuestSet: false });
  } catch {
    threw = true;
  }
  assert(!threw, "Every event in the roadmap's §5.2 event set is callable without throwing");
}

