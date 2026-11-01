import { allQuestions } from "../support/bundledCatalogue";
import { MeaningMatchQuestion } from "../../src/domain/models/content";
import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 61. Editorial Reviewer Workflow & Rubric Validation (Sprint Plan S1):
console.log("\n61. Editorial Reviewer Workflow & Rubric Validation (Sprint Plan S1):");
{
  const {
    validateReviewerEligibility,
    validateRubricEvaluation,
    isAccountableHumanReviewerId,
    applyEditorialReviewRecord,
    buildEditorialReviewQueue,
    EDITORIAL_RUBRIC_VERSION,
  } = require("../../src/content/editorialReviewWorkflow");

  // A. Reviewer Eligibility & Permission Validation
  const inactiveReviewer = {
    uid: "u1",
    role: "EDITORIAL_REVIEWER",
    active: false,
    reviewerRoles: ["english_usage_editor"],
    permissions: ["review.read", "review.write"],
    assignedLevels: ["A1"],
  };
  assert(!validateReviewerEligibility(inactiveReviewer, "A1", "english_usage_editor").valid, "Inactive reviewer is rejected");

  const unassignedLevelReviewer = {
    uid: "u2",
    role: "EDITORIAL_REVIEWER",
    active: true,
    reviewerRoles: ["english_usage_editor"],
    permissions: ["review.read", "review.write"],
    assignedLevels: ["A1"],
  };
  assert(!validateReviewerEligibility(unassignedLevelReviewer, "B1", "english_usage_editor").valid, "Reviewer cannot review unassigned level");

  const unassignedRoleReviewer = {
    uid: "u3",
    role: "EDITORIAL_REVIEWER",
    active: true,
    reviewerRoles: ["english_usage_editor"],
    permissions: ["review.read", "review.write"],
    assignedLevels: ["A1"],
  };
  assert(!validateReviewerEligibility(unassignedRoleReviewer, "A1", "turkish_translation_editor").valid, "Reviewer cannot act in unassigned role");

  const unauthorizedFinalDecider = {
    uid: "u4",
    role: "EDITORIAL_REVIEWER",
    active: true,
    reviewerRoles: ["final_decider"],
    permissions: ["review.read", "review.write"],
    assignedLevels: ["A1"],
  };
  assert(!validateReviewerEligibility(unauthorizedFinalDecider, "A1", "final_decider").valid, "Final decider role without review.final_decide permission is rejected");

  const authorizedFinalDecider = {
    uid: "u5",
    role: "EDITORIAL_REVIEWER",
    active: true,
    reviewerRoles: ["final_decider"],
    permissions: ["review.read", "review.write", "review.final_decide"],
    assignedLevels: ["A1"],
  };
  assert(validateReviewerEligibility(authorizedFinalDecider, "A1", "final_decider").valid, "Authorized final decider with permission is valid");

  // B. 12 Mandatory Rubric Items Validation
  const incompleteRubric = {
    englishNaturalness: true,
    turkishMeaningFidelity: true,
    posSyntaxAccuracy: true,
    ipaAccuracy: true,
    senseAccuracy: true,
    cefrCompliance: true,
    registerAppropriateness: true,
    collocationValidity: false,
    distractorsQuality: true,
    exampleSentenceQuality: true,
    productionPromptCompliance: true,
    reviewerNotes: "",
  };
  const rubricCheckIncomplete = validateRubricEvaluation(incompleteRubric);
  assert(!rubricCheckIncomplete.valid && rubricCheckIncomplete.failures.includes("collocationValidity") && rubricCheckIncomplete.failures.includes("reviewerNotes"), "Incomplete rubric is rejected with exact failures identified");

  const completeRubric = {
    englishNaturalness: true,
    turkishMeaningFidelity: true,
    posSyntaxAccuracy: true,
    ipaAccuracy: true,
    senseAccuracy: true,
    cefrCompliance: true,
    registerAppropriateness: true,
    collocationValidity: true,
    distractorsQuality: true,
    exampleSentenceQuality: true,
    productionPromptCompliance: true,
    reviewerNotes: "Verified context and collocation thoroughly.",
  };
  assert(validateRubricEvaluation(completeRubric).valid, "Complete 12-item rubric passes validation");

  // C. Reviewer Identity Accountability
  assert(!isAccountableHumanReviewerId("ai"), "Generic 'ai' reviewer is rejected");
  assert(!isAccountableHumanReviewerId("lingorise editorial qa"), "Generic team label is rejected");
  assert(!isAccountableHumanReviewerId("queue"), "Generic queue marker is rejected");
  assert(isAccountableHumanReviewerId("dr_selin_kaya"), "Accountable named human reviewer is accepted");

  // D. Immutable Decision Chain & States
  const sampleQuestion: MeaningMatchQuestion = {
    ...allQuestions[0],
    editorialReviews: [],
    editorialReview: undefined,
    editorialStatus: "needs_review",
    status: "draft",
  };

  const withRevision = applyEditorialReviewRecord(sampleQuestion, {
    reviewId: "rev-r1",
    reviewerId: "reviewer_english",
    role: "english_usage_editor",
    reviewedAt: "2026-09-12T10:00:00.000Z",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    decision: "revision_required",
    notes: "Distractor needs refinement.",
  });
  assert(withRevision.editorialStatus === "needs_review", "Item with revision_required is not approved");
  const queueWithRevision = buildEditorialReviewQueue([withRevision]);
  assert(queueWithRevision[0].state === "revision_required", "Queue correctly marks item as revision_required");

  let reviewed = sampleQuestion;
  const roles = [
    "english_usage_editor",
    "turkish_translation_editor",
    "cefr_curriculum_expert",
    "final_decider",
  ];
  for (let i = 0; i < roles.length; i++) {
    reviewed = applyEditorialReviewRecord(reviewed, {
      reviewId: `rev-${i}`,
      reviewerId: `reviewer_${i}`,
      role: roles[i],
      reviewedAt: "2026-09-12T12:00:00.000Z",
      rubricVersion: EDITORIAL_RUBRIC_VERSION,
      decision: "approved",
      notes: `Approved for role ${roles[i]}`,
    });
  }
  assert(reviewed.editorialStatus === "approved", "Item with all 4 roles approved transitions to approved");
  assert(reviewed.status === "published", "Fully approved item transitions status to published");
  assert(reviewed.editorialReviews?.length === 4, "All 4 reviewer records are preserved immutably");
  assert(buildEditorialReviewQueue([reviewed])[0].state === "approved", "Queue correctly transitions to approved state");

  // E. Client Service & Review Submission Permission Checks
  const {
    reviewerHasPermission,
    reviewerHasRole,
    canSubmitEditorialReview,
  } = require("../../src/content/editorialReviewWorkflow");

  const validProfile = {
    uid: "prof_1",
    displayName: "Prof. Ahmet Yilmaz",
    role: "EDITORIAL_REVIEWER",
    reviewerRoles: ["english_usage_editor", "turkish_translation_editor"],
    permissions: ["review.read", "review.write"],
    assignedLevels: ["A1", "A2"],
    active: true,
    createdAt: "2026-09-12T10:00:00.000Z",
  };

  assert(reviewerHasPermission(validProfile, "review.write", "A1"), "Reviewer has write permission on A1");
  assert(!reviewerHasPermission(validProfile, "review.write", "B1"), "Reviewer does not have write permission on unassigned B1");
  assert(!reviewerHasPermission(validProfile, "review.final_decide", "A1"), "Reviewer without final_decide lacks permission");
  assert(reviewerHasRole(validProfile, "english_usage_editor", "A1"), "Reviewer has english_usage_editor role on A1");
  assert(!reviewerHasRole(validProfile, "cefr_curriculum_expert", "A1"), "Reviewer does not have unassigned cefr_curriculum_expert role");

  const validSubmission = {
    questionId: "a1-mm-01",
    level: "A1",
    reviewId: "rev-s1",
    reviewerId: "prof_1",
    reviewerRole: "english_usage_editor",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    decision: "approved",
    reviewedAt: "2026-09-12T12:00:00.000Z",
  };
  assert(canSubmitEditorialReview(validProfile, validSubmission).allowed, "Valid submission is allowed by client guard");

  const invalidLevelSub = { ...validSubmission, level: "C1" };
  assert(!canSubmitEditorialReview(validProfile, invalidLevelSub).allowed, "Submission for unassigned level is rejected by client guard");

  const invalidRoleSub = { ...validSubmission, reviewerRole: "final_decider" };
  assert(!canSubmitEditorialReview(validProfile, invalidRoleSub).allowed, "Submission for unauthorized final_decider role is rejected by client guard");

  // F. Step-by-Step Approval Integrity: 1, 2, or 3 roles do not approve or publish the item
  let partialItem = sampleQuestion;
  partialItem = applyEditorialReviewRecord(partialItem, {
    reviewId: "rev-part-1",
    reviewerId: "reviewer_1",
    role: "english_usage_editor",
    reviewedAt: "2026-09-12T12:00:00.000Z",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    decision: "approved",
  });
  assert(partialItem.editorialStatus !== "approved", "1 approved role does not make item approved");
  assert(partialItem.status !== "published", "1 approved role does not publish item");

  partialItem = applyEditorialReviewRecord(partialItem, {
    reviewId: "rev-part-2",
    reviewerId: "reviewer_2",
    role: "turkish_translation_editor",
    reviewedAt: "2026-09-12T12:00:00.000Z",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    decision: "approved",
  });
  assert(partialItem.editorialStatus !== "approved", "2 approved roles do not make item approved");

  partialItem = applyEditorialReviewRecord(partialItem, {
    reviewId: "rev-part-3",
    reviewerId: "reviewer_3",
    role: "cefr_curriculum_expert",
    reviewedAt: "2026-09-12T12:00:00.000Z",
    rubricVersion: EDITORIAL_RUBRIC_VERSION,
    decision: "approved",
  });
  assert(partialItem.editorialStatus !== "approved", "3 approved roles without final_decider do not make item approved");
  assert(partialItem.status !== "published", "3 approved roles without final_decider do not publish item");
}

