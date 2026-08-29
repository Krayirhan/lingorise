# VERIFICATION-ASSURANCE-001-BASELINE — DEEP TEST / VERIFICATION QUALITY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

**This score measures confidence in the verification system, not product quality.** It is NOT an additional Product Quality domain score and must not be averaged with, or treated as equivalent to, any Product Quality domain's score.

## Verification Assurance: 55/100

Confidence: HIGH

Derived via a two-pass process: Pass A independently and blindly mapped the current verification system before reading any domain audit findings; Pass B then reconciled that blind inventory against domain findings' risk classes only (never their scores). Every P1/P2 domain finding sampled in Pass B traced back to a structural gap already surfaced blind in Pass A — a strong internal-consistency signal for this score.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Critical domain behavior coverage | 20 | 15 | 5 | Exam-mode reward differentiation and interrupted-session-restore both never exercised by any test | E3 (absence confirmed via grep — `sessionMode` only ever `"PRACTICE"` in `testSuite.ts`) | HIGH |
| Negative / edge / failure coverage | 20 | 10 | 10 | Zero executable coverage for network failure during merge/fetch, `AsyncStorage` failure, malformed data hitting the real load path, partial account-deletion failure | E3 (absence confirmed) | HIGH |
| Data / sync / security executable coverage | 20 | 10 | 10 | Firestore rules ARE genuinely well-tested via a real emulator (strength); VERIFY-QA-001's oracle-coupling in the merge test, plus zero automated execution of the actual Firestore-calling service functions, is severe for this HIGH-PRIORITY dimension | E3 (both the strength and the gap are directly confirmed) | HIGH |
| Integration boundary verification | 10 | 4 | 6 | `auth.ts`/`firestore.ts`/`storage.ts`'s real integration behavior is only proven via manual/Maestro/consumer-audit runtime checks from prior sessions, not durable automated tests | E3 | HIGH |
| Critical-journey E2E coverage | 10 | 3 | 7 | The one Maestro flow is launch/onboarding-only (confirmed: no practice-answer, exam, auth, or error-path E2E exists) | E4 (the flow itself is real; its narrow scope is directly read) | HIGH |
| Regression protection | 10 | 6 | 4 | Good discipline confirmed for some historical fixes (CORE-001's streak-calculation fix has strong real-function regression tests spanning same-day/backward-clock scenarios); DATA-002's silent-save-failure fix has **zero** regression test; the historically significant merge-related fix's regression test is exactly VERIFY-QA-001's weak/coupled oracle | E3 (sampled directly) | HIGH |
| CI repeatability / gating evidence | 5 | 4 | 1 | CI itself is repeatable and green on HEAD; no branch protection means it doesn't technically gate merges — noted lightly here, with the heavier branch-protection finding belonging to a separate, later Release/Repo-domain audit | E3 | HIGH |
| Test oracle quality / determinism | 5 | 3 | 2 | One exemplary strong pattern found (exam pass/fail boundary tests call the real `isExamPassed` function with hardcoded boundary values, alongside real-function testing of promotion/answer/migration logic) alongside VERIFY-QA-001's weak/coupled merge oracle and VERIFY-QA-002's tautological oracle. Independent review reduced this deduction from an initial -3 to -2, judging the full weight of VERIFY-QA-001's root cause already adequately captured across the two dimensions above | E3 | HIGH |
| **TOTAL** | **100** | **55** | **45** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| VERIFY-QA-001 | The cold-start multi-device merge test (`tests/testSuite.ts` ~1543-1590) never imports or calls the real `mergeAndSyncUserData()` production function. It manually re-implements the merge formula inline, and independent review confirmed the hand-written field list is a line-by-line copy of the real function's field list at the time of writing — meaning the test validates its own independent copy of the logic, not the actual production code. If the real function's field list silently drifts (exactly what happened — a separate, already-completed data-integrity audit this session found the real function is missing several fields, including `passedLevelExams`), this test cannot detect it and continues passing. This directly and fully explains why that real, shipped defect went undetected despite "342/342 tests passing." Independent review confirmed P1 is appropriate given this is the app's single highest-risk, most complex data-integrity logic with effectively no working regression protection | **P1** | HIGH — independently confirmed via direct source comparison, including confirming zero references to the real function anywhere in the test file | OPEN |
| VERIFY-QA-002 | The `suspicious_date_jump` clock-manipulation anomaly-detection test (`tests/testSuite.ts` ~1418-1423) asserts `assert(true, "...recorded without errors")` — a tautological assertion that cannot fail regardless of the production code's actual behavior. Independent review additionally confirmed the real `checkServerDateAnomaly()` detection function is never referenced or called anywhere in the test file at all — this test proves only that a `track()` telemetry call doesn't throw, nothing about whether clock-manipulation is actually detected correctly | P3 | HIGH — independently confirmed, including the additional discovery that the real detection function isn't referenced at all | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with the highest-value, most distinct evidence at this depth; several additional smaller gaps (E2E scope, exam-mode exercise, service-layer coverage) are documented in the supporting matrices as contributing evidence to the dimension scores above rather than as separate finding IDs, to avoid finding-list inflation for what are facets of the same underlying structural gaps.

## Independent review

**`test-reviewer` (primary) — ADJUST (minor).** Independently confirmed both findings via direct source comparison — including line-by-line verification that the merge test's hand-written field list matches the real function's field list, and confirming zero references to either `mergeAndSyncUserData` or `checkServerDateAnomaly` anywhere in the test file. Confirmed VERIFY-QA-001 warrants P1 (not P2), given its risk-class centrality and complete absence of effective regression protection. Independently re-verified the three "what else to check" items (Maestro's launch-only scope, exam-mode never exercised, service-layer Firebase calls never executed) via its own greps, all confirmed. Flagged one proportionality concern: VERIFY-QA-001's root cause is reflected across three dimensions (Data/sync/security -10, Regression protection -4, Test oracle quality -3) — while each dimension asks a genuinely distinct question (scope/coverage, historical-fix durability, and oracle-construction quality respectively, not a literal duplicate), the reviewer judged the combined weight risked slightly over-crediting one root cause and recommended trimming the Test oracle quality component from -3 to -2, which has been applied above (54 → 55). No test-count bias, happy-path inflation, mocked-test false confidence, static-analysis over-credit, E2E-smoke over-credit, or bug-existence-incorrectly-deducted-as-verification-weakness was found — the review explicitly confirmed DATA-QA-002/CORE-QA-001 themselves were not re-scored, only their verification-gap angle.

## Strongest verification area

Firestore rules authorization testing and pure-domain-function testing: the rules suite genuinely executes real Firestore SDK calls against a real emulator running the actual `firestore.rules` file (owner/cross-user/anonymous/public-catalogue), and several critical pure functions (`isExamPassed`, `evaluatePromotion`, `applyPracticeAnswer`, the full migration pipeline, `updateDailyStreak`) are tested by calling the REAL production function with well-reasoned boundary/scenario values — genuinely strong regression protection where it exists.

## Weakest verification area

The integration boundary as a whole: real `AsyncStorage` I/O, real Firestore service-layer network calls, and anything requiring React rendering are structurally impossible to exercise in the current test environment (plain `ts-node`, no `AsyncStorage`, no React renderer) — meaning failure-injection, malformed-data-at-the-real-load-path, and most negative-path scenarios have zero automated coverage regardless of how many pure-function unit tests exist.

## False-confidence risks

"342/342 tests passing" is genuinely true and meaningful for the pure-logic layer it covers — but it creates false confidence about the merge/sync layer specifically, where the one relevant test's hand-reimplemented oracle would keep passing through exactly the kind of regression that already shipped once. A reader of the test-suite pass rate alone, without inspecting oracle construction, would reasonably but incorrectly conclude multi-device sync is well-regression-protected.

## Historical reconciliation (performed last, sampling `.audit/state/FINDING_REGISTRY.md`'s CLOSED findings for regression-durability evidence only — not imported into this score)

- CORE-001 (streak resets on non-+1-day clock diff, historically CLOSED) — **sampled and confirmed**: `updateDailyStreak()` has genuine, durable regression coverage calling the real function across same-day and backward-clock-jump scenarios (`tests/testSuite.ts` ~158-165). Good verification-maturity evidence.
- DATA-002 (silent `saveUserData` failure, historically CLOSED) — **sampled and confirmed absent**: zero grep matches for any regression test of this specific fix (`saveUserData`'s boolean-return-on-failure behavior). This corroborates, rather than contradicts, the independently-derived Regression Protection dimension score above.

No historical finding's severity was imported into this score. `.audit/state/FINDING_REGISTRY.md` was not modified.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git diff -- firestore.rules`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source, test, or rules changes)
