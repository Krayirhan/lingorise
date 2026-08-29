# SPRINT-002 — PRODUCT QUALITY & RUNTIME POLISH

## Identity

Current HEAD / origin/main: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (unchanged baseline SHA; Sprint 1 and Sprint 2 both remain uncommitted, per every sprint's own instructions)
Working-tree fingerprint: not separately computed this sprint (the Sprint 1/DATA-002/VERIFICATION-002 fingerprint methodology applies to the merge/sync subset only; Sprint 2's diff is recorded in full in `git diff --stat` below and in `04_IMPLEMENTATION_SUMMARY.md`)
MASTER source: `.audit/quality/runs/MASTER-001-CONSOLIDATION/`
Parent Sprint: `SPRINT-001-INTEGRITY-VERIFICATION`
Parent Reaudits: `DATA-002-REAUDIT`, `VERIFICATION-ASSURANCE-002-REAUDIT`

## Sprint Status

**PASS**

## Carry-over Results

DATA-QA-005: **CLOSED**
DATA-QA-006: **CLOSED**
VERIFY-QA-003: **CLOSED**

Full evidence: `09_FINDING_CLOSURE_MATRIX.md`, `05_TEST_EVIDENCE.md`.

## Master Sprint 2 Scope

Total Global findings in original Sprint 2 Master scope: 18 (16 `GLOBAL-QA-*` + 2 `GLOBAL-CD-*`)
Closed: 6 (`GLOBAL-QA-008, 015, 020, 025, 026`, plus partial `012`)
Partial: 1 (`GLOBAL-QA-012` — Privacy Policy content closed, other hardcoded-string locations deferred)
Open (deferred, documented): 11

## Core Correctness

`GLOBAL-QA-008` (CORE-QA-001) CLOSED: exam answers no longer silently progress the daily practice quest; XP/rewarded/solved/mastery tracking provably unchanged for both session modes.

## Reliability

`GLOBAL-QA-020` (REL-QA-002) CLOSED: `ErrorBoundary`'s restart now forces a genuine remount. `GLOBAL-QA-018` (CORE-QA-002) and `GLOBAL-QA-032` (REL-QA-001) deferred (see `10_RESIDUAL_RISK.md`). REL-QA-003/REL-QA-004 were already closed in Sprint 1, not re-touched.

## Accessibility

`GLOBAL-QA-015` (font-scale), `GLOBAL-QA-025` (touch targets), `GLOBAL-QA-026` (contrast) — all CLOSED, with on-device manual/runtime confirmation explicitly not performed (documented gap, not claimed as PASS) for the first two; the contrast fix has genuine E3 computed evidence.

## Localization

`GLOBAL-QA-012` PARTIALLY CLOSED: Privacy Policy content (Master's own most-cited example) is now fully localized with real, distinct English translations; avatar picker, word-detail modal, and word-notebook locations remain hardcoded (deferred).

## Performance

No Performance Global findings addressed this sprint (deliberately deferred — see `07_PERFORMANCE_EVIDENCE.md`). No performance regression introduced by Phase A's small, structurally-argued O(1) addition to the sign-in cold-start path.

## Maintainability

One proportionate side effect: `rolloverToToday()`'s extraction eliminated a third near-duplicate copy of rollover logic across `useUserProgress.ts`'s three call sites. No dedicated Maintainability Global findings (auth boundary, dead code, `as any` cast) were addressed (deferred).

## Consumer

No Consumer Global findings addressed (CD-005/CD-006 deferred — cosmetic, low value per Master's own characterization).

## Reviewer Adjustments

Independent code reviewer: **ADJUST → RESOLVED**. One LOW production-code fix applied (`ErrorBoundary.getDerivedStateFromError` → `Partial<State>`); one meta/process observation acknowledged with no code action available (both sprints forbid committing); one LOW edge case and one out-of-scope pre-existing issue noted, no action needed per the reviewer's own assessment.

Independent test reviewer: **ADJUST → RESOLVED**. Two MEDIUM test-quality fixes applied (locale-dictionary key-name parity instead of length-only comparison; corrected a misleading test-assertion label). Three LOW/informational items noted, no action needed per the reviewer's own stated conclusions.

A narrow post-fix confirmation pass independently reconfirmed all three applied fixes RESOLVED with no new P0/P1/P2 regression.

Full transcript: `08_REVIEW_RESULTS.md`.

## Verification Results

`npm run typecheck`: **PASS** (0 errors), fresh run after all reviewer fixes.
`npm test`: **PASS — 422 passed, 0 failed**, fresh run after all reviewer fixes (same count as pre-fix; the 2 test corrections were 1:1 replacements).
`npm run test:rules`: **BLOCKED — NOT VERIFIED LOCALLY** (pre-existing JDK 17 vs. required 21+ gap; `firestore.rules` unchanged by Sprint 2).
Build sanity: **NOT RUN** (no native/manifest/dependency change).

Full detail: `05_TEST_EVIDENCE.md`.

## Finding Closure Recommendations

See `09_FINDING_CLOSURE_MATRIX.md` for the complete table.

## Residual Risks

See `10_RESIDUAL_RISK.md` for the complete table — 11 deferred Master Sprint 2 findings, 5 verification-evidence gaps (all pre-existing or structurally standard, none newly introduced), 3 reviewer-identified LOW items explicitly not actioned per the reviewers' own conclusions, and 1 meta-process observation about the uncommitted multi-sprint workflow.

## Sprint 3 Deferrals

Sprint 3's own scope (public Privacy Policy hosting, EAS signing, Play Console, branch protection, secret scanning) — untouched, as required. `GLOBAL-QA-012`'s remaining hardcoded-string locations and several Maintainability/Performance/Consumer items are candidates for a future targeted follow-up, not formally assigned to Sprint 3 by Master.

## Required Targeted Reaudits

1. **CORE targeted reaudit** — for GLOBAL-QA-008's closure.
2. **RELIABILITY targeted reaudit** — for GLOBAL-QA-020's closure.
3. **ACCESSIBILITY targeted reaudit** — for GLOBAL-QA-015/025/026's closure.
4. **COMPATIBILITY targeted reaudit** — for GLOBAL-QA-012's partial closure.
5. **DATA blocker-only targeted check** — for DATA-QA-005/006's closure (confirming RELEASE-QA-001's continued CLEARED status is undisturbed).
6. **VERIFICATION blocker-only targeted check** — for VERIFY-QA-003's closure.
7. **MAINTAINABILITY targeted recheck** — for the `rolloverToToday` deduplication side effect (optional, low priority).

Not automatically executed — recommendation only, per instructions.

## Git State

Application source changed: YES
Tests changed: YES
Config changed: NO (Sprint 2 made no further Firestore rules edits)
Historical audits modified: NONE
MASTER modified: NO
FINDING_REGISTRY modified: NO

Commit: NOT DONE
Push: NOT DONE
