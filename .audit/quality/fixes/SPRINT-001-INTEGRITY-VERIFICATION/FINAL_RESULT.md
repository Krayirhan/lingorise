# SPRINT-001 — INTEGRITY & VERIFICATION

Baseline revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Working revision: uncommitted working tree on top of the baseline (13 source/test files modified, 3 new files under `src/domain/sync/`)
MASTER source: `.audit/quality/runs/MASTER-001-CONSOLIDATION/`

Sprint status: **PASS**

## Master Scope

Ten Global findings owned: GLOBAL-QA-001, GLOBAL-QA-002, GLOBAL-QA-003, GLOBAL-QA-004, GLOBAL-QA-005, GLOBAL-QA-006, GLOBAL-QA-007, GLOBAL-QA-013, GLOBAL-QA-014, GLOBAL-QA-031. Full mapping in `01_MASTER_SCOPE_MAP.md`.

## Root Causes Addressed

1. No canonical, compiler-enforced ownership of "user progress" fields → 8 fields silently discarded on signed-in cold-start cloud merge (DATA-QA-002 / RELEASE-QA-001 / MAINT-QA-001).
2. Remote-fetch-failure indistinguishable from remote-absence, risking a destructive local-over-remote decision on unknown remote state (DATA-QA-001).
3. "Irreversible" local reset falsely claimed for signed-in accounts, and (found during actual source tracing) additionally destructive — the reset flow was silently pushing the wiped local state to the cloud (DATA-QA-003).
4. Reset-operation and cloud-sync failures silently swallowed with no user signal (REL-QA-003 / REL-QA-004).
5. Non-atomic Firestore-then-Auth account-deletion ordering with an incomplete cleanup scope (`dailyTasks` never purged) and a risk of reporting a partial failure as if nothing happened (DATA-QA-004 / SEC-QA-003).
6. Regression test hand-reimplemented the production merge formula instead of calling it (VERIFY-QA-001).
7. Tautological clock-anomaly test (VERIFY-QA-002).
8. No server-side validation on owner-writable progress fields; no `dailyTasks` cross-user rules test (SEC-QA-001 / SEC-QA-005).

## Files Changed

New: `src/domain/sync/progressMerge.ts`, `src/domain/sync/clockAnomaly.ts`, `src/domain/sync/remoteSync.ts`

Modified: `src/services/firestore.ts`, `src/services/storage.ts`, `src/services/auth.ts`, `src/state/useUserProgress.ts`, `src/app/AppBootstrap.tsx`, `src/app/AppNavigator.tsx`, `src/features/profile/components/DataManagementCard.tsx`, `src/features/profile/components/AccountManagementCard.tsx`, `src/features/profile/profile.types.ts`, `src/i18n/profile.ts`, `firestore.rules`, `tests/testSuite.ts`, `tests/firestoreRules.test.ts`

Full detail: `04_IMPLEMENTATION_SUMMARY.md`.

## Production Behavior Changes

Canonical merge (`mergeUserData`) now correctly classifies and merges every `UserData` field, including the 8 historically-omitted ones, with day-boundary-aware handling for daily-scoped fields (`dailyQuests`, `dailyReviewXpIds`). Remote-fetch failure now throws `RemoteStateUnknownError` instead of being silently treated as "no remote account." Local reset (`reloadLocalOnly`) no longer syncs to Firestore. Account deletion now purges `dailyTasks` and surfaces a partial-failure state distinctly. Cloud-sync failures are now surfaced to the user (consecutive-failure-gated, matching the existing local-save-failure UX pattern). Full detail: `04_IMPLEMENTATION_SUMMARY.md`.

## Data / Merge Semantics

Full per-field classification in `03_FIELD_SEMANTICS_MATRIX.md`. No data-shape change to `UserData`. `xp`/`streak`/`learningProgress`/`solvedQuestionIds`/`rewardedQuestionIds`/`unlockedBadges`'s already-correct behavior is unchanged; account-setting fields' existing (unflagged) behavior is unchanged; the 8 historically-omitted fields now have explicit, correct, tested merge strategies.

## Verification Architecture Changes

`mergeUserData()` and `decideMergeAction()` are now pure, dependency-light functions that both production code and the test suite call directly — no hand-copied merge algorithm remains anywhere. `detectClockAnomaly()` similarly extracted and directly tested.

## Test Results

| Check | Result |
|---|---|
| `npm run typecheck` | PASS (0 errors) |
| `npm test` | **PASS — 392 passed, 0 failed** |
| `npm run test:rules` (Firestore emulator) | BLOCKED — pre-existing local JDK 17 vs. required 21+ gap; honestly reported as NOT VERIFIED LOCALLY, not claimed as passing |
| Build sanity | Not applicable — no native/manifest/dependency change this sprint |

