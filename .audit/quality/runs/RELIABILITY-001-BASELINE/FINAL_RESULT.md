# RELIABILITY-001-BASELINE — FINAL RESULT (CANONICAL)

**This file is the canonical score source for RELIABILITY-001-BASELINE. Future Master Consolidation, fix planning, and future Reliability reaudits should read this file, not `SUMMARY.md` alone, for the authoritative score/severity counts.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Reliability / Recovery: 88/100

Confidence: HIGH

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 3 |
| P4 | 1 |

## How this result was reached

1. **Independent baseline audit** (`SUMMARY.md`) produced a provisional score of **88/100** across the six-dimension rubric (Startup/state recovery, Async & race safety, Network/service failure handling, Practice/exam runtime resilience, Persistence failure recovery, User-visible error/escape paths), with four findings (REL-QA-001 through REL-QA-004).
2. **`code-reviewer` (primary independent reviewer) — verdict ADJUST — accepted.** It confirmed all four findings as real and reachable, and adjusted two severity labels without changing the final score: REL-QA-001 (P3→P4, the catalogue-load race's actual blast radius is a per-level content-freshness regression, not cross-level content corruption) and REL-QA-003 (P4→P3, the silent reset/clear failure is more consequential than initially scored, being a deliberate trust-sensitive action inconsistent with the codebase's own boolean-signal pattern). REL-QA-002 and REL-QA-004 were confirmed at P3 as originally scored.
3. **`test-reviewer`'s test-coverage assessment** was correctly kept outside the Reliability score — verification gaps in `tests/testSuite.ts` (e.g. no executed coverage of `AsyncStorage`-touching code, session-restore, or auth/service rejection paths) were recorded as confidence context in `SUMMARY.md`'s "Known limitations" section, not deducted as defects, per the audit's own anti-double-punishment rule.
4. **Cross-domain observations** (CORE-QA-002 session-restore duplicate-answer, DATA-QA-002 merge field-list, DATA-QA-004/SEC-QA-003 account-deletion partial failure) were correctly excluded from this score — each was independently verified to produce no distinct reliability crash/dead-end, so no double-counting against their existing CORE-001/DATA-001/SECURITY-001 scores occurred.
5. **88/100 is therefore the canonical locked Reliability baseline.** `SUMMARY.md` remains unmodified and stands as the immutable evidence trail behind this result; this file is additive only.

## Canonical Scorecard

| Dimension | Max | Score | Lost |
|---|---|---|---|
| Startup / state recovery | 15 | 13 | 2 |
| Async & race safety | 20 | 18 | 2 |
| Network / service failure handling | 15 | 14 | 1 |
| Practice / exam runtime resilience | 20 | 19 | 1 |
| Persistence failure recovery | 15 | 12 | 3 |
| User-visible error / escape paths | 15 | 12 | 3 |
| **TOTAL** | **100** | **88** | **12** |

## Findings (canonical severities)

| ID | Title | Severity |
|---|---|---|
| REL-QA-004 | Cloud-sync failures are console-only and not surfaced to the user | **P3** |
| REL-QA-003 | Reset/clear-data failures can be silently swallowed without user signal | **P3** |
| REL-QA-002 | `ErrorBoundary` restart action does not actually reload/remount | **P3** |
| REL-QA-001 | Catalogue-loading effect has no request-ordering guard; a rapid level-switch race can regress that level's content freshness | **P4** (locked; was briefly framed as P3 in the initial draft, adjusted down by independent review to reflect its narrower actual blast radius) |

## Immutable evidence chain

`SUMMARY.md` (and its supporting `RELIABILITY_INVARIANT_MATRIX.md`, `FAILURE_RECOVERY_MATRIX.md`, `ASYNC_RACE_MATRIX.md`) remain unmodified and stand as the immutable evidence trail behind this canonical result. This file does not alter or supersede their content — it is a derived, canonical summary reconciling them into a single authoritative score for downstream consumption, matching the pattern already established by `DATA-001-BASELINE/FINAL_RESULT.md` and `SECURITY-001-BASELINE/FINAL_RESULT.md`.
