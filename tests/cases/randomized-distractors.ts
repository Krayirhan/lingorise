import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { randomizeDistractors } from "../../src/domain/practice/distractors";
import { assert } from "../support/assertions";

// 43. Distractors are drawn fresh per session, not fixed at content-authoring
// time (roadmap Birim 10.1)
console.log("\n43. Randomized Distractors (roadmap Birim 10.1):");
{
  const a1Pool = getQuestionsByLevel("A1");
  const target = { ...a1Pool.find((q) => q.word === "quiet")!, editorialStatus: "needs_review" as const };
  const originalDecoys = [...target.wrongOptions];

  const firstSample = randomizeDistractors(target, a1Pool);
  assert(firstSample.wrongOptions.length === originalDecoys.length, "Resampled decoys keep the same count as the authored set");
  assert(!firstSample.wrongOptions.includes(target.meaning), "The correct meaning never appears among resampled decoys");
  assert(new Set(firstSample.wrongOptions).size === firstSample.wrongOptions.length, "Resampled decoys are never duplicated within one question");

  const seenDecoySets = new Set<string>();
  for (let i = 0; i < 20; i += 1) {
    const resampled = randomizeDistractors(target, a1Pool);
    seenDecoySets.add(resampled.wrongOptions.slice().sort().join("|"));
  }
  assert(
    seenDecoySets.size > 1,
    `Across 20 resamples, the decoy set actually varies (saw ${seenDecoySets.size} distinct combinations) — content is no longer deterministic`
  );

  // PICK_THE_WORD questions already get fresh decoys from reverseMode.ts —
  // randomizeDistractors must leave them alone rather than double-processing.
  const reversedTarget = { ...target, mode: "PICK_THE_WORD" as const };
  const untouched = randomizeDistractors(reversedTarget, a1Pool);
  assert(
    untouched.wrongOptions.join("|") === reversedTarget.wrongOptions.join("|"),
    "PICK_THE_WORD questions are left untouched — their decoys already come from reverseMode.ts"
  );

  // A too-small candidate pool must never crash or return fewer decoys than authored.
  const tinyPool = [target];
  const fallback = randomizeDistractors(target, tinyPool);
  assert(
    fallback.wrongOptions.length === originalDecoys.length,
    "When the pool is too small to safely resample, the authored decoys are kept rather than shrinking the option count"
  );
}

