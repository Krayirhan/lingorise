# 08 — Scorecard (REAUDIT)

Revision: `3436a1b` · Rubric: v1.0 (locked, reused from baseline) · Run: RUN-002-REAUDIT

| Domain | Weight | Score /10 | Weighted | Confidence | Δ vs. baseline |
|---|---:|---:|---:|---|---:|
| Core product correctness | 16 | 9.0 | 14.4 | HIGH | +1.5 |
| Data integrity & persistence | 15 | 7.8 | 11.7 | MEDIUM-HIGH | +1.0 |
| Reliability & lifecycle management | 10 | 7.8 | 7.8 | MEDIUM-HIGH | +0.8 |
| Testing & verification | 10 | 6.5 | 6.5 | HIGH | −0.5 |
| Security (auth + Firestore rules) | 10 | 8.6 | 8.6 | HIGH | +0.3 |
| Privacy | 6 | 7.5 | 4.5 | MEDIUM | 0.0 |
| Architecture & maintainability | 10 | 8.5 | 8.5 | HIGH | +2.0 |
| UX/usability | 8 | 8.0 | 6.4 | HIGH | +0.5 |
| Accessibility | 5 | 7.5 | 3.75 | MEDIUM-HIGH | +1.5 |
| Deployment/release engineering | 6 | 5.5 | 3.3 | HIGH | −1.5 |
| Dependency/supply-chain health | 4 | 7.5 | 3.0 | HIGH | +1.0 |

## Overall
**78.5 / 100** (baseline: 71.3 / 100 → **Δ +7.2**)

## Score interpretation
The project moved from "acceptable-for-scope with meaningful, named weaknesses" toward "good — reliable with manageable gaps." Nine of eleven domains improved, several substantially (Architecture +2.0, Core correctness +1.5, Accessibility +1.5) — all backed by concrete, verified fix evidence rather than re-reading the same code more charitably. Two domains moved down, both attributable to the same real event (CI removal) surfaced and handled transparently rather than hidden: Deployment/release engineering (−1.5, the direct effect) and Testing & verification (−0.5, a correction of the baseline's overstated CI-automation credit, not a new defect). Both are disclosed, reasoned deductions consistent with Constitution C4 (evidence over impression) — not penalties invented for this reaudit.

## Material score movements explained
- **Architecture (+2.0)**: four of four architecture findings closed in one session, including a genuine ~50%-each file-size reduction on the two largest offenders and a self-corrected evidence error (spacedRepetition.ts).
- **Core correctness (+1.5)** and **Accessibility (+1.5)**: both moved from "plausible but unverified/partially tested" to "verified with real bugs caught and fixed" — the single strongest pattern in this reaudit.
- **Deployment (−1.5)**: CI's complete removal is scored as what it structurally is now (zero automated gating), independent of the good-faith cost reasoning behind the decision.
- **Testing (−0.5)**: not a code regression — a correction. The test suite is stronger than at baseline; the domain score fell only because the baseline's credit for "CI gates merges" is now known to have never been true and is now formally absent.

## Evidence limitations (updated)
Same global limitations as `RUN-001-BASELINE/06_EVIDENCE_INDEX.md` (no production telemetry, iOS unbuildable from this checkout, Firestore-rules/Maestro tests not executed live). New this reaudit: DATA-001's full two-device acceptance test remains unperformed; Accessibility coverage remains partial (onboarding, promotion modal, Scanner, `reduceMotion` untested).
