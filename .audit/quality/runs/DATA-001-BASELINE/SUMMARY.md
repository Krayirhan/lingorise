# DATA-001-BASELINE

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (main = origin/main, matches Shared Discovery revision)

## DATA INTEGRITY / OFFLINE / SYNC SCORE: 70/100

Confidence: HIGH

Status: WEAK

## Audit Identity

- Mode: DEEP
- Independent pass performed WITHOUT reading `.audit/state/FINDING_REGISTRY.md` or `CORE-001-BASELINE` first (anti-anchoring rule followed). Historical reconciliation performed only after the score/findings below were drafted.
- No prior project score used as a quality prior.
- Tracked application source clean at audit start (only pre-existing `.audit/consumer/*` state modifications from an unrelated prior task; not touched, not application source).

## Scorecard

| Dimension | Max | Score | Lost | Reason | Evidence level | Confidence |
|---|---|---|---|---|---|---|
| Local persistence & recovery | 15 | 14 | 1 | Minor: the outer `try/catch` in `loadUserData` covers the entire migration pipeline, not just the AsyncStorage read — a hypothetical migration-step exception would wipe to defaults rather than fail narrower. No concrete trigger found. | E1 | MEDIUM |
| Schema migration & normalization | 15 | 14 | 1 | No concrete defect found; design is shape-detecting, idempotent, self-healing, and well-reasoned. Small confidence reserve for `detectStoredSchemaVersion`'s theoretical misclassification risk on an unanticipated shape — no evidence this occurs in practice. | E1/E2 | HIGH |
| Cloud synchronization | 20 | 12 | 8 | DATA-QA-001: a failed remote fetch during login/cold-start merge is indistinguishable from "no remote document exists," causing local data to be pushed over potentially-stronger remote progress. | E2 | HIGH |
| Merge/conflict correctness | 25 | 11 | 14 | DATA-QA-002 (P0): `passedLevelExams` and five related fields are silently replaced by remote on every merge instead of unioned/reconciled, discarding legitimate local-only progress — most severely, a passed level-completion exam. | E2 + E3 (confirmed absent from all existing test coverage) | HIGH |
| Offline & partial-failure safety | 15 | 14 | 1 | Minor: a permanently-dropped cloud write has no explicit retry queue (relies on the next mutation to re-carry full state) — adequate but not queued. No concrete data-loss trigger beyond what's already captured in DATA-QA-001/002. | E1 | MEDIUM |
| Data lifecycle / deletion / reset | 10 | 5 | 5 | DATA-QA-003 (P2): "irreversible" local reset silently undone by the next merge for signed-in users. DATA-QA-004 (P3): account deletion can orphan a live Auth account with already-wiped Firestore data if the Auth-deletion step fails after the Firestore-deletion step succeeds. | E2 | HIGH |
| **TOTAL** | **100** | **70** | **30** | | | |

## 100 → 70 Score Loss Ledger

- **1 point (Local persistence):** broad try/catch scope in `loadUserData` — hardening note, not a demonstrated defect.
- **1 point (Schema migration):** theoretical shape-misclassification reserve — hardening note, not a demonstrated defect.
- **8 points (Cloud synchronization):** DATA-QA-001 — `fetchUserData`'s ambiguous `null` return conflates "no remote doc" with "fetch failed," and `mergeAndSyncUserData` acts on that ambiguity by treating a network blip as "this is a new user."
- **14 points (Merge/conflict correctness):** DATA-QA-002 — six fields (led by `passedLevelExams`) share one root cause (a hand-picked, incomplete re-merge list in `mergeAndSyncUserData`) but produce genuinely independent user-visible symptoms (lost exam-pass record; reverted daily-quest completion; reverted level choice; lost practice/quest history entries; a stray review-XP guard reset). Scored heavily because this is the rubric's largest single dimension (25 pts) and the defect sits at its exact center — the merge function's core field-selection logic.
- **1 point (Offline & partial-failure safety):** no explicit retry-queue for a permanently-dropped write — hardening note.
- **5 points (Data lifecycle):** DATA-QA-003 (2 pts — reset promise violated for signed-in users, not itself destructive) + DATA-QA-004 (3 pts — rare but real account-deletion partial-failure orphan state).

