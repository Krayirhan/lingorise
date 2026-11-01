import { EditorialReviewRole } from "../models/content";
import { EDITORIAL_REVIEWER_ROLE, EditorialReviewerPermission, EditorialReviewerProfile, EditorialReviewSubmission } from "../models/editorialReview";
export function reviewerHasPermission(
  profile: EditorialReviewerProfile | null,
  permission: EditorialReviewerPermission,
  level?: EditorialReviewerProfile["assignedLevels"][number]
): boolean {
  return Boolean(
    profile?.active &&
    profile.role === EDITORIAL_REVIEWER_ROLE &&
    profile.permissions.includes(permission) &&
    (!level || profile.assignedLevels.includes(level))
  );
}

export function reviewerHasRole(profile: EditorialReviewerProfile | null, role: EditorialReviewRole, level?: EditorialReviewerProfile["assignedLevels"][number]): boolean {
  return Boolean(profile?.active && profile.reviewerRoles.includes(role) && (!level || profile.assignedLevels.includes(level)));
}

export function canSubmitEditorialReview(
  profile: EditorialReviewerProfile | null,
  submission: EditorialReviewSubmission
): { allowed: boolean; reason?: string } {
  if (!profile) {
    return { allowed: false, reason: "Reviewer profile not found." };
  }
  if (!profile.active) {
    return { allowed: false, reason: "Reviewer profile is inactive." };
  }
  if (profile.role !== EDITORIAL_REVIEWER_ROLE) {
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

