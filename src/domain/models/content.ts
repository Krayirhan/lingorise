export type LevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Level = {
  code: LevelCode;
  title: string;
  hint: string;
};

export type GameMode = "MEANING_MATCH" | "PICK_THE_WORD" | "QUICK_REVIEW";

export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "phrase";
export type EditorialStatus = "approved" | "needs_review" | "rejected";
/**
 * Immutable evidence for an editorial decision.  A display name and date are
 * not enough to establish that a human reviewed a learner-facing item.
 */
export interface EditorialReviewEvidence {
  /** Stable ID in the editorial system, ticket tracker, or review archive. */
  reviewId: string;
  /** Identifies the accountable human reviewer, not a generic team label. */
  reviewerId: string;
  reviewedAt: string;
  rubricVersion: string;
  decision: "approved";
}
export type EditorialReviewRole = "english_usage_editor" | "turkish_translation_editor" | "cefr_curriculum_expert" | "final_decider";
export type EditorialReviewDecision = "pending" | "approved" | "revision_required" | "rejected";
export type ReviewQueueState = "queued" | "in_review" | "revision_required" | "approved" | "blocked";

export interface EditorialRubricEvaluation {
  englishNaturalness: boolean;
  turkishMeaningFidelity: boolean;
  posSyntaxAccuracy: boolean;
  ipaAccuracy: boolean;
  senseAccuracy: boolean;
  cefrCompliance: boolean;
  registerAppropriateness: boolean;
  collocationValidity: boolean;
  distractorsQuality: boolean;
  exampleSentenceQuality: boolean;
  productionPromptCompliance: boolean;
  reviewerNotes: string;
}

export type EditorialReviewerPermission = "review.read" | "review.write" | "review.final_decide";

export interface EditorialReviewerProfile {
  uid: string;
  role: "EDITORIAL_REVIEWER";
  active: boolean;
  reviewerRoles: EditorialReviewRole[];
  permissions: EditorialReviewerPermission[];
  assignedLevels: LevelCode[];
}

export interface EditorialReviewRecord {
  reviewId: string;
  reviewerId: string;
  role: EditorialReviewRole;
  reviewedAt?: string;
  rubricVersion: string;
  decision: EditorialReviewDecision;
  notes?: string;
  evaluation?: EditorialRubricEvaluation;
}
export type LearningItemKind = "word" | "phrase" | "collocation" | "grammar_pattern";
export type LanguageRegister = "neutral" | "informal" | "formal" | "academic" | "professional" | "literary" | "technical";

export interface MeaningMatchQuestion {
  id: string;
  // Content is always authored as MEANING_MATCH; PICK_THE_WORD is applied at
  // runtime by reversing an existing question (see domain/practice/reverseMode.ts).
  mode: GameMode;
  level: LevelCode;
  topic: string;
  /** Stable curriculum identity; user-facing topic text remains localized separately. */
  topicId?: string;
  word: string;
  meaning: string;
  wrongOptions: string[];
  xp: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  phonetic?: string;
  partOfSpeech?: PartOfSpeech;
  exampleSentence?: string;
  exampleTranslation?: string;
  contextNote?: string;
  /** A short, unscored prompt that asks the learner to produce the target in context. */
  productionPrompt?: string;
  /** A high-value word partnership learners should retain as a chunk. */
  collocation?: string;
  pronunciation?: string;
  hint?: string;
  // Backward compatibility aliases
  prompt?: string;
  answer?: string;
  options?: string[];
  // Immutable published-catalogue metadata. These are absent only for the
  // bundled offline fallback content.
  contentVersion?: string;
  unitId?: string;
  lessonId?: string;
  order?: number;
  status?: "published" | "draft" | "archived";
  /** Editorial gate. A published row is selectable only when this is approved. */
  editorialStatus?: EditorialStatus;
  reviewedAt?: string;
  reviewer?: string;
  editorialReview?: EditorialReviewEvidence;
  editorialReviews?: EditorialReviewRecord[];
  /** Distinguishes senses such as `report` (noun) and `report` (verb). */
  senseId?: string;
  cefr?: LevelCode;
  learningItemKind?: LearningItemKind;
  register?: LanguageRegister;
  source?: string;
}

export type Question = MeaningMatchQuestion;
