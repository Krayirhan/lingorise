import { findQuestionByWord, searchQuestions, CONTENT_VERSION } from "../support/bundledCatalogue";
import { assert } from "../support/assertions";

// 9. Vocabulary Content System & Search
console.log("\n9. Vocabulary Content Search & Versioning:");
export const matchQuiet = findQuestionByWord("quiet");
assert(matchQuiet !== undefined && matchQuiet.id === "a1-mm-01", "Found word 'quiet' successfully via findQuestionByWord");
export const searchResults = searchQuestions("sessiz");
assert(searchResults.length > 0, "searchQuestions returned results for Turkish meaning 'sessiz'");
assert(CONTENT_VERSION === "2.3.0", `Content version verified as ${CONTENT_VERSION}`);

