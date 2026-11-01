import {
  EditorialReviewerPermission,
  EditorialReviewerProfile,
  EditorialReviewRecord,
  EditorialReviewRole,
  EditorialRubricEvaluation,
  LevelCode,
  MeaningMatchQuestion,
  ReviewQueueState,
} from "../models/content";
import { auditEditorialQuestions } from "./legacy";

export const EDITORIAL_RUBRIC_VERSION = "2026.09.p1";
export const EDITORIAL_REVIEW_ROLES: readonly EditorialReviewRole[] = [
  "english_usage_editor",
  "turkish_translation_editor",
  "cefr_curriculum_expert",
  "final_decider",
];

export function reviewerHasPermission(
  profile: EditorialReviewerProfile | null,
  permission: EditorialReviewerPermission,
  level?: LevelCode
): boolean {
  return Boolean(
    profile?.active &&
    profile.role === "EDITORIAL_REVIEWER" &&
    profile.permissions.includes(permission) &&
    (!level || profile.assignedLevels.includes(level))
  );
}

export function reviewerHasRole(
  profile: EditorialReviewerProfile | null,
  role: EditorialReviewRole,
  level?: LevelCode
): boolean {
  return Boolean(
    profile?.active &&
    profile.role === "EDITORIAL_REVIEWER" &&
    profile.reviewerRoles.includes(role) &&
    (!level || profile.assignedLevels.includes(level))
  );
}

export function canSubmitEditorialReview(
  profile: EditorialReviewerProfile | null,
  submission: {
    level: LevelCode;
    reviewerRole: EditorialReviewRole;
  }
): { allowed: boolean; reason?: string } {
  if (!profile) {
    return { allowed: false, reason: "Reviewer profile not found." };
  }
  if (!profile.active) {
    return { allowed: false, reason: "Reviewer profile is inactive." };
  }
  if (profile.role !== "EDITORIAL_REVIEWER") {
    return { allowed: false, reason: "User does not have EDITORIAL_REVIEWER role." };
  }
  if (!reviewerHasPermission(profile, "review.write", submission.level)) {
    return { allowed: false, reason: `Reviewer lacks write permission for level ${submission.level}.` };
  }
  if (!reviewerHasRole(profile, submission.reviewerRole, submission.level)) {
    return { allowed: false, reason: `Reviewer is not assigned to role ${submission.reviewerRole} for level ${submission.level}.` };
  }
  if (submission.reviewerRole === "final_decider" && !reviewerHasPermission(profile, "review.final_decide", submission.level)) {
    return { allowed: false, reason: `Reviewer lacks final_decide permission for level ${submission.level}.` };
  }
  return { allowed: true };
}

export function validateReviewerEligibility(
  reviewer: EditorialReviewerProfile,
  level: LevelCode,
  role: EditorialReviewRole
): { valid: boolean; reason?: string } {
  if (!reviewer.active) {
    return { valid: false, reason: "Reviewer profile is not active." };
  }
  if (!reviewer.assignedLevels.includes(level)) {
    return { valid: false, reason: `Reviewer is not assigned to level ${level}.` };
  }
  if (!reviewer.reviewerRoles.includes(role)) {
    return { valid: false, reason: `Reviewer is not authorized for role ${role}.` };
  }
  if (role === "final_decider" && !reviewer.permissions.includes("review.final_decide")) {
    return { valid: false, reason: "Reviewer lacks review.final_decide permission." };
  }
  return { valid: true };
}

export function validateRubricEvaluation(evaluation: EditorialRubricEvaluation): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!evaluation.englishNaturalness) failures.push("englishNaturalness");
  if (!evaluation.turkishMeaningFidelity) failures.push("turkishMeaningFidelity");
  if (!evaluation.posSyntaxAccuracy) failures.push("posSyntaxAccuracy");
  if (!evaluation.ipaAccuracy) failures.push("ipaAccuracy");
  if (!evaluation.senseAccuracy) failures.push("senseAccuracy");
  if (!evaluation.cefrCompliance) failures.push("cefrCompliance");
  if (!evaluation.registerAppropriateness) failures.push("registerAppropriateness");
  if (!evaluation.collocationValidity) failures.push("collocationValidity");
  if (!evaluation.distractorsQuality) failures.push("distractorsQuality");
  if (!evaluation.exampleSentenceQuality) failures.push("exampleSentenceQuality");
  if (!evaluation.productionPromptCompliance) failures.push("productionPromptCompliance");
  if (!evaluation.reviewerNotes || evaluation.reviewerNotes.trim().length === 0) {
    failures.push("reviewerNotes");
  }
  return { valid: failures.length === 0, failures };
}

const NON_HUMAN_REVIEWER_MARKERS = ["ai", "codex", "system", "queue", "remediation", "lingorise editorial qa"];

export function isAccountableHumanReviewerId(reviewerId: string): boolean {
  const normalized = reviewerId.trim().toLocaleLowerCase("en-US");
  return normalized.length >= 3 && !NON_HUMAN_REVIEWER_MARKERS.some((marker) => normalized === marker || normalized.includes(marker));
}

