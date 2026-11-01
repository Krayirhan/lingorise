import {
  MeaningMatchQuestion
} from "../models/content";
import { auditEditorialQuestions } from "./legacy";

export function formatItemDeliveryForm(question: MeaningMatchQuestion): string {
  const records = question.editorialReviews || [];
  const getDecision = (role: string) => records.find((r) => r.role === role)?.decision || "pending";
  const finalReview = question.editorialReview;

  return [
    `itemId: ${question.id}`,
    `level: ${question.level}`,
    `topic: ${question.topic}`,
    `word: ${question.word}`,
    `meaning: ${question.meaning}`,
    `partOfSpeech: ${question.partOfSpeech || ""}`,
    `senseId: ${question.senseId || ""}`,
    `exampleSentence: ${question.exampleSentence || ""}`,
    `exampleTranslation: ${question.exampleTranslation || ""}`,
    `phonetic: ${question.phonetic || ""}`,
    `collocation: ${question.collocation || ""}`,
    `productionPrompt: ${question.productionPrompt || ""}`,
    `wrongOptions: ${(question.wrongOptions || []).join(" | ")}`,
    `register: ${question.register || ""}`,
    `cefr: ${question.cefr || question.level}`,
    `source: ${question.source || ""}`,
    `automaticAudit: ${auditEditorialQuestions([question]).errors.length === 0 ? "pass" : "fail"}`,
    `englishUsageReview: ${getDecision("english_usage_editor") === "approved" ? "pass" : "revision_required"}`,
    `turkishTranslationReview: ${getDecision("turkish_translation_editor") === "approved" ? "pass" : "revision_required"}`,
    `cefrReview: ${getDecision("cefr_curriculum_expert") === "approved" ? "pass" : "revision_required"}`,
    `finalDecision: ${finalReview?.decision || "blocked"}`,
    `reviewId: ${finalReview?.reviewId || ""}`,
    `reviewerId: ${finalReview?.reviewerId || ""}`,
    `reviewedAt: ${finalReview?.reviewedAt || ""}`,
    `rubricVersion: ${finalReview?.rubricVersion || ""}`,
  ].join("\n");
}
