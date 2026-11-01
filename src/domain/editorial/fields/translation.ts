import {
  MeaningMatchQuestion
} from "../../models/content";
import { GENERIC_CONTEXT } from "../shared";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateTranslation(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, informational: string[] = []) {
  // 17. exampleTranslation
  const translation = (question.exampleTranslation || "").trim();
  if (!translation) {
    flagFinding("P0", "exampleTranslation", "exampleTranslation missing or empty");
  } else {
    if (GENERIC_CONTEXT.some((regex) => regex.test(translation))) {
      flagFinding("P0", "exampleTranslation", "generic, artificial, or missing Turkish example translation");
    }
    if (/\bin case\s+\d+\b/i.test(translation) || /\bilgili inceleme dosyası/i.test(translation) || /\bvaka\s+\d+\b/i.test(translation)) {
      flagFinding("P0", "exampleTranslation", "artificial numbered context in Turkish translation");
    }
    if (context?.templateTranslationIds?.has(question.id)) {
      flagFinding("P1", "exampleTranslation", "translation belongs to repeated translation template skeleton");
    }
    // Minor Turkish capitalization style check
    if (/^[a-zçğıöşü]/.test(translation)) {
      flagFinding("P3", "exampleTranslation", "example translation initial letter casing suggestion");
    }
  }

}
