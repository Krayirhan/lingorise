# MASTER-001 — CONSOLIDATION

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (HEAD == origin/main, unchanged by this run)

Master status: **COMPLETE**

## Current Dashboard

| Layer | Score | Gate/Confidence |
|---|---:|---|
| Product Quality (raw weighted) | 85.75/100 | — |
| Verification Assurance | 55/100 | Confidence HIGH |
| Supply Chain / Repository Assurance | 73/100 | Confidence MEDIUM |
| Release Readiness | 61/100 | Confidence HIGH |
| **Release Gate** | — | **NO-GO** |

These four numbers are reported separately and are never blended into a single score, per the locked model.

## Raw Canonical Finding Counts

(Product Quality + Assurance + Release; excludes Consumer Impact findings and excludes Architecture/Code Quality evidence already absorbed into Maintainability)

P0: 0 | P1: 5 | P2: 8 | P3: 21 | P4: 8 — **Total: 42**

Consumer Impact findings (separate scale): 3

## Master Unique Global Finding Counts

P0: 0 | P1: 4 | P2: 7 | P3: 19 | P4: 6 — **Total: 36** (`GLOBAL-QA-*`)
Consumer Global findings (separate scale): 2 (`GLOBAL-CD-*`)

**Why counts changed (42 → 36):** four DUPLICATE-ROOT-CAUSE merges (MAINT-QA-001 into GLOBAL-QA-001 — itself already the canonical consolidation of ARCH-QA-001/CODE-QA-003; MAINT-QA-005 into GLOBAL-QA-008 — canonical consolidation of CODE-QA-004; SEC-QA-003 into GLOBAL-QA-007 with DATA-QA-004; SUPPLY-QA-004 into GLOBAL-QA-009 with SEC-QA-004) plus one NOT-MASTER-BACKLOG exclusion (SUPPLY-QA-006, accepted debt with no established runtime path). No other collapsing occurred — every other related pair (e.g. VERIFY-QA-001 vs. the schema fix, DATA-QA-001 vs. REL-QA-004, DATA-QA-003 vs. REL-QA-003, RELEASE-QA-002 vs. SEC-QA-004/SUPPLY-QA-004, RELEASE-QA-003 vs. COMPAT-QA-001) was deliberately kept as independent Global findings because remediation genuinely differs, per `03_ROOT_CAUSE_CLUSTERS.md`.

Release Conditions: 3 (GLOBAL-QA-010, GLOBAL-QA-028, GLOBAL-QA-029)
Consumer Impact findings: 3 (CD-004, CD-005, CD-006 — 2 mapped to Global findings, 1 deferred)

## Root Cause Clusters

8 validated clusters (`03_ROOT_CAUSE_CLUSTERS.md`): progress schema/merge integrity, remote-absent-vs-failure semantics, reset semantics, account deletion lifecycle, exam-vs-practice attribution, signing/artifact provenance, privacy-policy surface, test-oracle/failure-path assurance.

## Highest-Risk Global Findings

1. **GLOBAL-QA-001** (P1, CRITICAL PATH, MUST FIX) — canonical progress-schema/merge fix; sole cause of the RELEASE-QA-001 blocker
2. **GLOBAL-QA-002** (P1, CRITICAL PATH, MUST FIX) — merge test oracle must exercise real production logic; required evidence for RELEASE-QA-001 closure
3. **GLOBAL-QA-003** (P1, CRITICAL PATH, MUST FIX) — remote-fetch-failure vs. remote-absent distinction
4. **GLOBAL-QA-011** (P1, CRITICAL PATH, MUST FIX) — host a durable public app-specific privacy policy; the second proven Release blocker

## Proven Release Blockers

| Blocker | Root cause | Owning Global finding | Sprint |
|---|---|---|---|
| RELEASE-QA-001 | No canonical progress schema → merge discards passed-exam/history fields | GLOBAL-QA-001 (+ GLOBAL-QA-002 evidence) | 1 |
| RELEASE-QA-003 | Configured privacy-policy URL not anonymously app-specific | GLOBAL-QA-011 (fed by GLOBAL-QA-012) | 3 |

## Conditional Release Requirements

| Condition | Owning Global finding | Sprint |
|---|---|---|
| EAS production AAB signing / Play App Signing NOT VERIFIED | GLOBAL-QA-010 | 3 |
| EAS production Firebase environment NOT VERIFIED | GLOBAL-QA-028 | 3 |
| Play Console version/listing/Data Safety/account-deletion web declaration NOT VERIFIED | GLOBAL-QA-029 | 3 |

## Three Sprint Summary

**SPRINT 1 — Integrity & Verification** (10 Global findings): canonical progress-schema/merge fix, remote-failure semantics, reset semantics, account-deletion lifecycle, real merge-test oracle, real clock-anomaly test, Firestore-rules validation. Owns RELEASE-QA-001.

**SPRINT 2 — Product Quality & Runtime Polish** (16 Global + 2 Consumer findings): exam/practice reward accounting, localization (incl. privacy-policy content production), accessibility (font-scale/touch-targets/contrast), reliability (ErrorBoundary, catalogue race), performance (startup gate, write amplification, dead cold-start work), maintainability cleanup (dead code, auth boundary, any-cast), two cheap Consumer items.

