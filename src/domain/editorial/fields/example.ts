import {
  MeaningMatchQuestion
} from "../../models/content";
import { checkTargetInExample } from "../shared";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateExample(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, _informational: string[] = []) {
  // 16. exampleSentence
  const example = (question.exampleSentence || "").trim();
  if (!example) {
    flagFinding("P0", "exampleSentence", "exampleSentence missing or empty");
  } else {
    // Artificial numbered markers
    if (/\bin case\s+\d+\b/i.test(example) || /\breview panel\s+\d+\b/i.test(example)) {
      flagFinding("P0", "exampleSentence", "example contains artificial numbered context marker");
    }

    // Incompatible grammatical slot
    const lowerEx = example.toLowerCase();
    if (
      (/^the report uses\b/.test(lowerEx) || /^the specialist presentation addressed\b/.test(lowerEx)) &&
      question.partOfSpeech !== "noun"
    ) {
      flagFinding("P0", "exampleSentence", "example places target in an incompatible grammatical slot");
    }

    // Target word presence
    const hasTarget = checkTargetInExample(question.word, example, question.learningItemKind);
    if (!hasTarget) {
      flagFinding("P0", "exampleSentence", "example does not contain target word or valid inflected form");
    }

    // Template repetition
    if (context?.templateExampleIds?.has(question.id)) {
      flagFinding("P1", "exampleSentence", "example belongs to repeated sentence template skeleton");
    }

    // Double punctuation styling
    if (/\.\.$|\?\?|!!/.test(example)) {
      flagFinding("P3", "exampleSentence", "example sentence terminal punctuation style suggestion");
    }

    // A1 overly advanced support vocabulary check
    if (question.level === "A1") {
      const advancedSupportWords = /\b(vibrant|essential nutrients|photosynthesis|sophisticated|environmental|memorable|professional)\b/i;
      if (advancedSupportWords.test(example) || advancedSupportWords.test(question.contextNote || "")) {
        flagFinding("P2", "exampleSentence", "A1 sentence or note contains overly advanced support vocabulary");
      }
    } else if (question.level === "A2") {
      const b2AcademicWords = /\b(sophisticated|environmental)\b/i;
      const targetLower = question.word.toLowerCase();
      if (b2AcademicWords.test(example) && !targetLower.includes("environmental") && !targetLower.includes("sophisticated")) {
        flagFinding("P2", "exampleSentence", "A2 sentence contains overly advanced support vocabulary");
      }
    }
  }


}
