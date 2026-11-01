import { allQuestions, validateQuestionDatabase } from "../support/bundledCatalogue";
import { assert } from "../support/assertions";

// 1. Content Database Integrity & No Duplicates
console.log("1. Content & Database Validation:");
export const validation = validateQuestionDatabase();
assert(validation.valid, "Question database is valid with 0 errors");
assert(validation.duplicateIds.length === 0, `No duplicate IDs found (total: ${allQuestions.length} questions)`);
assert(validation.invalidQuestions.length === 0, "No invalid question options found");

// Guards against the exact regression Sprint 6 fixed: auto-generated
// questions silently carrying a repeated placeholder sentence instead of
// real, per-word context.
export const templatedSentences = allQuestions.filter((q) =>
  q.exampleSentence?.includes("Learn and use the word")
);
assert(
  templatedSentences.length === 0,
  `No question ships a template example sentence (checked ${allQuestions.length})`
);

