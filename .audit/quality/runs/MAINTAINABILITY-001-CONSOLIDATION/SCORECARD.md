# MAINTAINABILITY-001-CONSOLIDATION — Canonical Scorecard

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

This is a reconstruction from the canonical rubric, not an average of the two input evidence scores (Architecture 90/100, Code Quality 89/100).

## Dimension scorecard

| Dimension | Max | Score | Lost | Canonical root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Architecture boundaries & dependency direction | 15 | 13 | 2 | MAINT-QA-002 | E2 | HIGH |
| State / responsibility ownership | 15 | 15 | 0 | No concrete canonical finding maps here — both source audits' STATE_OWNERSHIP_MATRIX/ownership evidence confirmed a genuinely clear single-owner model (`UserData` via `useUserProgress`, `activeSession`, catalogue global); the schema-drift issue (MAINT-QA-001) is a duplication/change-isolation concern about the *cloud sync field list*, not about who owns runtime state, so it is not charged here to avoid re-spreading one root cause across a third dimension | E2 | HIGH |
| Change isolation & modularity | 15 | 12 | 3 | MAINT-QA-001 (secondary component — the change-blast-radius consequence of the schema drift) | E2 | HIGH |
| Complexity & implementation readability | 15 | 15 | 0 | No concrete canonical finding maps here — the Code Quality audit's own -1 token in this dimension was not tied to a demonstrated defect (it was an explicit "didn't check everything" confidence note), so it is not carried into the canonical score per the rule that every lost point must map to a concrete root cause | E1 (absence of finding, not evidence of a problem) | HIGH |
| Knowledge centralization / duplication | 15 | 10 | 5 | MAINT-QA-001 (primary component) | E2 | HIGH |
| Type safety & change safety | 10 | 8 | 2 | MAINT-QA-004 (reduced from an initial -3 by independent review: carrying Code Quality's own -3/15 [20% of a 15-pt dimension] proportionally into this combined 10-pt dimension is -2, not -3 — the initial draft over-weighted it by compressing dimension size without adjusting proportionally) | E2 | HIGH |
| API / side-effect clarity | 10 | 9 | 1 | MAINT-QA-005 | E2 | HIGH |
| Legacy code / structural hygiene | 5 | 3 | 2 | MAINT-QA-003 (reduced from an initial -3 by independent review: spending 60% of a small dedicated 5-pt dimension on a P4-severity finding was disproportionate; -2 is a more proportionate weight for a confirmed-but-minor dead-code cluster) | E2/E3 | HIGH |
| **TOTAL** | **100** | **85** | **15** | | | |

## Score-loss ledger by canonical root cause (exposes double-counting)

| Root cause | Dimensions affected | Per-dimension deduction | Total canonical impact |
|---|---|---|---|
| MAINT-QA-001 (schema drift) | Knowledge centralization -5, Change isolation -3 | -5, -3 | **-8** |
| MAINT-QA-002 (service-boundary bypass) | Architecture boundaries -2 | -2 | **-2** |
| MAINT-QA-003 (dead/legacy cluster) | Legacy code -2 | -2 | **-2** |
| MAINT-QA-004 (type-safety cast) | Type safety & change safety -2 | -2 | **-2** |
| MAINT-QA-005 (API-signature clarity) | API/side-effect clarity -1 | -1 | **-1** |
| **TOTAL DEDUCTION** | | | **-15** |

**100 − 15 = 85/100.**

## Why this is not a double-count of the two source audits

- MAINT-QA-001's combined source deductions were Architecture's 6 points (Cohesion -4, State ownership -1, Modularity -1, post-review) + Code Quality's 3 points (Duplication -2, Change safety -1) = 9 raw points across two independent audits for the *same underlying fact*. The canonical reconstruction assigns this root cause a single, deliberately chosen total of -8 across exactly two dimensions (not three) — combining the two audits' own deliberately-light internal treatments into one properly-weighted treatment, landing just under their naive sum rather than re-adding both in full.
- MAINT-QA-003's combined source deductions were Architecture's 2 points (its share of Module boundaries) + Code Quality's 3 points (Dead/legacy code) = 5 raw points. Independent review flagged that spending 60% of the dedicated 5-point Legacy-code dimension on a P4-severity finding was disproportionate regardless of the combined source total; the canonical weight was corrected to -2, proportionate to the finding's own P4 severity rather than to the raw source-point sum.
- MAINT-QA-004 originated from Code Quality alone (-3 out of its own 15-point Type-safety dimension, 20% of that dimension). Carrying that percentage proportionally into this consolidation's smaller combined 10-point "Type safety & change safety" dimension is -2, not a flat -3 — independent review caught that naively copying the absolute point value across a resized dimension inflates the finding's relative weight.
- MAINT-QA-002 and MAINT-QA-005 each originated from only one source audit and map cleanly to one dimension each, so their canonical weight is a direct, proportionate carry-through of that single audit's own finding.

## Why the score sits below both evidence scores (85 < 89, 85 < 90)

This is not an averaging artifact (an average would be 89.5, and 85 was reached through an itemized, reviewed deduction ledger, not arithmetic averaging). The gap is explained specifically by MAINT-QA-001 (schema drift): both source audits observed the exact same underlying defect from different angles and each, working alone, deliberately kept its own treatment light on the assumption that a future consolidation (or the other audit) would account for it properly — neither fully "owned" the deduction on its own. Consolidation is the point where that root cause's combined, non-duplicated weight is assigned exactly once. Combining two independently-light single-audit treatments into one properly-weighted treatment (rather than each staying artificially light, or the two being summed in full) is what pulls the canonical score below either individual evidence score — not because two confirmations make a defect "worse," but because the true cost of a real, already-demonstrated defect was never fully charged by either audit alone.
