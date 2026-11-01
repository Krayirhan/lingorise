import {
  EditorialReviewRole, MeaningMatchQuestion
} from "../models/content";
import { auditEditorialQuestions } from "./legacy";
import { ItemDoDValidationResult } from "./types";

export function validateItemDefinitionOfDone(question: MeaningMatchQuestion): ItemDoDValidationResult {
  const failures: string[] = [];

  // 1. Example sentence & translation
  if (!question.exampleSentence || question.exampleSentence.trim().length === 0) {
    failures.push("exampleSentence is missing or empty");
  }
  if (!question.exampleTranslation || question.exampleTranslation.trim().length === 0) {
    failures.push("exampleTranslation is missing or empty");
  }

  // 2. IPA phonetic
  if (!question.phonetic || !/^\/?[a-zA-Z0-9ˈˌːæɑɔəɛɪʊʌθðʃʒŋʔ:. -]+\/?$/.test(question.phonetic.trim())) {
    failures.push("phonetic is missing or not a valid IPA transcription");
  }

  // 3. Unique senseId
  if (!question.senseId || question.senseId.trim().length === 0) {
    failures.push("senseId is missing");
  }

  // 4. Collocation
  if (!question.collocation || question.collocation.trim().length === 0) {
    failures.push("collocation is missing");
  } else {
    const collowNorm = question.collocation.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const exampleNorm = (question.exampleSentence || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const promptNorm = (question.productionPrompt || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ");
    const colWords = collowNorm.split(/\s+/).filter(Boolean);
    const appearsInExample = colWords.every((w) => exampleNorm.includes(w));
    const appearsInPrompt = colWords.every((w) => promptNorm.includes(w));
    if (!appearsInExample && !appearsInPrompt) {
      failures.push("collocation does not appear in example sentence or production prompt");
    }
  }

  // 5. Production prompt enforces target
  if (!question.productionPrompt || question.productionPrompt.trim().length === 0) {
    failures.push("productionPrompt is missing");
  } else {
    const promptLower = question.productionPrompt.toLowerCase();
    const targetLower = question.word.toLowerCase();
    const hasTargetMention =
      promptLower.includes(targetLower) ||
      promptLower.includes(`"${targetLower}"`) ||
      promptLower.includes(`'${targetLower}'`);
    if (!hasTargetMention) {
      failures.push("productionPrompt does not enforce the target word/phrase");
    }
  }

  // 6. Exactly 2 distractors with different values
  if (!question.wrongOptions || question.wrongOptions.length !== 2) {
    failures.push("exactly 2 distractors required");
  } else if (new Set(question.wrongOptions).size !== 2 || question.wrongOptions.includes(question.meaning)) {
    failures.push("distractors must be distinct and cannot equal the correct meaning");
  }

  // 7. Automated audit errors must be 0
  const audit = auditEditorialQuestions([question]);
  if (audit.errors.length > 0) {
    failures.push(...audit.errors);
  }

  // 8. Editorial review evidence
  const records = question.editorialReviews || [];
  const approvedRoles = records
    .filter((r) => r.decision === "approved" && r.reviewerId && r.reviewedAt)
    .map((r) => r.role);
  const requiredRoles: EditorialReviewRole[] = ["english_usage_editor", "turkish_translation_editor", "cefr_curriculum_expert", "final_decider"];
  const missingRoles = requiredRoles.filter((role) => !approvedRoles.includes(role));
  if (missingRoles.length > 0) {
    failures.push(`missing human reviewer approvals for: ${missingRoles.join(", ")}`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
