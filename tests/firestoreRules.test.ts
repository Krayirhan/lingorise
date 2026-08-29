import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

    console.log("Firestore rules: PASS");
  } finally {
    await env?.cleanup();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
