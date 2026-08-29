# VERIFICATION-ASSURANCE-002-REAUDIT — Test Oracle Analysis

## Searched for, in every Sprint-1-touched test section

- Production algorithm copied into tests: NONE FOUND.
- Expected object built with an independently-derived identical field list: NONE FOUND — every merge assertion reads a specific field off the REAL function's return value and compares it to a literal expected value (e.g. `.passedLevelExams.includes("A1")`), not a second parallel-constructed "expected merged object."
- Tests asserting test-computed expected values from the same logic under test: NONE FOUND in the new sections.
- Tautologies (`assert(true, ...)` or equivalent): NONE FOUND in §53/§56 (the historical one in §53 is confirmed removed).
- Mocks returning the expected result without exercising behavior: NONE — no mocks are used anywhere in the new test sections; `decideMergeAction`'s tests use plain synthetic data objects (`RemoteUserDataResult` literals), not mocked function implementations.
- Assertions that cannot reasonably fail: the registry drift-protection backstop (§56, item 0) is WEAK but not un-failable — it fails only if `DEFAULT_USER_DATA` gains a key absent from the registry, a narrow but real condition.
- Enormous shallow snapshots: NONE — every assertion targets a specific field or a small, named invariant.
- Accidental self-fulfilling fixtures: **ONE FOUND, independently confirmed** — see below.

## The one genuine oracle-construction issue found: test-fixture/production sequencing mismatch

`tests/testSuite.ts`'s two-device cold-start test (§56) constructs `localRolloverState` by explicitly calling `updateDailyStreak()` + `applyDailyRollover()` on the local side BEFORE calling `mergeUserData(localRolloverState, device1RemoteDoc)` (confirmed by direct reading, lines ~1599-1607). Production's actual call site (`src/app/AppBootstrap.tsx`'s `onAuthStateChanged` handler) calls `mergeAndSyncUserData(uid, localData)` where `localData = await loadUserData()` — and `loadUserData()` performs NO streak-rollover math (confirmed: `src/services/storage.ts`'s `loadUserData` calls only `normalizeUserData`, never `updateDailyStreak`/`applyDailyRollover`).

This is not oracle DUPLICATION (the test still calls the real `mergeUserData` function with real semantics) — it is oracle-input FIDELITY: the test's INPUT to the real function does not match what production actually passes to that same real function in the exact call site the test claims to validate ("This IS the call `mergeAndSyncUserData()` makes in production" — a comment independently confirmed to be inaccurate for this specific pre-processing step). This is precisely the mechanism `DATA-002-REAUDIT` identified as responsible for DATA-QA-006 (streak resurrection) passing undetected.

**Classification:** a narrower, less severe descendant of the same general risk family VERIFY-QA-001 named (a test that looks like it validates production behavior but actually validates something subtly different) — but categorically different in kind: VERIFY-QA-001 was "wrong function entirely" (a hand-copied duplicate); this is "right function, input that doesn't match the real call site's actual preprocessing." Tracked as a new, distinct, lower-severity finding (see `08_FINDING_RECONCILIATION.md`), not as evidence that VERIFY-QA-001 remains open.

## Positive oracle-quality findings, independently reconfirmed

- `detectClockAnomaly()`'s boundary-value tests (exact 2-day threshold) are an example of oracle quality this reaudit rates as strong: hardcoded, independently-reasoned expected values against real production code, exactly matching the pattern the baseline audit praised for `isExamPassed`.
- `decideMergeAction`'s three-branch coverage (absent/failed/found) is a clean, independently-specified state-machine oracle — each branch's expected `action` value is derived from the finding's own stated product invariant ("unknown remote state must never be treated like an empty one"), not from re-reading the implementation.

## Dimension implication

Test oracle quality/determinism is substantially improved from baseline (both VERIFY-QA-001's coupled oracle and VERIFY-QA-002's tautology are genuinely resolved), but not to a perfect score — the newly-identified fixture-fidelity gap is itself an oracle-construction quality issue, holding this dimension just short of full marks. See `09_SCORECARD.md`.