**SPRINT 3 — Release & Repository Hardening** (10 Global findings): public privacy-policy hosting, signing hygiene + EAS/Play signing verification, Firebase-env verification, Play Console verification, branch protection, secret scanning, CI installer pinning, observability, dependency automation. Owns RELEASE-QA-003 and all 3 conditional release requirements.

## Deferred Debt

GLOBAL-QA-035 (mascot asset compression, ACCEPT/DEFER), CD-004 (Memrise metaphor positioning, NOT MASTER BACKLOG), SUPPLY-QA-006 (17 moderate build/dev advisories, accepted debt).

## Targeted Reaudit Plan

After Sprint 1: DATA-002-REAUDIT, VERIFICATION-ASSURANCE-002-REAUDIT (required); MAINTAINABILITY/SECURITY/RELEASE-blocker-only (conditional on actual changed surfaces).
After Sprint 2: CORE/ACCESSIBILITY/COMPATIBILITY/PERFORMANCE targeted rechecks (only for domains actually touched); no DATA/SECURITY/SUPPLY-CHAIN/RELEASE re-run needed.
After Sprint 3: RELEASE blocker-only + conditional-items recheck; SUPPLY CHAIN targeted recheck; no CORE/DATA/RELIABILITY/MAINTAINABILITY/PERFORMANCE/ACCESSIBILITY re-run needed.

Full detail in `08_REAUDIT_AND_RELEASE_PATH.md`.

## Production Path

MASTER-001 → Sprint 1 → targeted reaudit → Sprint 2 → targeted reaudit → Sprint 3 → targeted reaudit/release prep → exact-revision RC → EAS production AAB → signing/env/runtime verification → RELEASE-002 → FINAL MASTER → GO/CONDITIONAL/NO-GO → production submission only if GO. Full gate conditions in `08_REAUDIT_AND_RELEASE_PATH.md`.

## Canonical Master Artifacts

`.audit/quality/runs/MASTER-001-CONSOLIDATION/`: `01_CANONICAL_INPUTS.md`, `02_RAW_FINDING_INVENTORY.md`, `03_ROOT_CAUSE_CLUSTERS.md`, `04_GLOBAL_FINDINGS.md`, `05_DEDUPLICATION_LEDGER.md`, `06_RELEASE_DEPENDENCY_MAP.md`, `07_THREE_SPRINT_PLAN.md`, `08_REAUDIT_AND_RELEASE_PATH.md`, this file.

## Independent Master Review

An independent `code-reviewer` pass was run against this consolidation, given only the canonical inputs, raw inventory, deduplication rules, Global findings, and the three-sprint plan (no preferred count/verdict disclosed), and independently re-verified a sample of mappings directly against `DATA-001-BASELINE`, `VERIFICATION-ASSURANCE-001-BASELINE`, `MAINTAINABILITY-001-CONSOLIDATION`, `RELEASE-001-BASELINE`, and `SECURITY-001-BASELINE`.

**Verdict: ADJUST (minor, cosmetic) — applied.**

The reviewer found no over-deduplication, no under-deduplication, no double-counting of Architecture/Code Quality evidence, no Consumer-Impact-to-P-severity conversion, no NOT-VERIFIED-treated-as-FAIL, no severity inflation/understatement against source severities, no P0 inflation, no orphaned canonical finding, no speculative future score, and confirmed the sprint ordering/scope boundaries (Sprint 1 tight and data-integrity-focused, Sprint 2 not chasing every P4, Sprint 3 purely external/release, RELEASE-QA-001 assigned to the earliest reasonable sprint) as sound.

The one correction required: `05_DEDUPLICATION_LEDGER.md`'s "Reconciliation summary" listed only 5 reduction events (4 DUPLICATE ROOT CAUSE merges + 1 NOT MASTER BACKLOG exclusion), which arithmetically implies 37, not the stated and correct final count of 36 — the summary text omitted that RELEASE-QA-001's fold into GLOBAL-QA-001 (as a RELEASE CONSEQUENCE, not a DUPLICATE ROOT CAUSE) is itself a sixth reduction event. The final counts (36 unique Global findings, P0:0/P1:4/P2:7/P3:19/P4:6) were already correct throughout every other artifact — this was a self-consistency gap in one explanatory paragraph, not a miscount, mismapping, or lost finding. **Applied:** `05_DEDUPLICATION_LEDGER.md`'s Reconciliation summary now explicitly lists the RELEASE CONSEQUENCE fold as its own line item, with the full arithmetic (42 − 4 − 1 − 1 = 36) shown.

## Repository State

`git status --short` before and after this run is identical except for the new files created under `.audit/quality/runs/MASTER-001-CONSOLIDATION/`. No application source, test, config, workflow, or dependency file was changed. `.audit/state/FINDING_REGISTRY.md` was not read or modified. No historical baseline audit file was modified.

Commit: NOT DONE
Push: NOT DONE
