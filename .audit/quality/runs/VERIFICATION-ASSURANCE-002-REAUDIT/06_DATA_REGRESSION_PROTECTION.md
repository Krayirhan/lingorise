# VERIFICATION-ASSURANCE-002-REAUDIT — Data Regression Protection

## Historical Data findings — protection level (proportionate, not identical depth required)

**DATA-QA-001 (remote fetch failure ≠ absent): ADEQUATE.** The decision logic (`decideMergeAction`) that embodies this exact guarantee is directly, executably tested with all three branches (found/absent/failed). Not rated STRONG because the actual network-failure trigger (`fetchUserDataResult`'s `getDoc` throwing) has zero executable coverage — the test proves the DECISION is correct once a failure is known to have occurred, not that a real failure is correctly classified as one in the first place. Both this reaudit and `DATA-002-REAUDIT` independently reached the same conclusion via different framings (E3-for-decision/E2-for-I/O).

**DATA-QA-002 (cold-start merge field omission): STRONG.** Comprehensive, field-by-field, named regression test directly reproducing the historical scenario. This is the best-protected finding in this entire inventory.

**DATA-QA-003 (reset semantics): WEAK.** No executable test exists for `reloadLocalOnly()`'s Firestore-avoidance guarantee or the account-type-dependent confirm copy. The guarantee is real (independently confirmed structurally by `DATA-002-REAUDIT` — no Firestore import/call exists in the function body) but rests entirely on E2 code reading, with zero regression protection against a future code change reintroducing a `syncUserData` call into this path.

**DATA-QA-004 (account deletion lifecycle): WEAK.** Same reasoning — `PartialAccountDeletionError`'s branching and `deleteUserData`'s idempotency-on-retry are real (E2-confirmed) but have no executable test.

## DATA-QA-005 coverage (level / HIGHER_LEVEL vs. intentional downgrade)

**NOT COVERED.**

Searched `tests/testSuite.ts` §56 for any scenario combining a level downgrade with a subsequent merge — none exists. The existing `level` coverage only tests the `HIGHER_LEVEL` function's basic ordinal comparison (via the DATA-QA-002 regression test's `level: "A2"` vs. stale-remote `"A1"` case) — a scenario where the higher value IS the intended outcome, not one where a LOWER value was the user's most recent intentional choice. No test constructs a "local just switched down, remote still has the old higher value" scenario, and no test references `LevelSwitcherModal` or `setLevel`'s downgrade path at all in a merge context.

This is a legitimate current Verification gap discovered AFTER Sprint 1's own implementation was complete (DATA-QA-005 was found by the subsequent DATA-002-REAUDIT) — not a product defect being double-counted as a Verification defect. It is scored here only as "the suite does not protect against this specific scenario," not as a repetition of DATA-QA-005 itself.

## DATA-QA-006 coverage (stale local streak resurrection)

**NOT COVERED.**

As established in `05_TEST_ORACLE_ANALYSIS.md`: the test that would be expected to catch this (§56's two-device scenario) pre-normalizes (rolls over) the local side before calling `mergeUserData`, which does not reproduce `AppBootstrap`'s actual sequence (raw `loadUserData()` output, no rollover, entering the merge directly). No test exercises `AppBootstrap`'s actual bootstrap ordering; no test exercises "rollover applied AFTER merge, not before" semantics; no test constructs a stale (multi-day-old) local streak merging against a correctly-decayed remote streak. This would NOT be caught by the current suite if reintroduced or left unfixed.

Same disposition as DATA-QA-005: a legitimate current Verification gap, not a duplicate scoring of the product defect.

## Coherent root cause reconciliation (per instructions: do not create one Verification finding per product defect unless independently caused)

DATA-QA-005 and DATA-QA-006's non-coverage stem from two related but distinct verification-system root causes:
1. **Fixture/production sequencing mismatch** (test applies rollover before merge; production does not) — directly explains DATA-QA-006's blind spot.
2. **Scenario-space gap for reversible-preference fields** (no test scenario models a field that is both a merge-participant and a user-reversible choice, unlike the achievement-only fields the matrix was built around) — directly explains DATA-QA-005's blind spot.

These two causes are independent of each other (fixing #1 would not have caught DATA-QA-005; fixing #2 would not have caught DATA-QA-006) but share a common character: both are narrower descendants of "the new merge test matrix's realism/breadth has limits," which is the SAME general category VERIFY-QA-001 lived in before Sprint 1, just far less severe now. Recorded as ONE new Verification finding (VERIFY-QA-003) covering both causes together, rather than two separate finding IDs, since they are low-severity, closely related in character, and splitting them would risk finding-list padding for what is fundamentally one theme: **"the new merge oracle, while no longer duplicated, has not yet reached full scenario/fixture-fidelity maturity."** See `08_FINDING_RECONCILIATION.md`.
