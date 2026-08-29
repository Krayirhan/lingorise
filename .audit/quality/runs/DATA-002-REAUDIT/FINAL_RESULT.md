# DATA-002-REAUDIT — FINAL RESULT

## Identity

Historical baseline revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Current HEAD: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (Sprint 1 exists only as an uncommitted working tree on top of this)
Working tree fingerprint: `c84a48065f67ef6642462d0648e7cb2e371b0cea7112a5abfadf38b4830a23bc`
Audit date: 2026-08-29

## Data Integrity / Offline / Sync

SCORE: **86/100**

Confidence: **HIGH**

## Severity Counts

(Current OPEN/PARTIAL findings only — closed historical findings not counted)

P0: 0
P1: 0
P2: 2
P3: 0
P4: 0

## Dimension Scorecard

| Dimension | Max | Baseline | Current | Delta |
|---|---:|---:|---:|---:|
| Local persistence & recovery | 15 | 14 | 15 | +1 |
| Schema migration & normalization | 15 | 14 | 13 | −1 |
| Cloud synchronization | 20 | 12 | 17 | +5 |
| Merge/conflict correctness | 25 | 15 | 18 | +3 |
| Offline & partial-failure safety | 15 | 14 | 14 | 0 |
| Data lifecycle / deletion / reset | 10 | 5 | 9 | +4 |
| **TOTAL** | **100** | **74** | **86** | **+12** |

Full reasoning per dimension: `08_SCORECARD.md`.

## Historical Finding Reconciliation

DATA-QA-001: **CLOSED**
DATA-QA-002: **CLOSED**
DATA-QA-003: **CLOSED**
DATA-QA-004: **CLOSED**

No historical finding regressed. Full evidence: `07_FINDING_RECONCILIATION.md`.

## New Findings

- **DATA-QA-005 (P2)** — the new `level` field's `HIGHER_LEVEL` merge strategy can silently override an intentional manual level downgrade (via `LevelSwitcherModal`) with a stale-but-higher value, reachable on an ordinary single-device cold-start-before-sync-completes sequence (not requiring multi-device use).
- **DATA-QA-006 (P2)** — a long-stale local `streak` value can be silently and persistently resurrected during a signed-in merge, because `AppBootstrap.tsx` merges the raw (non-rolled-over) local state, and the resulting merge can pair a stale-high `streak` with a fresh `lastActiveDate` in a combination `updateDailyStreak()`'s gap-detection cannot subsequently recognize as anomalous.

