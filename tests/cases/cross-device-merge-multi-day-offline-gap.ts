import { recordLearningOutcome, deriveStatus, mergeLearningProgress } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 41. A device offline for days must not lose or corrupt either side's work
console.log("\n41. Cross-Device Merge — Multi-Day Offline Gap (roadmap Birim 7.1):");
{
  // Device A goes offline for 3 days and practices 3 words nobody else saw.
  // Device B stays online for the same window and practices 3 different
  // words. Neither device knows about the other's words until A reconnects.
  const deviceAWords = ["offline-1", "offline-2", "offline-3"];
  const deviceBWords = ["online-1", "online-2", "online-3"];
  const deviceAProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  const deviceBProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};

  deviceAWords.forEach((id, i) => {
    deviceAProgress[id] = recordLearningOutcome(undefined, true, "2026-09-01", 1000 + i);
  });
  deviceBWords.forEach((id, i) => {
    deviceBProgress[id] = recordLearningOutcome(undefined, true, "2026-09-01", 2000 + i);
  });

  const reconciled = mergeLearningProgress(deviceAProgress, deviceBProgress);
  assert(Object.keys(reconciled).length === 6, "All 6 words from both the offline device and the online device survive reconciliation");
  assert(deviceAWords.every((id) => reconciled[id] !== undefined), "Every word the offline device learned is present after sync");
  assert(deviceBWords.every((id) => reconciled[id] !== undefined), "Every word the online device learned is present after sync");

  // The same word answered on both devices while A was offline: B answered
  // it correctly 3 times (mastered on day 2), A only once. The richer
  // record (more attempts) must win, carrying its OWN correct status —
  // never a hybrid of the two.
  const sharedWordOnA = recordLearningOutcome(undefined, true, "2026-09-01", 3000);
  const sharedWordOnBDay1 = recordLearningOutcome(undefined, true, "2026-09-01", 4000);
  const sharedWordOnBDay2 = recordLearningOutcome(sharedWordOnBDay1, true, "2026-09-02", 4001);
  const sharedMerge = mergeLearningProgress({ shared: sharedWordOnA }, { shared: sharedWordOnBDay2 });
  assert(sharedMerge.shared.attempts === sharedWordOnBDay2.attempts, "The device with more real practice on the shared word wins the merge");
  assert(
    deriveStatus(sharedMerge.shared) === deriveStatus(sharedWordOnBDay2),
    "The merged record's status matches its own field values — not recomputed from a mix of both devices"
  );
}

