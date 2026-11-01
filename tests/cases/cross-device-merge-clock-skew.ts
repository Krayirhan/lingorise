import { DAY_MS } from "../support/learningFixtures";
import { recordLearningOutcome, mergeLearningProgress } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 40. Merge conflict resolution survives device clock skew (roadmap Birim 7.1-7.2)
console.log("\n40. Cross-Device Merge — Clock Skew (roadmap Birim 7.1-7.2):");
{
  // Equal attempts, but the local device's clock is skewed two hours into
  // the future — lastAnsweredAt alone would wrongly pick the local record
  // even though the remote one is genuinely the more recent answer. Once
  // both sides carry a Firestore serverSyncedAt, that (not the device
  // clock) must win the tie-break.
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const now = 1_800_000_000_000;
  const localSkewed = recordLearningOutcome(undefined, true, "2026-08-24", now + twoHoursMs);
  const remoteReal = recordLearningOutcome(undefined, true, "2026-08-24", now);
  assert(localSkewed.attempts === remoteReal.attempts, "Both records have the same attempt count — this is a true tie-break case");

  const localWithOldServerStamp = { ...localSkewed, serverSyncedAt: now - DAY_MS };
  const remoteWithNewServerStamp = { ...remoteReal, serverSyncedAt: now };
  const resolved = mergeLearningProgress({ w: localWithOldServerStamp }, { w: remoteWithNewServerStamp });
  assert(
    resolved.w.serverSyncedAt === remoteWithNewServerStamp.serverSyncedAt,
    "When both sides have synced before, the server-stamped record wins even though the device clock disagrees"
  );

  // Neither side has ever synced (serverSyncedAt undefined on both) — falls
  // back to the pre-existing device-clock comparison, unchanged from before.
  const neitherSynced = mergeLearningProgress({ w: localSkewed }, { w: remoteReal });
  assert(
    neitherSynced.w.lastAnsweredAt === localSkewed.lastAnsweredAt,
    "Before either side has ever synced, the device clock is still the only signal available — same as pre-Sprint-8 behavior"
  );

  // The whole record is taken atomically — the winning record's own
  // nextReviewAt/easeFactor/repetitions can never end up mismatched.
  assert(
    resolved.w.nextReviewAt === remoteWithNewServerStamp.nextReviewAt &&
      resolved.w.easeFactor === remoteWithNewServerStamp.easeFactor,
    "The winning record's schedule fields all come from the same record — never spliced from the loser"
  );
}

