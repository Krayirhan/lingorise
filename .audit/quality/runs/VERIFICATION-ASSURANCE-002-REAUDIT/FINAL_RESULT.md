# VERIFICATION-ASSURANCE-002-REAUDIT — FINAL RESULT

## Identity

Historical baseline revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Current HEAD: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (Sprint 1 remains an uncommitted working tree on top of this)
Working tree fingerprint: `c84a48065f67ef6642462d0648e7cb2e371b0cea7112a5abfadf38b4830a23bc` (identical to `DATA-002-REAUDIT`'s fingerprint — same exact code state, no drift between reaudits)
Audit date: 2026-08-29

## Verification Assurance

SCORE: **65/100**

Confidence: **HIGH**

## Current Severity Counts

(Current OPEN/PARTIAL findings only)

P0: 0
P1: 0
P2: 1
P3: 0
P4: 0

## Dimension Scorecard

| Dimension | Max | Baseline | Current | Delta |
|---|---:|---:|---:|---:|
| Critical domain behavior coverage | 20 | 15 | 15 | 0 |
| Negative / edge / failure coverage | 20 | 10 | 14 | +4 |
| Data / sync / security executable coverage | 20 | 10 | 13 | +3 |
| Integration boundary verification | 10 | 4 | 5 | +1 |
| Critical-journey E2E coverage | 10 | 3 | 3 | 0 |
| Regression protection | 10 | 6 | 8 | +2 |
| CI repeatability / gating evidence | 5 | 4 | 3 | −1 |
| Test oracle quality / determinism | 5 | 3 | 4 | +1 |
| **TOTAL** | **100** | **55** | **65** | **+10** |

Full reasoning: `09_SCORECARD.md`.

## Historical Finding Reconciliation

VERIFY-QA-001: **CLOSED**
VERIFY-QA-002: **CLOSED**

No historical finding regressed. Full evidence: `03_CRITICAL_BEHAVIOR_COVERAGE.md`, `08_FINDING_RECONCILIATION.md`.

## New Verification Findings

**VERIFY-QA-003 (P2)** — the new merge test matrix's fixture fidelity and scenario breadth have not yet reached full maturity: (1) the two-device merge test pre-applies streak-rollover normalization to its local input before calling `mergeUserData`, which does not match production's actual `AppBootstrap` sequence (raw, non-rolled-over `loadUserData()` output) — this is why DATA-QA-006 (streak resurrection) shipped undetected; (2) no test scenario models a merge-participant field that is also a freely user-reversible preference (`level`, via `LevelSwitcherModal`) — this is why DATA-QA-005 shipped undetected. Severity raised from an initial P3 to P2 after independent review confirmed demonstrated (not hypothetical) causal linkage to two shipped P2 product defects. Full detail: `08_FINDING_RECONCILIATION.md`.

## Production Logic / Test Coupling

RESOLVED for the historical defect class. `mergeUserData()` and `decideMergeAction()` are the exact functions production calls; independently confirmed no hand-copied algorithm exists anywhere in Sprint-1-touched test code. `detectClockAnomaly()` likewise. Full detail: `03_CRITICAL_BEHAVIOR_COVERAGE.md`.

## Drift Detection Assessment

**PARTIAL.** Strong (would reliably fail on regression) for all 8 historically-omitted fields, the day-boundary fix, `favoriteWordIds`, the absent/failed merge-decision distinction, and any wholesale field omission (compiler-enforced via `Record<keyof UserData, FieldStrategy>`). Weak for the exact DATA-QA-005/DATA-QA-006 scenarios and for the 9 `REMOTE_AUTHORITATIVE`-strategy fields (no dedicated assertion). Full detail: `03_CRITICAL_BEHAVIOR_COVERAGE.md`.

## Historical Data Regression Protection

DATA-QA-001: ADEQUATE (decision logic strongly tested; underlying I/O trigger untested).
DATA-QA-002: STRONG (comprehensive, named, field-by-field).
DATA-QA-003: WEAK (real, structurally-confirmed guarantee; zero executable test).
DATA-QA-004: WEAK (same reasoning).
Full detail: `06_DATA_REGRESSION_PROTECTION.md`.

## DATA-QA-005 Coverage

**NOT COVERED.** No test scenario models an intentional level downgrade interacting with a subsequent merge.

## DATA-QA-006 Coverage

**NOT COVERED.** The relevant test pre-normalizes (rolls over) local state before merging, which production does not do at its actual call site — this exact mismatch is why the defect was not caught.

## Failure-Path Assurance

Improved only for the remote-fetch-failure DECISION (`decideMergeAction`'s `failed` branch — real, executable). Unchanged (still absent) for: `AsyncStorage` failure, sync-write failure, auth-transition failure, account-deletion failure (both phases), reset-while-signed-in failure at the storage layer. Full detail: `04_FAILURE_PATH_COVERAGE.md`.

## Multi-Device Assurance

Production logic execution: YES (real functions called throughout). Scenario breadth: substantial for achievement-style fields, with two confirmed gaps (`level` reversibility, stale-streak resurrection). Oracle quality: strong except for the fixture-fidelity gap identified above. Convergence assertions: genuine and meaningful (idempotency, A→B→A). Uncovered known gaps: DATA-QA-005, DATA-QA-006, `REMOTE_AUTHORITATIVE` fields.

## normalizeUserData Assurance

Unchanged from baseline — no new test added for migration/normalization completeness (Sprint 1 did not touch `storage.ts`'s migration pipeline). Not elevated to its own finding; `DATA-002-REAUDIT` already classified the underlying code-level risk as maintainability-tier, not a Data defect, and this reaudit finds no additional verification-specific defect beyond "unchanged, still thin."

## Firestore Rules Evidence

Local: **NOT VERIFIED LOCALLY — ENVIRONMENT GAP** (JDK 17 installed, `firebase-tools` requires 21+; reconfirmed fresh this pass). CI: **NOT VERIFIED for this exact revision** — the modified `firestore.rules` file has never been executed by any CI run, a stricter evidentiary gap than baseline had for its (then-unmodified) rules file. New validation logic and its 6 new test assertions are E2 (static, well-reasoned) only. Full detail: `07_RUNTIME_E2E_RULES_EVIDENCE.md`.

## E2E Assurance

**Unchanged.** `.maestro/smoke.yaml` confirmed byte-identical to baseline. Neither credited nor penalized — correctly out of Sprint 1's scope.

## CI / Repeatability

CI workflow configuration unchanged. **CURRENT SPRINT-1 REVISION CI: NOT VERIFIED** — no CI run of any kind has executed against this uncommitted working tree. Local `typecheck`/`test` runs strongly suggest the `verify` job would pass, but this is not equivalent to an actual CI execution.

## Release-QA-001 Regression Protection

**ADEQUATE** (not STRONG). The specific historical scenario (passedLevelExams-class fields) is strongly, durably, executably protected — meeting most of the STRONG criteria (executable test, real production logic, failed-sync/restart protected, no serious oracle coupling remains). Held at ADEQUATE rather than STRONG because "merge drift is guarded" and "multi-device relevant behavior protected" are not yet true without qualification across the whole merge system — DATA-QA-005/006 demonstrate two specific, currently-undetectable gaps in fields adjacent to (but distinct from) RELEASE-QA-001's own historical scenario. This does not reopen or weaken RELEASE-QA-001's own CLEARED status (per `DATA-002-REAUDIT`) — it is a statement about the durability of protection around it going forward.

## Independent Reviewer

ADJUST — fully applied. Confirmed accurate: both historical closures, both VERIFY-QA-003 root causes, the E2/E3 discipline, the unchanged E2E/CI treatment. Corrected: VERIFY-QA-003 severity (P3→P2), Data/sync/security dimension score (15→13/20, for uncredited-but-unexecuted rules assertions), Negative/edge/failure dimension score (13→14/20, for under-credited scenario breadth). Full transcript: `10_INDEPENDENT_REVIEW.md`.

## Delta From Verification-001

55/100 → 65/100 (**+10**). Driven by VERIFY-QA-001/002's genuine, independently-reverified closure; held back from a larger recovery by unchanged E2E/integration-boundary/CI-for-this-revision evidence and by VERIFY-QA-003 — a new, narrower, but real assurance gap discovered in the exact same new code that fixed the historical defects.

## Next Action

SPRINT-001 FINAL ACCEPTANCE REVIEW
