# VERIFICATION-ASSURANCE-002-REAUDIT — Sprint 1 Test Inventory

Every new or materially-changed test group in `tests/testSuite.ts`/`tests/firestoreRules.test.ts`, independently classified.

## `tests/testSuite.ts` §56 — "Canonical Progress Merge — Field-Merge Regression Matrix"

| Test group | Production function exercised | Layer | Behavior | Path | Historical defect protected? | Could meaningfully fail? | Mocks/fakes | Evidence level | Regression importance |
|---|---|---|---|---|---|---|---|---|---|
| Registry drift-protection backstop | `PROGRESS_FIELD_STRATEGY` (registry keys only) | REAL PRODUCTION BEHAVIOR (weak form) | Happy | Structural | Indirectly (DATA-QA-002 root cause) | Only if `DEFAULT_USER_DATA` gains a field the registry lacks — narrow | None | E3 | LOW (redundant with the stronger compile-time guarantee) |
| Two-device cold-start scenario | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Happy | Merge | DATA-QA-002 (partially — see streak caveat below) | YES for the fields it varies | None | E3 | HIGH |
| Named DATA-QA-002/RELEASE-QA-001 regression reproduction | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Failure-adjacent (stale-remote-after-failed-sync scenario) | Merge | **DATA-QA-002 / RELEASE-QA-001 directly** | YES — explicitly engineered to fail if `passedLevelExams`/`level`/`lastActiveDate` regress | None | E3 | **HIGH — the single most important test in this inventory** |
| Per-field assertions (passedLevelExams, dailyQuests, questHistory, celebratedLevels, practiceHistory, dailyReviewXpIds, favoriteWordIds, learningProgress) | `mergeUserData` | REAL PRODUCTION BEHAVIOR / PURE FUNCTION BOUNDARY | Happy + one cross-day failure scenario | Merge | DATA-QA-002 (field-by-field) | YES, each independently | None | E3 | HIGH |
| Day-boundary regression test (cross-day dailyQuests/dailyReviewXpIds) | `mergeUserData` → `mergeDailyScopedValue` | REAL PRODUCTION BEHAVIOR | Failure/edge (cross-day contamination) | Merge | A defect found and fixed DURING Sprint 1's own review cycle (not a historical DATA-QA-00x ID) | YES — named, engineered specifically to catch a reversion of the day-boundary fix | None | E3 | HIGH |
| Idempotency assertions | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Happy (stability) | Merge | General drift protection | YES | None | E3 | MEDIUM |
| A→B→A round trip | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Happy (convergence) | Merge | General drift protection | YES | None | E3 | MEDIUM |
| Stale cloud snapshot / partial local state / migrated old data | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Edge cases | Merge | General drift protection | YES | None | E3 | MEDIUM |
| `favoriteWordIds` union assertion | `mergeUserData` | REAL PRODUCTION BEHAVIOR | Happy | Merge | None specific — closes a coverage gap an independent reviewer found during Sprint 1 | YES | None | E3 | LOW-MEDIUM |
| `decideMergeAction` absent/failed/found assertions | `decideMergeAction` | REAL PRODUCTION BEHAVIOR (decision logic, not I/O) | Happy (absent, found) + failure (failed) | Merge decision | **DATA-QA-001 directly, at the decision-logic level** | YES | None (synthetic `RemoteUserDataResult` values — no Firestore SDK needed) | E3 for the decision; **E2 only for the actual I/O trigger it responds to** | HIGH for the decision; the underlying network-failure path itself remains untested |

## `tests/testSuite.ts` §53 — "Server Date Anomaly Detection"

| Test group | Production function exercised | Layer | Behavior | Path | Historical defect protected? | Could meaningfully fail? | Mocks/fakes | Evidence level | Regression importance |
|---|---|---|---|---|---|---|---|---|---|
| 5-day jump, 1-day advance, same-day, exact-2-day-boundary, missing-reference assertions | `detectClockAnomaly` | REAL PRODUCTION BEHAVIOR | Happy + boundary | Pure function | **VERIFY-QA-002 directly** | YES — asserts exact `{isAnomalous, daysDifference}` output for each case | None | E3 | HIGH |
| Real-call-site gating check | `detectClockAnomaly` + `track` | REAL PRODUCTION BEHAVIOR | Happy | Pure function → side-effect gate | VERIFY-QA-002 (reinforcement) | YES | None | E3 | MEDIUM |

## `tests/firestoreRules.test.ts`

| Test group | Production function exercised | Layer | Behavior | Path | Historical defect protected? | Could meaningfully fail? | Mocks/fakes | Evidence level | Regression importance |
|---|---|---|---|---|---|---|---|---|---|
| `dailyTasks` cross-user denial | `firestore.rules` | RULES | Negative (authorization) | Security/Data boundary | SEC-QA-005 | YES, if the emulator runs | Firestore Rules Unit Testing SDK (real emulator, not a mock of the rules engine itself) | **E3-capable, currently E2-only (NOT VERIFIED LOCALLY, environment gap)** | MEDIUM — real coverage exists in source, unexecuted this pass |
| Field-validation rejection/acceptance (`xp`/`streak`/`level`/`passedLevelExams`) | `firestore.rules`'s `isValidUserDoc` | RULES | Negative + happy | Data boundary | SEC-QA-001 | YES, if the emulator runs | Same as above | **E3-capable, currently E2-only (NOT VERIFIED LOCALLY, environment gap)** | MEDIUM — same caveat |

## Classification summary

- **REAL PRODUCTION BEHAVIOR:** the large majority of new tests — genuinely calls the actual production function under test, verified by direct import/call-site tracing (see `03_CRITICAL_BEHAVIOR_COVERAGE.md`).
- **PURE FUNCTION BOUNDARY:** `mergeUserData`/`detectClockAnomaly`/`decideMergeAction` are all pure functions — this is a deliberate, proportionate architecture choice (extracted specifically to be unit-testable without a mocking framework), not a weakness. Per instructions, pure-function tests are not penalized merely for being pure.
- **SERVICE/FAILURE PATH:** none of the new tests actually exercise a live or mocked Firestore/AsyncStorage call — `decideMergeAction`'s "failed" test simulates the OUTCOME of an I/O failure, not the I/O failure itself.
- **RULES:** two new rules-test groups exist in source but are E2-only this pass (environment-blocked).
- **TEST-ONLY LOGIC:** NONE FOUND — no test in this inventory contains a hand-copied production algorithm (independently re-verified via grep for `mergeUserData`/`decideMergeAction`/`detectClockAnomaly` definitions vs. call sites, confirming each is imported and called, never redefined locally).
- **WEAK OR TAUTOLOGICAL:** NONE FOUND in the Sprint-1-touched sections (`assert(true, ...)` fully eliminated from §53; the registry drift-protection backstop is weak but not tautological — it can fail, just rarely).

## Material improvement to assurance?

YES, substantially, for the specific defect classes VERIFY-QA-001/002 named. NOT a general-purpose improvement to negative-path/integration/E2E coverage — those remain largely as they were at baseline, consistent with Sprint 1's narrow, targeted mandate. The 50 net-new assertions are concentrated almost entirely in the merge/clock-anomaly domain; test-count growth by itself is explicitly not treated as evidence of broader assurance improvement, per instructions.
