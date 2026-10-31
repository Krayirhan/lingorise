import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  EditorialReviewerProfile,
  EditorialReviewSubmission
} from "../domain/models/editorialReview";
import { auth, db } from "./firebase";

export async function fetchEditorialReviewerProfile(uid = auth.currentUser?.uid): Promise<EditorialReviewerProfile | null> {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, "editorialReviewers", uid));
  return snapshot.exists() ? (snapshot.data() as EditorialReviewerProfile) : null;
}

import { canSubmitEditorialReview } from "../domain/editorial/reviewerPolicy";
export { canSubmitEditorialReview, reviewerHasPermission, reviewerHasRole } from "../domain/editorial/reviewerPolicy";

/**
 * Writes an immutable review decision. Firestore rules repeat the identity and
 * role checks; this client-side guard gives clear, actionable errors earlier.
 */
export async function submitEditorialReview(submission: EditorialReviewSubmission): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("An authenticated reviewer is required.");
  }
  if (uid !== submission.reviewerId) {
    throw new Error("Reviewer ID must match the authenticated user UID.");
  }
  const profile = await fetchEditorialReviewerProfile(uid);
  const check = canSubmitEditorialReview(profile, submission);
  if (!check.allowed) {
    throw new Error(check.reason || "Reviewer is not authorized to submit this review.");
  }

  await setDoc(doc(db, "editorialReviews", submission.reviewId), {
    ...submission,
    createdByUid: uid,
    createdAt: serverTimestamp(),
  });
}

