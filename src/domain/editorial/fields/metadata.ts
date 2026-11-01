import {
  LanguageRegister,
  LearningItemKind,
  LevelCode,
  MeaningMatchQuestion,
  PartOfSpeech
} from "../../models/content";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateMetadata(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, _informational: string[] = []) {
  const validLevels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  // 11. partOfSpeech
  const validPos: PartOfSpeech[] = ["noun", "verb", "adjective", "adverb", "phrase"];
  if (!question.partOfSpeech || !validPos.includes(question.partOfSpeech)) {
    flagFinding("P0", "partOfSpeech", "partOfSpeech missing or invalid");
  }

  // 12. learningItemKind
  const validKinds: LearningItemKind[] = ["word", "phrase", "collocation", "grammar_pattern"];
  if (!question.learningItemKind || !validKinds.includes(question.learningItemKind)) {
    flagFinding("P0", "learningItemKind", "learningItemKind missing or invalid");
  }

  // 13. cefr
  if (!question.cefr || !validLevels.includes(question.cefr)) {
    flagFinding("P0", "cefr", "cefr level missing");
  } else if (question.cefr !== question.level) {
    flagFinding("P0", "cefr", `CEFR level mismatched with item level (${question.cefr} !== ${question.level})`);
  }

  // 14. senseId
  if (!question.senseId || typeof question.senseId !== "string" || question.senseId.trim().length === 0) {
    flagFinding("P0", "senseId", "senseId missing");
  } else if (context?.duplicateSenseIds?.has(question.senseId)) {
    flagFinding("P1", "senseId", `duplicate senseId '${question.senseId}' repeated across items`);
  }

  // 15. register
  const validRegisters: LanguageRegister[] = [
    "neutral", "informal", "formal", "academic", "professional", "literary", "technical"
  ];
  if (!question.register || !validRegisters.includes(question.register)) {
    flagFinding("P0", "register", "register missing or invalid");
  } else {
    // Advanced levels require formal/academic/professional register
    if (question.level === "C2" && question.register === "informal") {
      flagFinding("P1", "register", "C2 item register should be formal, academic, or professional");
    } else if (question.level === "B2" && question.topicId?.includes("fiscal") && question.register === "neutral") {
      flagFinding("P2", "register", "register should be academic or professional for B2 upper-intermediate topic");
    }
  }

}
