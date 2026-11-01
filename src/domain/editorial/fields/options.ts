import {
  MeaningMatchQuestion
} from "../../models/content";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateOptions(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, _informational: string[] = []) {
  // 9. wrongOptions
  if (!Array.isArray(question.wrongOptions) || question.wrongOptions.length !== 2) {
    flagFinding("P0", "wrongOptions", "wrongOptions count must be exactly 2 distractors");
  } else {
    const d0 = (question.wrongOptions[0] || "").trim();
    const d1 = (question.wrongOptions[1] || "").trim();
    const meaning = (question.meaning || "").trim();

    if (!d0 || !d1) {
      flagFinding("P0", "wrongOptions", "wrongOptions elements must be non-empty");
    } else if (d0 === d1) {
      flagFinding("P0", "wrongOptions", "wrongOptions contains duplicate distractors");
    } else if (d0 === meaning || d1 === meaning) {
      flagFinding("P0", "wrongOptions", "wrongOptions cannot equal correct meaning");
    }

    // Check POS suitability of distractors
    if (question.partOfSpeech === "verb") {
      const isTurkishVerb = (str: string) => /mak$|mek$|etmek$|yapmak$/i.test(str.trim());
      if ((d0.endsWith("ce") || d0.endsWith("ca") || d0.includes("şekilde")) && !isTurkishVerb(d0)) {
        flagFinding("P1", "wrongOptions", "distractor part of speech mismatch: adverb/adjective supplied for verb target");
      }
    }

    // Overused distractor pair
    const pairSignature = [d0.toLocaleLowerCase("tr"), d1.toLocaleLowerCase("tr")].sort().join("|");
    if (context?.overusedDistractorPairs?.has(pairSignature)) {
      flagFinding("P1", "wrongOptions", `repeated distractor pair '${pairSignature}' overused in catalogue`);
    }
  }

  // 10. options
  if (question.options) {
    if (!Array.isArray(question.options) || question.options.length !== 3) {
      flagFinding("P0", "options", "options must have exactly 3 options");
    } else if (new Set(question.options).size !== 3) {
      flagFinding("P0", "options", "options contains duplicate entries");
    } else if (!question.options.includes(question.meaning)) {
      flagFinding("P0", "options", "options must include correct meaning");
    }
  }

}
