import {
  LevelCode,
  MeaningMatchQuestion
} from "../../models/content";
import { CatalogueAuditContext } from "../types";


import { FindingReporter } from "../types";
export function validateIdentity(question: MeaningMatchQuestion, flagFinding: FindingReporter, context?: CatalogueAuditContext, informational: string[] = []) {
  // 1. id
  if (!question.id || typeof question.id !== "string" || question.id.trim().length === 0) {
    flagFinding("P0", "id", "id is missing or empty");
  }

  // 2. level
  const validLevels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  if (!question.level || !validLevels.includes(question.level)) {
    flagFinding("P0", "level", "level missing or invalid LevelCode");
  }

  // 3. topic
  if (!question.topic || typeof question.topic !== "string" || question.topic.trim().length === 0) {
    flagFinding("P0", "topic", "topic missing or empty");
  }

  // 4. topicId
  if (!question.topicId || typeof question.topicId !== "string" || question.topicId.trim().length === 0) {
    flagFinding("P1", "topicId", "topicId missing for stable curriculum tracking");
  }

  // 5. unitId
  if (!question.unitId || typeof question.unitId !== "string" || question.unitId.trim().length === 0) {
    flagFinding("P1", "unitId", "unitId missing for lesson unit mapping");
  }

  // 6. lessonId
  if (!question.lessonId || typeof question.lessonId !== "string" || question.lessonId.trim().length === 0) {
    flagFinding("P1", "lessonId", "lessonId missing for lesson unit mapping");
  }

  // 7. word
  if (!question.word || typeof question.word !== "string" || question.word.trim().length === 0) {
    flagFinding("P0", "word", "word target missing or empty");
  }

  // 8. meaning
  if (!question.meaning || typeof question.meaning !== "string" || question.meaning.trim().length === 0) {
    flagFinding("P0", "meaning", "meaning translation missing or empty");
  }

}
