import { recordLearningOutcome, mergeLearningProgress } from "../../src/domain/learning/mastery";
import { assert } from "../support/assertions";

// 26. Signing in must never erase practice one side did not see
console.log("\n26. Learning Record Merge (device + cloud):");
export const deviceOnly = recordLearningOutcome(undefined, true, "2026-08-24", 100);
export const richLocal = recordLearningOutcome(recordLearningOutcome(deviceOnly, true, "2026-08-25", 200), true, "2026-08-26", 300);
export const thinRemote = recordLearningOutcome(undefined, true, "2026-08-24", 50);

export const mergedProgress = mergeLearningProgress(
  { shared: richLocal, localOnly: deviceOnly },
  { shared: thinRemote, remoteOnly: thinRemote }
);
assert(Object.keys(mergedProgress).length === 3, "Merge keeps words seen by either side");
assert(mergedProgress.shared.attempts === richLocal.attempts, "Merge keeps the richer history for a shared word");
assert(mergedProgress.localOnly !== undefined, "Device-only practice survives the merge");
assert(mergedProgress.remoteOnly !== undefined, "Cloud-only practice survives the merge");

