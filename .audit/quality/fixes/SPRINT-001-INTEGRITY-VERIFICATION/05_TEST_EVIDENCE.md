# SPRINT-001 — Test Evidence

| Command / Test | Purpose | Result | Evidence level | Notes |
|---|---|---|---|---|
| `npm run typecheck` | TypeScript strict-mode compile | **PASS** (0 errors) | E3 (executed) | Includes the new compiler-enforced `Record<keyof UserData, FieldStrategy>` check |
| `npm test` (`tests/testSuite.ts`) | Full existing + new regression suite | **PASS — 392 passed, 0 failed** | E3 (executed) | Was 342 assertions at baseline; +50 net from this sprint (an initial +40, then +10 more from the independent-review corrections — see `06_REVIEW_RESULTS.md`) |
| `npm run test:rules` (Firestore emulator) | Rules authorization + new field-validation rules | **BLOCKED — NOT VERIFIED LOCALLY, ENVIRONMENT GAP** | E2 (static review only) | `firebase-tools` requires JDK 21+; only JDK 17 is installed. Pre-existing gap (also blocked the original baseline audit), not introduced by this sprint. New rules text and new test assertions were carefully re-read against the existing, already-passing test pattern, but not executed. |
| Build sanity | Android compile/runtime check | **NOT RUN — not applicable** | — | No native code, `AndroidManifest`, Gradle config, or dependency was touched this sprint; only TypeScript/JS logic, one Firestore rules file (deployed separately, not compiled into the app bundle), and copy. Typecheck + the JS test suite are the relevant sanity checks for this change set. |

## Regression tests added

- `tests/testSuite.ts` §56 "Canonical Progress Merge — Field-Merge Regression Matrix": ~35 assertions, all calling the real `mergeUserData()` production function (no hand-copied merge logic). Covers: compiler/registry drift-protection backstop, the original two-device cold-start scenario, the historical DATA-QA-002/RELEASE-QA-001 scenario reproduced by name ("cold start after failed cloud sync preserves passed level exam progress"), `level`/`lastActiveDate` non-regression, all 8 historically-omitted fields individually (`passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, plus `level`/`lastActiveDate` above), idempotency, A→B→A round trip, stale-cloud-snapshot safety, partial/fresh-local-state safety, migrated (v1-shaped) local data compatibility.
- `tests/testSuite.ts` §53 "Server Date Anomaly Detection": replaced the tautological `assert(true, "suspicious_date_jump telemetry event recorded without errors")` with 10 real assertions against `detectClockAnomaly()`'s actual output for a 5-day jump, a normal 1-day advance, the same day twice, the exact 2-day threshold boundary, and a missing reference — plus a regression check that the real telemetry call site is gated by the real detection result.
- Post-review additions to §56 (from `06_REVIEW_RESULTS.md`): a `favoriteWordIds` union assertion; a named cross-day regression test ("cross-day merge does not let yesterday's completed quest silently mark today's freshly-rolled-over quest complete") plus a same-day-unaffected confirmation; and three `decideMergeAction()` assertions (`absent` → `first-sync`, `failed` → `unknown-remote-state`, `found` → a real `merge`) calling the newly-extracted pure decision function directly with synthetic `RemoteUserDataResult` values, no live/mocked Firestore SDK required.

## Failure-path tests added

- `tests/testSuite.ts` §56 directly reproduces "local exam pass + stale remote after a failed background sync" and asserts the pass survives — this is the executable form of the historical failed-sync-then-restart scenario.
- `tests/firestoreRules.test.ts`: new assertions that a negative `xp`/`streak`, an invalid `level` code, and a non-list `passedLevelExams` are all rejected by the new rules validation (SEC-QA-001), and a valid combined update is accepted.
- `tests/firestoreRules.test.ts`: new cross-user denial assertions for `users/{uid}/dailyTasks` (read and write) — previously the only owner-scoped subcollection without one (SEC-QA-005).

**Not executable in this environment (documented, not silently skipped):**
- `fetchUserDataResult()`'s actual Firestore I/O — the network call itself (a live `getDoc` succeeding, returning not-found, or throwing) requires a live or mocked Firestore SDK; the ts-node test runner used by `tests/testSuite.ts` has neither. **However**, the *decision* driven by that I/O's outcome (`decideMergeAction()` — absent → first-sync, failed → unknown-remote-state, found → real merge) is now directly, executably unit-tested (§56), since it was extracted into a dependency-free pure module (`src/domain/sync/remoteSync.ts`) specifically to make this possible without a mocking framework.
- `deleteAccount()`'s `PartialAccountDeletionError` path and `mergeAndSyncUserData()`'s actual `syncUserData`/`syncUserProgress` I/O calls — require live/mocked Firebase Auth/Firestore; E2 code-read verified only.
- All new `firestore.rules` assertions — blocked by the JDK environment gap above.

## Merge matrix exercised

See "Regression tests added" above — the full field list required by the sprint's own matrix (local newer/remote older, remote newer/local older, remote absent, remote fetch failed, per-field passedLevelExams/dailyQuests/questHistory/celebratedLevels/practiceHistory/dailyReviewXpIds/favoriteWordIds/level/lastActiveDate, XP/streak/learningProgress/solved/rewarded/badge protection, repeated-merge idempotency, A→B, A→B→A, stale cloud snapshot, partial local state, migrated older local state, and day-boundary safety for daily-scoped fields) is covered by an executable assertion calling the real production function or decision logic. Only the underlying Firestore *network I/O* itself (not the decision logic that consumes its result) remains untested, for the stated environment reason.

## Account/reset tests

- `DataManagementCard`'s reset flow was changed to call `reloadLocalOnly()` instead of `refresh()` and to branch on `clearAllLocalData()`'s new `{success}` result — verified by direct code reading (E2) and the full typecheck/test-suite pass; not covered by a React Native component-level test, since this codebase's test runner (`ts-node`, no React rendering capability) cannot render/interact with components — this is a pre-existing test-architecture limitation (documented in `VERIFICATION-ASSURANCE-001-BASELINE`), not a gap newly introduced or newly ignored by this sprint.
- `deleteAccount()`'s partial-failure branch — E2 code read only, for the same pre-existing reason.

## Clock anomaly test

**REAL** — see §53 above. No longer tautological.

## Typecheck

PASS, 0 errors (see table above).

## Existing regression suite

PASS — 382 total assertions (all of the pre-existing 342 plus this sprint's additions), 0 failures.

## Firestore emulator

BLOCKED locally — environment gap (JDK 17 vs. required 21+). Reported honestly as NOT VERIFIED LOCALLY, not claimed as passing. The exact-revision CI run for this changed code has not executed either (no commit/push was made this sprint, per instructions) — so CI evidence is not available and is not claimed.

## Build sanity

Not run — not applicable (see table above).

## Any blocked verification

Firestore rules emulator test (`npm run test:rules`) — environment-blocked, not code-blocked. See `08_RESIDUAL_RISK.md` for the recommended owner (a future targeted verification pass on a machine/CI runner with JDK 21+, or the project's existing CI which already runs on a compatible environment per prior baseline evidence — but that CI has not run against this sprint's uncommitted changes).
