import { EditorialReviewRole, LevelCode } from "./content";

export const EDITORIAL_REVIEWER_ROLE = "EDITORIAL_REVIEWER" as const;

export type EditorialReviewerPermission =
  | "review.read"
  | "review.write"
  | "review.final_decide";

export interface EditorialReviewerProfile {
  uid: string;
  displayName: string;
  role: typeof EDITORIAL_REVIEWER_ROLE;
  reviewerRoles: EditorialReviewRole[];
  permissions: EditorialReviewerPermission[];
  assignedLevels: LevelCode[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EditorialReviewSubmission {
  questionId: string;
  level: LevelCode;
  reviewId: string;
  reviewerId: string;
  reviewerRole: EditorialReviewRole;
  rubricVersion: string;
  decision: "approved" | "revision_required" | "rejected";
  notes?: string;
  reviewedAt: string;
  createdAt?: string | number | unknown;
  createdByUid?: string;
}