Both discovered directly in Sprint-1-touched merge code, independently verified by direct source tracing, and both refined (DATA-QA-005's severity raised from an initial P3 assessment; DATA-QA-006 added entirely) through an independent reviewer challenge pass — see `09_INDEPENDENT_REVIEW.md`.

## Canonical Progress Ownership Assessment

STRONG for the MERGE layer specifically (compiler-enforced `Record<keyof UserData, FieldStrategy>`, independently confirmed to actually fail to typecheck if a field is omitted). NOT extended to the NORMALIZATION layer (`normalizeUserData`/`fillDefaults`, unchanged by Sprint 1, still a manual non-compiler-enforced list) or fully to the PERSISTENCE layer (`syncUserProgress`'s separate curated field list remains outside the registry, though low-risk in current practice). Full detail: `02_CURRENT_DATA_INVARIANTS.md`.

## normalizeUserData Residual Risk

MAINTAINABILITY RISK, not a Data Integrity finding — narrower than Sprint 1's own self-report suggested (general scalar fields pass through safely via object-spread; only two array-typed fields, `dailyQuests`/`learningProgress`, lack the `Array.isArray` guard every other array field in the same function has). No evidence of an actual current malformed stored value. Full detail: `02_CURRENT_DATA_INVARIANTS.md`, `07_FINDING_RECONCILIATION.md`.

## Day-Boundary Assessment

PASS. The `mergeDailyScopedValue` fix for `dailyQuests`/`dailyReviewXpIds` was independently re-traced through the full `AppBootstrap` → `mergeAndSyncUserData` → `userProgress.refresh()` call chain (not just the isolated fix) across four scenarios (local-fresh/remote-stale, local-stale/remote-fresh, both-stale, both-fresh) and confirmed correct and non-redundant with `applyDailyRollover()`'s separate day-transition logic in every case. Full detail: `04_FAILURE_AND_OFFLINE_MATRIX.md`.

## Multi-Device / Convergence Assessment

PARTIAL. Idempotency and A→B→A round-trip convergence are independently confirmed sound for every field's declared strategy. However, DATA-QA-005 and DATA-QA-006 are both genuine multi-device/multi-session convergence defects in two specific fields (`level`, `streak`) — the overall merge mechanism converges correctly and safely for the historically-defective 8 fields and all core protected fields, but not yet perfectly for these two newly-identified ones.

## Offline / Failure Safety

PASS for the core defect (DATA-QA-001): a failed remote read is structurally incapable of authorizing a destructive write, independently re-traced end-to-end. DATA-QA-006 is itself an offline/reconnect-safety concern (a stale offline device's data resurrecting on reconnect) and holds the Offline & partial-failure safety dimension at its baseline value rather than allowing a full recovery. Full detail: `04_FAILURE_AND_OFFLINE_MATRIX.md`.

## Reset Semantics

PASS. `reloadLocalOnly()` is structurally incapable of reaching Firestore (independently confirmed by full-body reading, not just absence-of-bug-so-far); confirm copy accurately and truthfully differs for cloud-synced vs. guest accounts; failure is surfaced distinctly from success. Full detail: `05_LIFECYCLE_RESET_DELETE.md`.

## Account Deletion Lifecycle

IMPROVED WITH RESIDUAL RISK. Cleanup scope now complete (`dailyTasks` added); partial-failure state now explicit and safely retryable (idempotency independently confirmed); no atomicity overclaim found anywhere. Residual: an inherent, honestly-documented, client-architecture timing window between Firestore deletion and Auth deletion — not eliminable without a backend component, correctly out of proportion for this sprint. Full detail: `05_LIFECYCLE_RESET_DELETE.md`.

## Backward Compatibility

PASS. Migration pipeline (`migrateV1ToV2`/`migrateV2ToV3`/`fillDefaults`) unchanged by Sprint 1; no evidence of any regression; existing migration-scenario tests still passing.

## Test / Runtime Evidence

`npm run typecheck`: PASS (0 errors), re-run fresh this reaudit.
`npm test`: PASS — 392 passed, 0 failed, re-run fresh this reaudit.
Merge/decision logic: genuinely E3-executable-tested, independently re-verified not to be a hand-copied algorithm.
Full detail: `06_TEST_AND_RUNTIME_EVIDENCE.md`.

## Environment Gaps

Firestore emulator (`npm run test:rules`): BLOCKED — NOT VERIFIED LOCALLY. Re-confirmed fresh: JDK 17.0.20.1 installed, `firebase-tools` requires 21+. Identical, pre-existing, unresolved-by-design gap (not attempted to be worked around). Not treated as FAIL.

## Release Blocker Evidence

RELEASE-QA-001 underlying Data defect: **CLEARED**

The specific historical scenario RELEASE-QA-001 was based on (cold-start merge silently discarding `passedLevelExams`/history fields after a failed sync) is fixed with strong, independently-verified E2+E3 evidence, matching every criterion in the reaudit instructions' closure standard. DATA-QA-005/006 are new, narrower findings unrelated to that specific historical scenario (they concern `level` and `streak`, not `passedLevelExams`/history), and do not reopen or partially clear RELEASE-QA-001's specific underlying defect — but a future Release check should be aware they exist as separate, smaller Data-integrity items.

## Independent Reviewer

ADJUST — fully applied. Found and this reaudit accepted: a new P2 finding (DATA-QA-006, streak resurrection) this reaudit's own initial draft had missed, a severity correction (DATA-QA-005 P3→P2), and a refinement to the `normalizeUserData` residual characterization. Confirmed accurate and unchanged: all four historical closures, the day-boundary fix, the reset/deletion lifecycle conclusions, and the absence of any NOT-VERIFIED-as-PASS mistreatment. Full transcript: `09_INDEPENDENT_REVIEW.md`.

## Delta From DATA-001

74/100 → 86/100 (**+12**). Driven overwhelmingly by DATA-QA-001/002/003/004's genuine closure; held back from an even larger recovery by two new, narrower findings (DATA-QA-005/006) discovered during this reaudit's independent verification of the exact same new merge code that fixed the historical defects.

## Required Next Reaudit

VERIFICATION-ASSURANCE-002-REAUDIT

## Git State

Application source changes by reaudit: NONE
Test changes by reaudit: NONE
Sprint 1 source/test changes preserved: YES
Historical audit modifications: NONE
FINDING_REGISTRY modified: NO

Commit: NOT DONE
Push: NOT DONE
