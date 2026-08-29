# DATA-001-BASELINE — FINAL RESULT (CANONICAL)

**This file is the canonical score source for DATA-001-BASELINE. Future Master Consolidation and reaudits should read this file, not `SUMMARY.md` alone, for the authoritative score/severity counts.**

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Data Integrity / Offline / Sync: 74/100

Confidence: HIGH

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 2 |
| P2 | 1 |
| P3 | 1 |
| P4 | 0 |

**DATA-QA-002 final severity: P1**

## How this result was reached

1. **Original independent audit** (`SUMMARY.md`) produced a provisional score, then the audit's independent reviewer escalated DATA-QA-002 from P1 to P0 (reasoning: perceived frequency/silence of the trigger), pushing the Merge/conflict deduction from −10 to −14 and the total from 75 to **70/100**.
2. **A dedicated severity adjudication** (`SEVERITY_ADJUDICATION.md`) was then run specifically to re-test that P0 escalation against the audit's own severity bar, using a second, independent adjudicator given only source access and the severity definitions (no prior verdict, no expected score). The adjudicator confirmed: core progress (XP, streak, per-word `learningProgress`, solved/rewarded questions, badges) is architecturally protected in the same merge function and cannot be lost via this defect; only secondary/derived fields (`passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate`) are at risk; the trigger requires a specific three-part combination rather than ordinary operation; and every affected field has a reasonable recovery path. This does not meet the P0 bar ("widespread destruction of core progress," "predictably destroys major portions," "irreversible across a broad population," "no reasonable recovery path," "fundamental persisted state cannot be trusted") — it matches **P1** ("reachable serious progress loss/corruption").
3. **The P0→P1 reversal was accepted**, restoring the Merge/conflict deduction to its original breadth-justified −10/25 (unrelated dimensions were left untouched, per the adjudication's own scope limit). Recomputing the total with only that one dimension changed yields the canonical score below.

## Canonical Scorecard

| Dimension | Max | Score | Lost |
|---|---|---|---|
| Local persistence & recovery | 15 | 14 | 1 |
| Schema migration & normalization | 15 | 14 | 1 |
| Cloud synchronization | 20 | 12 | 8 |
| Merge/conflict correctness | 25 | 15 | 10 |
| Offline & partial-failure safety | 15 | 14 | 1 |
| Data lifecycle / deletion / reset | 10 | 5 | 5 |
| **TOTAL** | **100** | **74** | **26** |

## Findings (canonical severities)

| ID | Title | Severity |
|---|---|---|
| DATA-QA-002 | Login/cold-start merge silently discards a passed level exam (and related same-day/history state) via an incomplete field-merge list | **P1** (locked; was briefly P0 during initial review, overturned by independent adjudication) |
| DATA-QA-001 | A failed remote fetch during merge is indistinguishable from "no remote data," risking a local-over-remote overwrite | P1 |
| DATA-QA-003 | "Irreversible" local data reset is silently undone by the next merge for signed-in users | P2 |
| DATA-QA-004 | Account deletion can orphan a live Auth account with already-deleted Firestore data if Auth deletion fails after Firestore deletion succeeds | P3 |

## Immutable evidence chain

Both source artifacts remain unmodified and stand as the immutable evidence trail behind this canonical result:
- `.audit/quality/runs/DATA-001-BASELINE/SUMMARY.md` — original independent audit (documents the 70/100 provisional result and the first reviewer's P0 reasoning, preserved as-is)
- `.audit/quality/runs/DATA-001-BASELINE/SEVERITY_ADJUDICATION.md` — the dedicated adjudication that overturned the P0 escalation (preserved as-is)
- `.audit/quality/runs/DATA-001-BASELINE/DATA_INVARIANT_MATRIX.md`, `MERGE_MATRIX.md`, `OFFLINE_SYNC_MATRIX.md` — supporting evidence, unchanged

This file does not alter or supersede the content of those artifacts — it is a derived, canonical summary reconciling them into a single authoritative score for downstream consumption.