Full detail: `05_TEST_EVIDENCE.md`.

## Independent Review

Both an independent `code-reviewer` and an independent `test-reviewer` were run, each given only the findings/criteria/diff/tests (no disclosed expected verdict). Both returned **ADJUST**. All HIGH-severity findings (a real day-boundary defect in `dailyQuests`/`dailyReviewXpIds` merging, and a `favoriteWordIds` test-coverage gap plus a remote-fetch-failure test overclaim) were fixed and re-verified (typecheck + full suite re-run, 0 failures). One MEDIUM finding (a separate, smaller, out-of-mandate gap in `normalizeUserData()`'s own field list) was documented, not silently dismissed. Full transcript: `06_REVIEW_RESULTS.md`.

## Finding Closure Recommendations

| Finding | Status |
|---|---|
| DATA-QA-001 | CLOSED |
| DATA-QA-002 | CLOSED |
| DATA-QA-003 | CLOSED |
| DATA-QA-004 | CLOSED (residual client-architecture limitation documented, not hidden) |
| MAINT-QA-001 | CLOSED for the merge layer (its scored root cause); a narrower storage-layer analog noted as residual |
| VERIFY-QA-001 | CLOSED |
| VERIFY-QA-002 | CLOSED |
| SEC-QA-003 | CLOSED (same residual note as DATA-QA-004) |

Full matrix with evidence per finding: `07_FINDING_CLOSURE_MATRIX.md`.

## Release Blocker Status

RELEASE-QA-001: **CLOSED**

Meets the Release Blocker Closure Standard: the historical lost-progress scenario is reproduced and no longer loses progress (named regression test); failed/transient sync followed by restart is safe; damaged/stale state is never re-persisted as canonical; real production merge logic is exercised by tests (confirmed independently by both reviewers); `passedLevelExams` survives the relevant cold-start/multi-device/stale-snapshot scenarios; related history/state fields are handled intentionally (including the day-boundary correction applied after review); existing XP/streak/learningProgress/solved/rewarded/badge behavior does not regress (explicitly asserted). Static inspection alone was not treated as sufficient — every claim above is backed by an executable test.

## Residual Risks

1. Firestore emulator rules tests not executable locally (pre-existing JDK gap) — owner: a compatible CI runner or future targeted verification pass.
2. `normalizeUserData()`'s own manual field list (storage layer) lacks the same compiler-enforced protection the merge layer now has — owner: a future targeted Maintainability recheck if `storage.ts` is touched again.
3. `syncUserProgress()`'s intentionally-curated field subset for the lightweight `progress/main` doc is unchanged — a documented design choice, not a silent gap.
4. Account deletion remains not-truly-atomic across Firestore/Auth on this client-only architecture — bounded, self-healing on retry, documented.
5. `RemoteStateUnknownError`'s actual network-failure trigger is not end-to-end tested (only the decision consuming it is) — same pre-existing limitation as every other Firestore call in this codebase.

Full detail with impact/deferral reasoning: `08_RESIDUAL_RISK.md`.

## Deferred Items

CORE-QA-001, CORE-QA-002, Accessibility/Localization/Performance/Reliability findings not in Sprint 1's Global scope (Sprint 2). Privacy Policy hosting, EAS/Play signing, branch protection, secret scanning, Dependabot, CI hardening, production observability (Sprint 3). None were touched.

## Reaudit Scope

Required targeted reaudits:
1. **DATA-002-REAUDIT** — re-score Data Integrity / Offline / Sync against this sprint's merge/reset/deletion fixes.
2. **VERIFICATION-ASSURANCE-002-REAUDIT** — re-score Verification Assurance against the new real merge-oracle and clock-anomaly tests.

Conditional targeted reaudits (based on actual changed surfaces):
3. **MAINTAINABILITY targeted recheck** — for MAINT-QA-001's merge-layer closure and the newly-noted storage-layer residual.
4. **SECURITY targeted deletion/lifecycle recheck** — for SEC-QA-001 (rules validation, pending emulator execution) and SEC-QA-003 (deletion lifecycle) closure.
5. **RELEASE blocker-only recheck** — for RELEASE-QA-001 closure confirmation against this exact revision, once committed.

Not automatically run by this sprint — recommendation only, per instructions.

## Git State

Application source changed: YES
Tests changed: YES
Config changed: YES (`firestore.rules` — a Firestore configuration artifact, not application build config)
Historical audits changed: NONE
FINDING_REGISTRY modified: NO

Commit: NOT DONE
Push: NOT DONE
