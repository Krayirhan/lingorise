import { pickNewWords } from "../support/learningFixtures";
import { assert } from "../support/assertions";

// 51. Difficulty-Based New Word Ordering (roadmap Birim 18.3):
console.log("\n51. Difficulty-Based New Word Ordering (roadmap Birim 18.3):");
{
  const testPool: any[] = [
    { id: "q-d3-1", word: "complex", difficulty: 3, level: "A1" },
    { id: "q-d1-1", word: "cat", difficulty: 1, level: "A1" },
    { id: "q-d2-1", word: "water", difficulty: 2, level: "A1" },
    { id: "q-d1-2", word: "dog", difficulty: 1, level: "A1" },
    { id: "q-d3-2", word: "difficult", difficulty: 3, level: "A1" },
    { id: "q-d2-2", word: "bread", difficulty: 2, level: "A1" },
    { id: "q-d1-3", word: "sun", difficulty: 1, level: "A1" },
  ];

  const picked = pickNewWords(testPool, 7);
  assert(picked.length === 7, "pickNewWords returns requested count of words");

  // All difficulty 1 words must precede difficulty 2 words, which must precede difficulty 3 words
  const diffs = picked.map((q) => q.difficulty || 1);
  let isMonotonic = true;
  for (let i = 1; i < diffs.length; i++) {
    if (diffs[i] < diffs[i - 1]) {
      isMonotonic = false;
      break;
    }
  }
  assert(isMonotonic, `New words arrive in ascending difficulty order (${diffs.join(", ")})`);

  // Group-internal variation check: multiple calls shuffle words within the same difficulty bucket
  const bucketPool: any[] = [
    { id: "b-1", word: "one", difficulty: 2, level: "A1" },
    { id: "b-2", word: "two", difficulty: 2, level: "A1" },
    { id: "b-3", word: "three", difficulty: 2, level: "A1" },
    { id: "b-4", word: "four", difficulty: 2, level: "A1" },
    { id: "b-5", word: "five", difficulty: 2, level: "A1" },
  ];
  const orderings = new Set<string>();
  for (let trial = 0; trial < 15; trial++) {
    const res = pickNewWords(bucketPool, 5);
    orderings.add(res.map((q) => q.id).join("-"));
  }
  assert(
    orderings.size > 1,
    `Words in the same difficulty group vary in order across runs (${orderings.size} permutations seen) to prevent rote memorization`
  );
}

