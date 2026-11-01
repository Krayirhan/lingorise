import { getQuestionsByLevel } from "../support/bundledCatalogue";
import { toPickTheWordSession, canUsePickTheWord } from "../../src/domain/practice/reverseMode";
import { assert } from "../support/assertions";

// 35. Pick the Word — reversed session needs no new content
console.log("\n35. Pick the Word Mode:");
export const forwardSession = getQuestionsByLevel("A1").slice(0, 5);
export const reversed = toPickTheWordSession(forwardSession);

assert(reversed.length === forwardSession.length, "Reversing a session keeps every question");
assert(
  reversed.every((q, i) => q.id === forwardSession[i].id),
  "Question ids are untouched — mastery tracking stays on the same word"
);
assert(
  reversed[0].word === forwardSession[0].meaning,
  "The Turkish meaning becomes the prompt"
);
assert(
  reversed[0].meaning === forwardSession[0].word,
  "The English word becomes the correct answer"
);
assert(
  !!reversed[0].options?.includes(forwardSession[0].word || ""),
  "The correct English word is among the options"
);
assert(
  new Set(reversed[0].wrongOptions).size === reversed[0].wrongOptions.length,
  "Decoys are not duplicated"
);
assert(
  !reversed[0].wrongOptions.includes(forwardSession[0].word || ""),
  "The correct word never appears as its own decoy"
);
assert(
  reversed[0].exampleSentence === forwardSession[0].exampleSentence,
  "Example sentence content is untouched by reversal"
);

assert(canUsePickTheWord(5), "Pick the Word is available for a normal session size");
assert(!canUsePickTheWord(2), "Pick the Word is withheld when there aren't enough words for decoys");

