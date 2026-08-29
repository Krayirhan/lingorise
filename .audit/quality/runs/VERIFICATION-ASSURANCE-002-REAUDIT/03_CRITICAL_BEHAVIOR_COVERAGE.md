# VERIFICATION-ASSURANCE-002-REAUDIT — Critical Behavior Coverage

## VERIFY-QA-001 reaudit — the most important check

**A. Current production merge implementation identified:** `mergeUserData()` in `src/domain/sync/progressMerge.ts`, called by `mergeAndSyncUserData()` (`src/services/firestore.ts`) via `decideMergeAction()` (`src/domain/sync/remoteSync.ts`).

**B. Every test claiming merge/multi-device coverage identified:** `tests/testSuite.ts` §56 ("Canonical Progress Merge — Field-Merge Regression Matrix") is the only test group covering this behavior — confirmed by grepping the file for `mergeUserData`/`decideMergeAction`/`mergeAndSyncUserData`/"merge" (case-insensitive) and finding all matches concentrated in this one section (plus the unrelated `mergeLearningProgress` tests elsewhere, which were already correctly calling the real function pre-Sprint-1).

**C. Do tests call the actual production function, or a production pure helper the service directly uses?** Confirmed **the latter, correctly**: `mergeUserData` and `decideMergeAction` are the exact pure helpers `mergeAndSyncUserData()` calls internally (verified by reading `firestore.ts`'s import statement and function body). The test file imports both directly: `import { mergeUserData, PROGRESS_FIELD_STRATEGY } from "../src/domain/sync/progressMerge"` and `import { decideMergeAction, RemoteUserDataResult } from "../src/domain/sync/remoteSync"`.

**D. Search for copied field lists / duplicated merge algorithms inside tests:** NONE FOUND. Grepped `tests/testSuite.ts` for a second definition of `mergeUserData`, `decideMergeAction`, or any inline object literal resembling the merge's field-by-field construction (the exact historical anti-pattern) — no match. Every merge-related assertion in §56 is a call to the imported function followed by an assertion on its return value, not a hand-built "expected" object independently re-deriving the merge logic.

**E. Can production and test logic drift independently?** No — they are the same function (E confirmed above). The only way a semantic gap survives is if the function is called with test inputs that don't reflect a real production scenario (see DATA-QA-006's discovery below) — that is a test-*fixture-realism* gap, not an oracle-*duplication* gap, and it is a materially different, narrower category of problem than VERIFY-QA-001's historical defect.

**F. Would removing a production merge field cause the suite to fail?** YES for every one of the 8 historically-omitted fields, confirmed by direct reasoning per field (see `04_FAILURE_PATH_COVERAGE.md`'s drift-detection section) — each has either a dedicated assertion or is covered by the named DATA-QA-002 regression test.

**VERIFY-QA-001 status: CLOSED.** All four required conditions are independently confirmed: the test oracle no longer duplicates the production algorithm; the relevant regression tests execute production logic (not a proxy); drift protection is meaningful for the fields the historical defect actually affected; and the specific historical merge defect (passedLevelExams and its 7 siblings) would now be caught by a normal `npm test` run. This closure is NOT extended to imply the merge system is now defect-free in general — DATA-QA-005/006 (discovered by the separate DATA-002-REAUDIT, using different scenarios than VERIFY-QA-001's historical one) demonstrate the oracle, while no longer duplicated, still has fixture-realism and scenario-breadth limits. These are tracked as a new, narrower Verification finding (see `08_FINDING_RECONCILIATION.md`), not as a reason to keep VERIFY-QA-001 open — VERIFY-QA-001 was specifically and narrowly about oracle duplication, which is unambiguously fixed.

## VERIFY-QA-002 reaudit

**Real production function identified:** `detectClockAnomaly()` (`src/domain/sync/clockAnomaly.ts`), called by `checkServerDateAnomaly()` (`src/state/useUserProgress.ts`).

**Current test:** `tests/testSuite.ts` §53, confirmed to import and call `detectClockAnomaly` directly with five distinct input pairs (5-day jump, 1-day normal advance, same day, exactly-2-day boundary, missing reference) and assert on the exact `{isAnomalous, daysDifference}` return shape for each — not merely that the call "doesn't throw."

**Search for `assert(true` / tautological equivalents in this area:** Confirmed REMOVED from §53 (the historical `assert(true, "suspicious_date_jump telemetry event recorded without errors")` no longer exists at this location; grep-confirmed the exact string is gone). One unrelated `assert(true, "word_marked_leech telemetry event is callable without errors")` remains elsewhere in the file (§50-area, pre-existing, NOT part of Sprint 1's diff, confirmed via `git diff` — out of this reaudit's scope per the historical-vs-current-scope boundary, noted for completeness only).

**VERIFY-QA-002 status: CLOSED.** Meaningful production behavior (the actual anomaly-detection boundary condition, including the exact `>1 day` threshold) is genuinely tested with real inputs and real expected outputs.

## Drift detection assessment (mutation/counterfactual reasoning, no source mutated)

Per instructions, this was performed by structural/executable-test reasoning, not by actually mutating and reverting source (safer and sufficient given the test structure is directly readable).

| Hypothetical regression | Would a current test fail? |
|---|---|
| `passedLevelExams` merge reverted to remote-wins | YES — named DATA-QA-002 regression test |
| `dailyQuests`/`dailyReviewXpIds` cross-day guard removed | YES — named day-boundary regression test |
| `level` strategy changed to something else entirely broken (e.g. always `local`) | PARTIAL — the existing `higherLevel` test would fail, but no test currently validates against the *specific* DATA-QA-005 scenario (a manual downgrade being overridden) |
| `streak`'s `Math.max` removed/broken | YES for the pure function in isolation, but the specific DATA-QA-006 scenario (raw non-rolled-over `localData` entering the real `AppBootstrap` call sequence) is NOT reproduced by any current test — the two-device test pre-normalizes local state before calling `mergeUserData`, unlike production |
| `favoriteWordIds` union logic removed | YES — dedicated assertion added |
| `decideMergeAction`'s `failed`/`absent` branches swapped or merged | YES — three dedicated assertions |
| `PROGRESS_FIELD_STRATEGY` missing an entry for a hypothetical new `UserData` field | YES — compile-time (`tsc` fails), independently the strongest guarantee in this entire inventory |

**DRIFT DETECTION: PARTIAL.**

Strong (would reliably fail) for: all 8 historically-omitted fields, the day-boundary fix, `favoriteWordIds`, the absent/failed merge-decision distinction, and any wholesale field omission (compiler-enforced).
Weak (would NOT reliably fail) for: the exact DATA-QA-006 scenario (test fixture doesn't replicate production's un-normalized pre-merge state) and the exact DATA-QA-005 scenario (no test scenario exists for a manual-downgrade-then-merge sequence).

This is not a contradiction of VERIFY-QA-001's closure — it is evidence that the ORIGINAL, SEVERE, systemic oracle-duplication defect is fixed, while a narrower, bounded assurance gap remains for two specific fields whose product semantics (reversible preference vs. pure achievement) fall outside the test matrix's current scenario space.