No points deducted for architecture style, missing analytics, or generic test-count concerns, per audit scope. DATA-QA-001 and DATA-QA-002 were confirmed by the independent reviewer to be genuinely independent root causes living in the same function (`mergeAndSyncUserData`) — not a duplicated deduction of one underlying bug.

## Findings

| ID | Title | Severity | Confidence | Evidence level | Status |
|---|---|---|---|---|---|
| DATA-QA-002 | Login/cold-start merge silently discards a passed level exam (and related same-day/history state) via an incomplete field-merge list | **P0** | HIGH | E2 + E3 | OPEN |
| DATA-QA-001 | A failed remote fetch during merge is indistinguishable from "no remote data," risking a local-over-remote overwrite | P1 | HIGH | E2 | OPEN |
| DATA-QA-003 | "Irreversible" local data reset is silently undone by the next merge for signed-in users | P2 | HIGH | E2 | OPEN |
| DATA-QA-004 | Account deletion can orphan a live Auth account with already-deleted Firestore data if Auth deletion fails after Firestore deletion succeeds | P3 | MEDIUM | E2 | OPEN |

### DATA-QA-002 — Login/cold-start merge silently discards a passed level exam

**Severity:** P0 (upgraded from an initial P1 draft — see Independent Reviewer Result)
**Impact:** A learner who passes a level-completion exam (60 questions, 50+ correct — a significant, hard-won achievement) can have that record silently and permanently erased from both local and cloud storage after nothing more than an ordinary transient network hiccup followed by a ordinary app restart, on the *same device*, with no error shown to the user.
**Confidence:** HIGH
**Evidence level:** E2 (static, direct source read, confirmed by independent code-reviewer) + E3 (confirmed zero existing test coverage exercises this path — the one existing merge-related test, `tests/testSuite.ts`'s "DATA-001" scenario, hand-reimplements the merge formula and never includes `passedLevelExams` in its own reimplementation or assertions)
**Evidence:**
- `src/services/firestore.ts: mergeAndSyncUserData` (lines 214-227): the explicit re-merge list covers `xp` (MAX), `streak` (MAX), `solvedQuestionIds`/`rewardedQuestionIds`/`unlockedBadges` (UNION), and `learningProgress` (domain-specific merge). `passedLevelExams` is absent from this list.
- Because the object is built as `{...localData, ...remote, <explicit overrides>}`, any field not explicitly overridden — `passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate` — is taken wholesale from `...remote`, discarding whatever `localData` held.
- `src/state/useUserProgress.ts: markLevelExamPassed` → `updateAndPersist` (lines 132-144): the Firestore sync is fire-and-forget (`Promise.all([...]).catch(console.warn)`), with no retry queue beyond `withRetry`'s internal 2-3 attempts inside each individual call.
- `src/app/AppBootstrap.tsx` (lines 45-58): `mergeAndSyncUserData` runs on **every** `onAuthStateChanged` firing for a signed-in user — i.e., on every cold start, not only the first login.
**Reachability:** High. Requires only: (1) passing an exam while signed in, (2) the immediately-following background sync failing for any transient reason (network drop, app backgrounded mid-request, etc.), (3) an ordinary app restart before a *different* mutation happens to re-sync the full state. This is an entirely ordinary usage pattern, not an exotic edge case.
**Root cause:** `mergeAndSyncUserData`'s explicit re-merge list was updated for `unlockedBadges` (a UNION) but never extended to `passedLevelExams` or the other fields listed above when they were added to the schema — an asymmetric oversight in an otherwise-careful function (contrast with `mergeLearningProgress`'s deliberately-reasoned tie-break logic in the same codebase).
**Data-loss/corruption scenario:** Pass an exam → sync fails silently → restart the app → the exam-pass vanishes from both local storage (via `saveUserData(mergedData)` in `AppBootstrap.tsx`) and is never re-written to Firestore (the merge's own `syncUserData(userId, mergedData)` call now persists the *regressed* state). The loss is permanent unless the exam is retaken.
**Why it matters:** This is the exact class of failure the audit's primary question asks about — legitimate progress silently lost through an ordinary, unremarkable sequence of events, with the single most significant achievement field in the schema affected, and zero user-facing signal that anything went wrong.
**Minimal remediation:** Add `passedLevelExams: Array.from(new Set([...(localData.passedLevelExams||[]), ...(remote.passedLevelExams||[])]))` (UNION, matching `unlockedBadges`) to the explicit re-merge list, and apply an appropriate non-destructive strategy (union for history/quest arrays, a documented tie-break for `level`/`lastActiveDate`) to the other fields identified in the Merge Matrix.
**Status:** OPEN

### DATA-QA-001 — Failed remote fetch treated as "no remote data"

**Severity:** P1
**Impact:** A learner logging into an existing account under poor network conditions (new device, reinstall, or simply bad signal) can have their genuine cloud progress silently overwritten by weaker/blank local data, because a fetch *failure* is indistinguishable from a *genuinely new user*.
**Confidence:** HIGH
**Evidence level:** E2 (static, direct source read, confirmed by independent code-reviewer)
**Evidence:**
- `src/services/firestore.ts: fetchUserData` (lines 60-78): returns `null` both when `!snap.exists()` (genuinely new user) and when the `getDoc` call throws after retries are exhausted (caught at line 74-77, also returns `null`).
- `mergeAndSyncUserData` (lines 199-205): `if (!rawRemote) { await syncUserData(userId, localData); await syncUserProgress(userId, localData); return localData; }` — treats both cases identically, pushing local data as authoritative.
**Reachability:** Requires poor/interrupted network specifically during the login/cold-start fetch, on an account that has genuine existing remote progress. Less frequent than DATA-QA-002's trigger condition (which needs no special network timing beyond an ordinary earlier sync miss), but realistic for the exact audience most likely to need this feature — someone signing into an existing account from a new/reinstalled device, often in exactly the kind of imperfect-network conditions (new SIM, unfamiliar wifi) that make this reachable.
**Root cause:** `fetchUserData`'s error-handling collapses two semantically distinct outcomes ("no data" vs. "couldn't check") into one `null` value, and the caller has no way to distinguish them.
**Data-loss/corruption scenario:** Sign into an existing account with real cloud progress, under a network condition that exhausts the fetch's retries → local (blank/weak) data is written over the existing remote document via `syncUserData`'s `{merge:true}` `setDoc` (which still overwrites every field present in the write payload, i.e. essentially the whole `UserData` object) → the account's real progress is gone.
**Why it matters:** This is the single most destructive theoretical path in the codebase — full-account overwrite rather than a specific-field loss — even though its trigger condition is narrower than DATA-QA-002's.
**Minimal remediation:** Have `fetchUserData` distinguish "confirmed absent" from "fetch failed" (e.g., a discriminated result type or a thrown/rethrown error for the failure case), and have `mergeAndSyncUserData` refuse to push local-as-authoritative when the fetch merely failed — retry later, or surface a blocking error, rather than silently treating it as a fresh account.
**Status:** OPEN

### DATA-QA-003 — "Irreversible" local reset is silently undone for signed-in users

**Severity:** P2
**Impact:** A signed-in user who taps "Yerel Verileri Sıfırla" ("Reset Local Data") and confirms — after being told "Bu işlem geri alınamaz" ("This action cannot be undone") — will, on the next app cold start (which re-triggers `onAuthStateChanged` → `mergeAndSyncUserData`), have their "erased" progress silently restored from Firestore. The stated promise does not hold for this user segment.
**Confidence:** HIGH
**Evidence level:** E2, confirmed by independent code-reviewer
**Evidence:** `src/features/profile/components/DataManagementCard.tsx` — `isCloudSynced` (line 22) is computed but never used to branch the reset button's visibility, label, or confirmation copy (lines 43-141); `src/services/storage.ts: clearAllLocalData` (lines 376-384) only calls `AsyncStorage.multiRemove` and `clearTelemetry` — it never touches Firestore.
**Reachability:** Every signed-in user who uses this feature and then reopens the app while still authenticated (the ordinary case).
**Root cause:** The reset flow was designed for the local-only/guest case and never extended to account for the cloud-mirrored case, or to warn the signed-in user that a full account/cloud deletion is a separate, different action.
**Data-loss/corruption scenario:** None in the destructive direction — this finding is about a *false promise*, not data loss. It is included because "does a stated data-lifecycle action actually do what it says" is squarely a data-integrity/lifecycle correctness question, with real privacy implications (a user attempting to clear their local footprint before, e.g., handing off a device, would not actually succeed if signed in and later reconnects).
**Why it matters:** Undermines user trust in the app's own data-control copy, and is a genuine privacy-relevant behavior gap distinct from ordinary data-loss risk.
**Minimal remediation:** Either scope the "irreversible" copy/confirmation to explicitly mean "local cache only, your cloud backup is untouched" for signed-in users, or offer a distinct "delete everywhere" action that also calls `deleteUserData`.
**Status:** OPEN

### DATA-QA-004 — Account deletion can orphan a live Auth account with wiped Firestore data

**Severity:** P3
**Impact:** If `deleteUser(user)` fails after `deleteUserData(uid)` has already succeeded (e.g., Firebase's `auth/requires-recent-login` error, which the UI explicitly anticipates and messages elsewhere), the user's Firestore progress is permanently gone while their Auth account still exists — they can log back in only to find a completely empty profile, not the "account deleted" outcome they intended.
**Confidence:** MEDIUM
**Evidence level:** E2, confirmed by independent code-reviewer
**Evidence:** `src/services/auth.ts: deleteAccount` (lines 62-69) — sequential, unguarded `await deleteUserData(uid); await deleteUser(user); await enableGuestMode();` with no compensating action if the second step fails after the first succeeds. `src/features/profile/components/AccountManagementCard.tsx` (lines 122-134 per reviewer's read) explicitly handles and messages the `auth/requires-recent-login` error for this exact call.
**Reachability:** Only affects users actively deleting their account under a specific, but explicitly-anticipated, Firebase security condition (session not "recent" enough).
**Root cause:** The correct ordering (Firestore before Auth, to keep rules-based authorization valid during the Firestore delete) has no fallback for the Auth step failing afterward.
**Data-loss/corruption scenario:** Firestore data deleted, Auth account survives; user re-authenticates to an empty account rather than a fully-deleted one.
**Why it matters:** A bounded, rare edge case, but a genuine partial-failure gap in a destructive, security-sensitive flow.
**Minimal remediation:** On `deleteUser` failure after a successful `deleteUserData`, surface a clear message that data has already been erased and account removal must be retried after re-authentication (rather than a generic error), or reorder to confirm re-authentication status before starting the destructive Firestore delete.
**Status:** OPEN

## Independent Reviewer Result

Reviewer: `code-reviewer` (independent, did not receive an expected score).
**Verdict: ADJUST.**
All four findings were independently re-verified directly against source (`firestore.ts`, `AppBootstrap.tsx`, `useUserProgress.ts`, `storage.ts`, `auth.ts`, `AccountManagementCard.tsx`, `DataManagementCard.tsx`) and confirmed accurate at E2/E3 evidence level, with DATA-QA-001 and DATA-QA-002 explicitly confirmed as genuinely independent root causes (not a duplicated deduction) living in the same function. The reviewer's adjustments, all applied:
1. **DATA-QA-002 upgraded from P1 to P0** — reasoning: its trigger condition (an ordinary sync miss followed by an ordinary restart) is far more common than DATA-QA-001's (a fetch specifically failing during login on a new/reinstalled device), and the loss is silent, permanent, and affects the schema's single highest-value achievement field.
2. **Merge/conflict correctness deduction increased** (originally −10, now −14/25) to reflect the P0 upgrade.
3. **Schema migration score reduced by 1 point** (15→14) — the reviewer considered a clean 15/15 marginally optimistic given a small theoretical (E1) misclassification risk in `detectStoredSchemaVersion`, though not a demonstrated defect.
4. **Overall total reduced from an initial 75 to 70**, and status reclassified from the initial "FAIR" to "WEAK" — the reviewer's stated view was that a system with an active, silent, permanent-data-loss path for its most valuable achievement field under ordinary conditions should not be scored as merely "FAIR."
Severity/confidence judgments for DATA-QA-003 (P2) and DATA-QA-004 (P3) were explicitly confirmed as correctly calibrated without adjustment.

## Strongest Data Controls

- **Per-word learning-progress merge** (`mergeLearningProgress`/`pickRicherRecord`) — atomic, whole-record, clock-independent-first tie-break (attempts → server timestamp → device clock), explicitly reasoned in comments, tested across multiple scenarios.
- **Schema migration pipeline** (`migrateV1ToV2`/`migrateV2ToV3`/`fillDefaults`) — shape-detecting rather than version-flag-trusting, deliberately idempotent and self-healing, defensive type-guards on every array/object field.
- **Local-write independence from network** — every mutation persists to AsyncStorage immediately regardless of cloud reachability; a single dropped cloud write self-heals via the next full-object sync (outside the specific merge-timing defects above).
- **Account-deletion base ordering** — Firestore-before-Auth is the correct choice to keep security rules valid during the destructive Firestore operations.

## Weakest Data Controls

- **`mergeAndSyncUserData`'s field-selection completeness** — the single most consequential gap in this audit; a function that gets six fields exactly right and silently drops six others.
- **`fetchUserData`'s error/absence ambiguity** — a one-function fix with an outsized blast radius (full-account overwrite potential).
- **Data-lifecycle promise accuracy** — the local-reset flow's copy overstates what actually happens for a meaningful user segment (signed-in users).

## Do Not Change

- `mergeLearningProgress`/`pickRicherRecord`'s whole-record, attempts-first tie-break logic — this is genuinely well-designed and should be the template for fixing the other fields, not something to simplify.
- The MAX/UNION treatment already applied to `xp`, `streak`, `solvedQuestionIds`, `rewardedQuestionIds`, `unlockedBadges` — correct as-is.
- The Firestore-before-Auth ordering in `deleteAccount` — reversing this would create a *worse*, more common failure mode (orphaned Firestore docs on every `requires-recent-login` case, rather than only some).
- The guest-vs-signed-in skip-local-write guard in `useUserProgress.ts` (historical DATA-001 fix) — still correct, still load-bearing, not touched by any finding in this audit.

## Known Limitations

- DATA-QA-001 and DATA-QA-002 were established via static source analysis (E2/E3), not reproduced on a real device or emulator this pass — reproducing them would require deliberately inducing network failures at precise moments, which was judged impractical within this audit's scope. Confidence remains HIGH because the call chains are unambiguous and were independently re-verified.
- Login-while-offline (#8 in the Offline/Sync Matrix) was not directly re-traced this pass — NOT VERIFIED, not assumed to fail.
- Historical two-device real-runtime evidence (DATA-001, project-owner-performed) is accepted as still valid for the specific fields that test covered (xp/streak/solved/learningProgress), since that code is unchanged — but that evidence never covered the fields this audit's findings concern, so it does not contradict them.
- `npm test`/`npm run typecheck` were not rerun this pass per the audit's own instruction (HEAD unchanged since Shared Discovery's last run, both were green — see `.audit/quality/shared/04-VERIFICATION_STATE.md`).

## Historical Reconciliation

Read only after the independent score/findings above were finalized. `.audit/state/FINDING_REGISTRY.md` was **not modified**.

| Historical finding | Old status | Independent rediscovery this pass | Reconciliation |
|---|---|---|---|
| DATA-001 (P1) — "Cold-start race can clobber merged progress" | CLOSED (RUN-005-REAUDIT; fix since FIX-2026-08-25-01; real two-device test by project owner) | The specific race this fix addressed (a local-only rollover write competing with the authoritative merge write) was independently re-read in `useUserProgress.ts` and found intact and consistent with the historical fix description. The *inline test* for this scenario (`tests/testSuite.ts`, "Assertions for DATA-001") was also independently found — and confirmed to never exercise `passedLevelExams` or the other DATA-QA-002 fields. | **CLOSED AND STILL VALID** for the original race. **NOT SUPERSEDED, NOT REGRESSED** — DATA-QA-001/002 are genuinely different defects in the same function that the historical fix's scope never covered. |
| DATA-002 (P2) — "Silent `saveUserData` failure" | CLOSED (FIX-2026-08-25-02) | `saveUserData` returning `false` on failure, with `useUserProgress.ts`'s `noteSaveOutcome`/consecutive-failure user notice, independently re-read and found intact. | **CLOSED AND STILL VALID** — no regression found. |

**No historical DATA-related finding was found to have regressed.** DATA-QA-001 through DATA-QA-004 are genuinely new — none appear in the historical registry under any prior ID, and the one existing test that touches the same function (`mergeAndSyncUserData`'s formula) never covered the affected fields. Historical statuses did not retroactively change the independent baseline score; the score above stands entirely on this pass's own evidence, as adjusted by the independent reviewer.
