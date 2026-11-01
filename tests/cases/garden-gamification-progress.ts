import { CONTENT_UNIT_SIZE } from "../support/bundledCatalogue";
import { calculateGardenProgress } from "../../src/domain/gamification/xp";
import { assert } from "../support/assertions";

// 3. Garden Gamification & Growth Stages
console.log("\n3. Garden & Gamification Progress:");
export const g1 = calculateGardenProgress(10);
assert(g1.stage === "sprout", "10 mastered words is the 'sprout' stage");
// Stage bands are exact multiples of CONTENT_UNIT_SIZE (30) so the garden's
// stage boundaries line up with a level's own unit boundaries (roadmap
// 18-srs-flow-hardening.md — "Bölümde X/30" and the garden card no longer
// use unrelated denominators). Sprout spans 0-30, so 10/30 ≈ 33%.
assert(g1.stageProgressPercent === 33, "Stage progress is the real share, with no artificial floor");

export const gZero = calculateGardenProgress(0);
assert(gZero.stageProgressPercent === 0, "A brand-new garden honestly shows 0%");

export const g2 = calculateGardenProgress(40);
assert(g2.stage === "leaf", "40 mastered words is the 'leaf' stage");

export const g3 = calculateGardenProgress(100);
assert(g3.stage === "bud", "100 mastered words is the 'bud' stage");

export const g4 = calculateGardenProgress(200);
assert(g4.stage === "flower", "200 mastered words is the 'flower' stage");

export const g5 = calculateGardenProgress(300);
assert(g5.stage === "bloom_tree", "300 mastered words is the 'bloom_tree' stage");

// The garden must not finish before the content does
export const dedicated = calculateGardenProgress(900);
assert(dedicated.stage === "bloom_tree", "A very advanced learner stays in the mature stage");
assert(dedicated.stageProgressPercent < 100, "The mature tree keeps a target ahead of it");
assert(
  dedicated.nextStageThresholdWords > 900,
  "The next threshold always sits above the current count, so the garden never finishes"
);

// XP no longer drives the garden at all
export const heavyXpNoWords = calculateGardenProgress(0);
assert(heavyXpNoWords.stage === "sprout", "XP alone cannot grow the garden — only recalled words do");