export interface EditorialReviewQueueItem {
  questionId: string;
  level: LevelCode;
  topic: string;
  state: ReviewQueueState;
  requiredRoles: EditorialReviewRole[];
  completedRoles: EditorialReviewRole[];
  auditErrors: string[];
  auditWarnings: string[];
  publicationStatus: "published" | "draft" | "archived" | "missing";
  humanApprovalPresent: boolean;
}

export function hasVerifiableHumanApproval(question: MeaningMatchQuestion): boolean {
  const evidence = question.editorialReview;
  return question.editorialStatus === "approved" &&
    question.status === "published" &&
    Boolean(
      evidence?.reviewId &&
      evidence.reviewerId &&
      isAccountableHumanReviewerId(evidence.reviewerId) &&
      evidence.reviewedAt &&
      evidence.rubricVersion &&
      evidence.decision === "approved" &&
      question.reviewer === evidence.reviewerId &&
      question.reviewedAt === evidence.reviewedAt
    );
}

export function isPublishableEditorialItem(question: MeaningMatchQuestion): boolean {
  return hasVerifiableHumanApproval(question) && auditEditorialQuestions([question]).errors.length === 0;
}

export function applyEditorialReviewRecord(
  question: MeaningMatchQuestion,
  record: EditorialReviewRecord
): MeaningMatchQuestion {
  if (!record.reviewId || !record.reviewerId || !record.rubricVersion || !isAccountableHumanReviewerId(record.reviewerId)) {
    throw new Error("Editorial review record requires reviewId, reviewerId and rubricVersion.");
  }
  const records = [...(question.editorialReviews || []).filter((existing) => existing.reviewId !== record.reviewId), record];
  const allRolesApproved = EDITORIAL_REVIEW_ROLES.every((role) =>
    records.some((entry) => entry.role === role && entry.decision === "approved" && entry.reviewerId && entry.reviewedAt)
  );
  const final = records.find((entry) => entry.role === "final_decider" && entry.decision === "approved" && entry.reviewedAt);
  const finalReviewedAt = final?.reviewedAt;
  if (allRolesApproved && final && finalReviewedAt) {
    return {
      ...question,
      status: "published",
      editorialStatus: "approved",
      reviewer: final.reviewerId,
      reviewedAt: finalReviewedAt,
      editorialReview: {
        reviewId: final.reviewId,
        reviewerId: final.reviewerId,
        reviewedAt: finalReviewedAt,
        rubricVersion: final.rubricVersion,
        decision: "approved",
      },
      editorialReviews: records,
    };
  }
  return { ...question, status: question.status === "published" ? "published" : "draft", editorialStatus: "needs_review", editorialReviews: records };
}

export function buildEditorialReviewQueue(questions: MeaningMatchQuestion[]): EditorialReviewQueueItem[] {
  return questions.map((question) => {
    const audit = auditEditorialQuestions([question]);
    const records = question.editorialReviews || [];
    const completedRoles = records
      .filter((record) => record.decision === "approved" && record.reviewerId && record.reviewedAt)
      .map((record) => record.role);
    const approved = hasVerifiableHumanApproval(question);
    const hasRejected = records.some((r) => r.decision === "rejected");
    const hasRevisionRequired = records.some((r) => r.decision === "revision_required");

    let state: ReviewQueueState = "queued";
    if (approved) {
      state = "approved";
    } else if (hasRejected || audit.errors.length > 0) {
      state = "blocked";
    } else if (hasRevisionRequired) {
      state = "revision_required";
    } else if (records.length > 0) {
      state = "in_review";
    }

    return {
      questionId: question.id,
      level: question.level,
      topic: question.topic,
      state,
      requiredRoles: [...EDITORIAL_REVIEW_ROLES],
      completedRoles: [...new Set(completedRoles)],
      auditErrors: audit.errors,
      auditWarnings: audit.warnings,
      publicationStatus: question.status || "missing",
      humanApprovalPresent: approved,
    };
  });
}

export function summarizeEditorialReviewQueue(queue: EditorialReviewQueueItem[]) {
  const byLevel = {} as Record<
    LevelCode,
    { total: number; queued: number; inReview: number; revisionRequired: number; approved: number; blocked: number }
  >;
  for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"] as LevelCode[]) {
    const rows = queue.filter((item) => item.level === level);
    byLevel[level] = {
      total: rows.length,
      queued: rows.filter((item) => item.state === "queued").length,
      inReview: rows.filter((item) => item.state === "in_review").length,
      revisionRequired: rows.filter((item) => item.state === "revision_required").length,
      approved: rows.filter((item) => item.state === "approved").length,
      blocked: rows.filter((item) => item.state === "blocked").length,
    };
  }
  return {
    total: queue.length,
    humanApproved: queue.filter((item) => item.humanApprovalPresent).length,
    pending: queue.filter((item) => !item.humanApprovalPresent).length,
    byLevel,
  };
}
