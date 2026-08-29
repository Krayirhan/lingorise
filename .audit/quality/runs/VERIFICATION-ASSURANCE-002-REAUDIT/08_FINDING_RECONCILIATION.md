# VERIFICATION-ASSURANCE-002-REAUDIT — Finding Reconciliation

## Historical findings

| Finding | Historical severity | Current status | Reason | Evidence |
|---|---|---|---|---|
| VERIFY-QA-001 | P1 | **CLOSED** | Test oracle no longer duplicates the production merge algorithm; `mergeUserData`/`decideMergeAction` are called directly by both production and tests; the specific historical merge defect is now caught by a named regression test | `03_CRITICAL_BEHAVIOR_COVERAGE.md` |
| VERIFY-QA-002 | P3 | **CLOSED** | `detectClockAnomaly()` extracted as a real, directly-tested pure function with meaningful boundary-value assertions; the historical tautology confirmed removed | `03_CRITICAL_BEHAVIOR_COVERAGE.md` |

No historical finding regressed.

## New findings

### VERIFY-QA-003 (NEW) — the new merge test matrix's fixture fidelity and scenario breadth have not yet reached full maturity

**Severity: P2** (raised from an initial P3 assessment after independent challenge). Not P3: an independent reviewer correctly pointed out that, unlike a purely hypothetical maturity gap, this one has demonstrated, non-speculative causal linkage to two already-confirmed P2 product defects (DATA-QA-005, DATA-QA-006) shipping past this exact test suite — matching the baseline's own convention of weighting proven consequence over hypothetical risk (the same reasoning that made VERIFY-QA-001 a P1, not merely a P2, at baseline). Not P1: this finding's blast radius is narrower than VERIFY-QA-001's — it affects two specific fields/scenarios, not the whole merge oracle, which remains genuinely un-duplicated and strongly protected for the 8 historically-critical fields.

**Two independent root causes, reported together as one finding per instructions (related in character, low severity, avoiding finding-list padding):**

1. **Fixture/production sequencing mismatch:** the two-device merge test pre-applies `updateDailyStreak`/`applyDailyRollover` to local state before calling `mergeUserData`, while production's actual call site (`AppBootstrap.tsx`) passes raw, non-rolled-over `loadUserData()` output into the equivalent call. This let DATA-QA-006 (stale streak resurrection) pass undetected. Evidence: `05_TEST_ORACLE_ANALYSIS.md`.
2. **Scenario-space gap for reversible-preference-style fields:** the test matrix's scenarios were built around achievement-style fields (once-earned, should-not-regress); no scenario models a field that is BOTH a merge participant AND a freely user-reversible choice (`level`, via `LevelSwitcherModal`). This let DATA-QA-005 pass undetected. Evidence: `06_DATA_REGRESSION_PROTECTION.md`.

**Not a duplicate of DATA-QA-005/006:** those are product defects (wrong merge behavior); this finding is about the verification system's inability to have caught them, a categorically distinct claim per instructions.

**Recommended remediation (not performed by this reaudit):** (1) change the two-device test to pass raw (non-rolled-over) local state into `mergeUserData`, matching `AppBootstrap`'s actual sequence, and add a dedicated stale-streak regression test; (2) add a dedicated test scenario for a manual level downgrade followed by a merge.

## Additional gaps noted (not elevated to a numbered finding, per independent reviewer input)

- **`REMOTE_AUTHORITATIVE`-strategy fields have no dedicated merge-behavior assertion.** The 9 fields using this strategy (`locale`, `dailyGoalMinutes`, `practiceSessionSize`, `notificationsEnabled`, `soundEnabled`, `reduceMotion`, `avatarId`, `displayName`, `lastKnownServerDate`, `schemaVersion`) rely entirely on the `{...remote}` baseline spread in `mergeUserData` — no test would fail if that baseline were accidentally changed to `{...local}` for these fields. LOW/MEDIUM priority (these are account settings, not progress data, so the impact of a regression here is UX inconsistency, not data loss) — noted as a coverage gap contributing to the Negative/edge/failure coverage dimension's score, not elevated to its own finding.
- **Several other Sprint-1-introduced behaviors in the same uncommitted working tree have zero test references**, confirmed by grep returning no matches for `PartialAccountDeletionError`, `deleteAccount`, `clearAllLocalData`, or `isCloudSynced` anywhere in `tests/testSuite.ts`: the account-deletion partial-failure distinction and the cloud-synced-vs-guest reset copy/behavior branch. These were already captured under `04_FAILURE_PATH_COVERAGE.md`'s existing "account-delete Auth failure" / "reset while signed in" rows (both already marked NOT COVERED) — restated here only to confirm this is a deliberate, already-scored gap, not an omission from this reconciliation.

## Findings NOT created (and why)

- **No separate finding for `AsyncStorage`/write/auth/account-deletion failure-path gaps.** These are unchanged from baseline (already fully captured in the baseline's own "Negative/edge/failure coverage" and "Integration boundary verification" dimension scores) — not new, not Sprint-1-introduced, correctly left as an unchanged dimension-score factor rather than a re-stated finding.
- **No separate finding for the Firestore-rules emulator gap.** Environment-caused, not a verification-system design defect; correctly treated as a confidence/evidence-strength factor (see `07_RUNTIME_E2E_RULES_EVIDENCE.md`), not a finding.
- **No separate finding duplicating DATA-QA-005 or DATA-QA-006 themselves.** These are Data findings, already recorded in `DATA-002-REAUDIT`; only their verification-system consequence (VERIFY-QA-003) belongs here.
- **No "more tests would be nice" findings.** Per instructions, no finding quotas, no padding.
