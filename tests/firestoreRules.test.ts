import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import fs from "node:fs";

async function main() {
  let env: RulesTestEnvironment | undefined;
  try {
    env = await initializeTestEnvironment({
      projectId: "lingorise-rules-test",
      firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
    });

    const alice = env.authenticatedContext("alice").firestore();
    const bob = env.authenticatedContext("bob").firestore();
    const anonymous = env.unauthenticatedContext().firestore();

    await assertSucceeds(setDoc(doc(alice, "users/alice"), { xp: 10 }));
    await assertSucceeds(setDoc(doc(alice, "users/alice/progress/main"), { xp: 10 }));
    await assertSucceeds(setDoc(doc(alice, "users/alice/dailyTasks/today"), { status: "open" }));
    await assertFails(getDoc(doc(bob, "users/alice")));
    await assertFails(setDoc(doc(bob, "users/alice/progress/main"), { xp: 999 }));
    await assertFails(getDoc(doc(anonymous, "users/alice")));
    await assertSucceeds(getDoc(doc(anonymous, "contentMeta/current")));
    await assertSucceeds(getDoc(doc(anonymous, "items/a1-mm-01")));
    await assertFails(setDoc(doc(anonymous, "items/a1-mm-01"), { word: "tamper" }));
    await assertSucceeds(setDoc(doc(alice, "users/alice/items/a1-mm-01"), { status: "learning" }));
    await assertFails(getDoc(doc(bob, "users/alice/items/a1-mm-01")));

    // SEC-QA-005 / GLOBAL-QA-031 — dailyTasks had no explicit cross-user
    // denial assertion, unlike every other owner-scoped subcollection above.
    await assertFails(getDoc(doc(bob, "users/alice/dailyTasks/today")));
    await assertFails(setDoc(doc(bob, "users/alice/dailyTasks/today"), { status: "tampered" }));

    // SEC-QA-001 / GLOBAL-QA-014 — owner-writable progress fields now have
    // server-side type/range validation, so an authenticated owner can no
    // longer fabricate an implausible progress state via a raw write.
    await assertFails(setDoc(doc(alice, "users/alice"), { xp: -5 }, { merge: true }));
    await assertFails(setDoc(doc(alice, "users/alice"), { streak: -1 }, { merge: true }));
    await assertFails(setDoc(doc(alice, "users/alice"), { level: "Z9" }, { merge: true }));
    await assertFails(setDoc(doc(alice, "users/alice"), { passedLevelExams: "A1" }, { merge: true }));
    await assertFails(setDoc(doc(alice, "users/alice/progress/main"), { xp: -100 }, { merge: true }));
    await assertSucceeds(setDoc(doc(alice, "users/alice"), { xp: 50, level: "A2", passedLevelExams: ["A1"] }, { merge: true }));

    // S1 — EDITORIAL REVIEWER & REVIEW RULES TESTS
    // 1. Unauthenticated / non-reviewer users cannot read or write reviews
    await assertFails(getDoc(doc(bob, "editorialReviews/rev-001")));
    await assertFails(setDoc(doc(bob, "editorialReviews/rev-001"), {
      reviewId: "rev-001",
      reviewerId: "bob",
      questionId: "a1-mm-01",
      level: "A1",
      role: "english_usage_editor",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));

    // Provision test reviewer profiles using security-rules-disabled context (trusted admin)
    await env.withSecurityRulesDisabled(async (adminContext) => {
      const adminDb = adminContext.firestore();
      await setDoc(doc(adminDb, "editorialReviewers/edUser"), {
        role: "EDITORIAL_REVIEWER",
        active: true,
        reviewerRoles: ["english_usage_editor", "turkish_translation_editor"],
        permissions: ["review.read", "review.write"],
        assignedLevels: ["A1", "A2"],
      });
      await setDoc(doc(adminDb, "editorialReviewers/finalDeciderUser"), {
        role: "EDITORIAL_REVIEWER",
        active: true,
        reviewerRoles: ["final_decider"],
        permissions: ["review.read", "review.write", "review.final_decide"],
        assignedLevels: ["A1"],
      });
    });

    const reviewer = env.authenticatedContext("edUser").firestore();
    const finalDecider = env.authenticatedContext("finalDeciderUser").firestore();

    // 2. Active reviewer can read and write for assigned level & role
    await assertSucceeds(setDoc(doc(reviewer, "editorialReviews/rev-a1-01"), {
      reviewId: "rev-a1-01",
      reviewerId: "edUser",
      questionId: "a1-mm-01",
      level: "A1",
      role: "english_usage_editor",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));
    await assertSucceeds(getDoc(doc(reviewer, "editorialReviews/rev-a1-01")));

    // 3. Reviewer cannot write for an unassigned level (e.g. B1 when assigned A1, A2)
    await assertFails(setDoc(doc(reviewer, "editorialReviews/rev-b1-01"), {
      reviewId: "rev-b1-01",
      reviewerId: "edUser",
      questionId: "b1-mm-01",
      level: "B1",
      role: "english_usage_editor",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));

    // 4. Reviewer without final_decider role or permission cannot write final_decider reviews
    await assertFails(setDoc(doc(reviewer, "editorialReviews/rev-a1-final"), {
      reviewId: "rev-a1-final",
      reviewerId: "edUser",
      questionId: "a1-mm-01",
      level: "A1",
      role: "final_decider",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));

    // 5. Authorized final decider can write final_decider review
    await assertSucceeds(setDoc(doc(finalDecider, "editorialReviews/rev-a1-final-valid"), {
      reviewId: "rev-a1-final-valid",
      reviewerId: "finalDeciderUser",
      questionId: "a1-mm-01",
      level: "A1",
      role: "final_decider",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));

    // 6. Existing reviews are immutable (cannot be updated or deleted)
    await assertFails(setDoc(doc(reviewer, "editorialReviews/rev-a1-01"), {
      decision: "rejected",
    }, { merge: true }));
    await assertFails(deleteDoc(doc(reviewer, "editorialReviews/rev-a1-01")));

    // 7. Client cannot write to editorialReviewers (profile self-assignment is denied)
    await assertFails(setDoc(doc(bob, "editorialReviewers/bob"), {
      role: "EDITORIAL_REVIEWER",
      active: true,
      reviewerRoles: ["final_decider"],
      permissions: ["review.read", "review.write", "review.final_decide"],
      assignedLevels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    }));
    await assertFails(setDoc(doc(reviewer, "editorialReviewers/edUser"), {
      permissions: ["review.read", "review.write", "review.final_decide"],
    }, { merge: true }));

    // 8. Reviewer ID mismatch (cannot submit on behalf of another user) is rejected
    await assertFails(setDoc(doc(reviewer, "editorialReviews/rev-mismatch-01"), {
      reviewId: "rev-mismatch-01",
      reviewerId: "differentUser",
      questionId: "a1-mm-01",
      level: "A1",
      role: "english_usage_editor",
      rubricVersion: "2026.09.p1",
      decision: "approved",
    }));

    console.log("Firestore rules: PASS");
  } finally {
    await env?.cleanup();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
