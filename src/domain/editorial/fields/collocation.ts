import {
  MeaningMatchQuestion
} from "../../models/content";
import { IRREGULAR_EXAMPLE_FORMS, KNOWN_FAULTY_COLLOCATIONS, TRAILING_FUNCTION_WORDS } from "../shared";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateCollocation(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, informational: string[] = []) {
  // 19. collocation
  const collocation = (question.collocation || "").trim();
  if (question.level === "C2" && !collocation) {
    flagFinding("P0", "collocation", "C2 items strictly require collocation");
  } else if (!collocation) {
    flagFinding("P1", "collocation", "collocation missing");
  } else {
    const colWords = collocation.split(/\s+/).filter(Boolean);

    // Minimum words
    if (colWords.length < 2) {
      flagFinding("P1", "collocation", "collocation must consist of at least two meaningful words");
    }

    // Trailing function words / conjunctions
    if (TRAILING_FUNCTION_WORDS.test(collocation)) {
      flagFinding("P1", "collocation", "collocation ends with conjunction/function word (e.g. and, is, I, the, last)");
    }

    // Known faulty collocations
    if (KNOWN_FAULTY_COLLOCATIONS.some((r) => r.test(collocation))) {
      flagFinding("P1", "collocation", "unnatural or faulty collocation pattern (e.g. today morning, fresh water and, etc.)");
    }

    // Target inclusion
    const colLower = collocation.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const colHasTarget =
      colLower.includes(targetLower) ||
      (IRREGULAR_EXAMPLE_FORMS[targetLower] || []).some((f) => colLower.includes(f)) ||
      (question.learningItemKind === "phrase" && colWords.some((cw) => targetLower.includes(cw)));

    if (!colHasTarget) {
      flagFinding("P1", "collocation", "collocation does not contain target word or valid inflected form");
    }

    // Check appearance in example or productionPrompt
    const exampleLower = (question.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptLower = (question.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const colCleanWords = collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);

    const inExample = colCleanWords.every((w) => exampleLower.includes(w));
    const inPrompt = colCleanWords.every((w) => promptLower.includes(w));

    if (!inExample && !inPrompt) {
      if (question.level === "C2") {
        flagFinding("P1", "collocation", "C2 collocation does not appear in example sentence or production prompt");
      } else {
        flagFinding("P2", "collocation", "collocation not directly illustrated in example or prompt");
      }
    }

    if (context?.overusedCollocations?.has(colLower)) {
      flagFinding("P2", "collocation", `collocation '${collocation}' repeated across 5 or more items in catalogue`);
    }

    // Collocation casing recommendation
    if (/[A-Z]/.test(collocation) && !collocation.includes("I") && !/^[A-Z][a-z]+ [A-Z]/.test(collocation) === false) {
      flagFinding("P3", "collocation", "collocation lowercase formatting recommendation");
    }
  }

}
