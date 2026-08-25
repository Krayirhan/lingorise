# 08 — Scorecard

Revision: `4a80283` · Rubric: v1.0 (locked) · Run: RUN-001-BASELINE

| Domain | Weight | Score /10 | Weighted contribution | Confidence | Main evidence |
|---|---:|---:|---:|---|---|
| Core product correctness | 16 | 7.5 | 12.0 | HIGH | E-CORE-01, E-CORE-02, E-CORE-03 |
| Data integrity & persistence | 15 | 6.8 | 10.2 | MEDIUM-HIGH | E-DATA-01, E-DATA-02, E-DATA-03, E-DATA-04 |
| Reliability & lifecycle management | 10 | 7.0 | 7.0 | MEDIUM-HIGH | E-REL-01, E-REL-02 |
| Testing & verification | 10 | 7.0 | 7.0 | HIGH | E-CORE-01, E-TEST-01, E-TEST-02 |
| Security (auth + Firestore rules) | 10 | 8.3 | 8.3 | HIGH | E-DATA-03, E-SEC-01, E-SEC-02 |
| Privacy | 6 | 7.5 | 4.5 | MEDIUM | E-DATA-04, E-SEC-01 |
| Architecture & maintainability | 10 | 6.5 | 6.5 | HIGH | E-ARCH-01, E-ARCH-02, E-ARCH-03 |
| UX/usability | 8 | 7.5 | 6.0 | MEDIUM | E-DEPLOY-01 |
| Accessibility | 5 | 6.0 | 3.0 | MEDIUM | `09-accessibility.md` DoD cross-check + grep spot-check |
| Deployment/release engineering | 6 | 7.0 | 4.2 | HIGH | E-TEST-01, E-DEPLOY-01 |
| Dependency/supply-chain health | 4 | 6.5 | 2.6 | LOW-MEDIUM | E-DEPS-01 (no vulnerability scan executed) |

## Overall
**71.3 / 100**

## Score interpretation
This lands in the rubric's "acceptable-for-scope with meaningful, named weaknesses" band (anchor 6-7 per domain, per `10_SCORING_PROTOCOL.md`), not "fragile" and not "production-grade with excellent evidence." The project's genuine strengths — a rigorously tested SRS/gamification core, correctly-scoped Firestore authorization, a real local-first data architecture, and a release pipeline that was independently verified to actually work this session — pull the score well above the midpoint. It is held below "strong" (8+) by a small number of specific, verified issues concentrated in exactly the areas that matter most for this product (one real streak-correctness bug, one plausible cold-start data-race, two untested load-bearing functions, two dead files, and an accessibility implementation that is real but has never been confirmed working with an actual screen reader).

## Material deductions
1. **`CORE-001`** — streak resets on non-`+1`-day clock diffs (verified, P1) — the largest single deduction from Core product correctness.
2. **`DATA-001`** — cold-start local-storage race between `AppBootstrap` and `useUserProgress.init()` (MEDIUM confidence, P1) — the largest deduction from Data integrity.
3. **Untested load-bearing logic** (`CORE-002`/`CORE-003`) — deducted from both Core correctness and Testing, without double-counting the same evidence at full weight in both (per no-double-counting rule, each domain's deduction reflects that domain's own distinct angle: Core = "a wrong value would ship silently," Testing = "the verification gap itself").
4. **Unverified accessibility claims** — Accessibility capped at 6.0 specifically because the project's own DoD checklist shows zero of five verification steps confirmed, despite substantial implementation code existing.
5. **Two dead files** (`ARCH-001`) and **two oversized multi-responsibility screens** (`ARCH-003`) — moderate Architecture deduction.

## Evidence limitations
- No `npm audit` executed (Dependency health scored conservatively, not penalized to zero).
- Firestore rules tests and the Maestro E2E suite were evaluated by direct source reading, not live execution, this run.
- No production crash-reporting data exists to corroborate reliability findings against real-world incident rates.
- UX and Accessibility scores rely on a partial manual walkthrough and the project's own prior audit trail, respectively, not an exhaustive independent re-audit of every screen.
- See `06_EVIDENCE_INDEX.md` for the full limitations list.
