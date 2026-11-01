import { computeDifficulty, computeXpReward } from "../../src/content/questions/difficulty";
import { assert } from "../support/assertions";

// 54. Content-Generated XP/Difficulty (roadmap 18-srs-flow-hardening.md CORE-002):
console.log("\n54. Content-Generated XP/Difficulty:");
{
  assert(computeDifficulty("A1", "cat") === 1, "A short A1 word gets the level's base difficulty (1)");
  assert(computeDifficulty("C2", "cat") === 5, "A short C2 word gets the level's base difficulty (5)");
  assert(
    computeDifficulty("A1", "unbelievable") === 2,
    "A long A1 word (>=9 chars) is nudged one band above the level base (1 -> 2)"
  );
  assert(
    computeDifficulty("C1", "a piece of cake") === 5,
    "A long/multi-word C1 entry is nudged up but capped at 5, never exceeding the max band"
  );
  assert(
    computeDifficulty("A2", "go") === 2,
    "A short word never gets nudged up regardless of level"
  );

  assert(computeXpReward("A1", "cat") === 10, "A short A1 word pays the level's base XP (10)");
  assert(computeXpReward("C2", "cat") === 35, "A short C2 word pays the level's base XP (35)");
  assert(
    computeXpReward("A1", "unbelievable") === 15,
    "A long A1 word pays a +5 XP bonus over the level base (10 -> 15)"
  );
  assert(
    computeXpReward("B1", "a piece of cake") === 25,
    "A long/multi-word entry pays the level base plus the +5 long-word bonus, not a separately compounding amount"
  );
}

