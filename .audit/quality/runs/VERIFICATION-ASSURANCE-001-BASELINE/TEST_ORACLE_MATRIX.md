# VERIFICATION-ASSURANCE-001-BASELINE — Test Oracle Quality Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Test area | Oracle source | Classification | Evidence |
|---|---|---|---|
| Exam pass/fail boundaries (`isExamPassed(50)`, `isExamPassed(49)`, `isExamPassed(0)`, `isExamPassed(60)`) | Calls the REAL `isExamPassed()` function with hardcoded, independently-reasoned boundary values | **STRONG** | `tests/testSuite.ts` ~1409-1412 |
| Level promotion (`evaluatePromotion`) scenarios (barely-started, earned, already-celebrated) | Calls the REAL `evaluatePromotion()` function | **STRONG** | `tests/testSuite.ts` ~611-629 |
| Practice-answer reward logic (correct/wrong sequences, review-due scenarios) | Calls the REAL `applyPracticeAnswer()` function | **STRONG** | `tests/testSuite.ts` multiple call sites (~425-508); note: only ever called with `sessionMode: "PRACTICE"`, never `"EXAM"` — see Critical Behavior Coverage |
| Migration pipeline (`normalizeUserData`, `migrateV1ToV2`, `migrateV2ToV3`) | Calls the REAL migration functions with hand-constructed legacy-shaped inputs | **STRONG** | `tests/testSuite.ts` extensively, multiple sections |
| **Cold-start multi-device merge ("DATA-001" test)** | Does **NOT** call the real `mergeAndSyncUserData()` — the test manually re-implements the merge formula inline (`{...localRolloverState, ...device1RemoteDoc, xp: Math.max(...), ...}`) and then asserts against its own hand-written result | **WEAK / COUPLED** — the test and the production code can drift independently; a real, already-confirmed field-completeness defect in the actual merge function (found in a separate data-integrity audit this session) is exactly the class of bug this pattern cannot detect | `tests/testSuite.ts` ~1543-1590 — **VERIFY-QA-001** |
| `suspicious_date_jump` telemetry / clock-anomaly detection | `assert(true, "suspicious_date_jump telemetry event recorded without errors")` | **TAUTOLOGICAL** — this assertion cannot fail regardless of what the production anomaly-detection logic actually does; it only proves the code path doesn't throw | `tests/testSuite.ts` ~1418-1423 — **VERIFY-QA-002** |
| Empty question pool → session build returns `false` | Source-text regex check on `useAppSession.ts` (`fs.readFileSync` + pattern match for `if (qList.length === 0) return false;`), not actual hook execution | **ACCEPTABLE, but bounded** — proves the guard exists in source, does not prove the hook's actual runtime state transition behaves correctly (no `renderHook`/React execution available in this test environment) | `tests/testSuite.ts` ~1723-1731 (already established in a separate audit this session, reused as fact) |
| Firestore rules authorization (owner/cross-user/anonymous/public-catalogue) | Executes real Firestore SDK calls against a real rules emulator running the actual `firestore.rules` file | **STRONG** | `tests/firestoreRules.test.ts` — genuine E3 executable evidence |

## Summary

The suite's oracle quality is bimodal: excellent where a test calls the real, unmodified production function (exam/promotion/answer-evaluation/migration logic, and the entire Firestore-rules suite) — and weak or tautological in exactly the two places sampled that involve the most complex cross-cutting behavior (multi-device merge) or the least immediately-testable behavior (clock-manipulation detection). This is not a uniform quality problem; it is concentrated in specific, identifiable, high-value spots.
