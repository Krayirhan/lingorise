import { recordLearningOutcome, isLeech, LEECH_THRESHOLD } from "../../src/domain/learning/mastery";
import { track } from "../../src/infrastructure/telemetry";
import { assert } from "../support/assertions";

// 50. Chronic Error (Leech) Detection (roadmap Birim 18.2):
console.log("\n50. Chronic Error (Leech) Detection (roadmap Birim 18.2):");
{
  assert(LEECH_THRESHOLD === 8, "LEECH_THRESHOLD is defined as 8 consecutive wrong answers");

  let item = recordLearningOutcome(undefined, false, "2026-08-25", 1000);
  assert(item.consecutiveWrongCount === 1, "First wrong answer sets consecutiveWrongCount to 1");
  assert(!isLeech(item), "Item with 1 wrong answer is not a leech");

  // Up to 7 consecutive wrong answers
  for (let i = 2; i <= 7; i++) {
    item = recordLearningOutcome(item, false, "2026-08-25", 1000 + i * 1000);
    assert(item.consecutiveWrongCount === i, `Consecutive wrong count is ${i}`);
    assert(!isLeech(item), `Item with ${i} consecutive wrong answers is not yet a leech`);
  }

  // 8th consecutive wrong answer reaches threshold
  item = recordLearningOutcome(item, false, "2026-08-25", 9000);
  assert(item.consecutiveWrongCount === 8, "8th wrong answer reaches consecutiveWrongCount 8");
  assert(isLeech(item), "Item with 8 consecutive wrong answers is marked as leech");

  // 9th consecutive wrong answer stays a leech
  item = recordLearningOutcome(item, false, "2026-08-25", 10000);
  assert(item.consecutiveWrongCount === 9, "9th wrong answer increments consecutiveWrongCount to 9");
  assert(isLeech(item), "Item with 9 consecutive wrong answers remains a leech");

  // A single correct answer resets the streak
  item = recordLearningOutcome(item, true, "2026-08-26", 20000);
  assert(item.consecutiveWrongCount === 0, "Correct answer resets consecutiveWrongCount to 0");
  assert(!isLeech(item), "Item is no longer a leech after a correct answer");

  // Telemetry event call test
  track("word_marked_leech", { questionId: "a1-mm-test", consecutiveWrongCount: 8 });
  assert(true, "word_marked_leech telemetry event is callable without errors");
}

