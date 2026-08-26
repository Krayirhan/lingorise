# 08 — Scorecard (REAUDIT)

Revision: `29ce04e` · Rubric: v1.0 (locked, reused from baseline) · Run: RUN-003-REAUDIT

| Domain | Weight | Score /10 | Weighted | Confidence | Δ vs. RUN-002-REAUDIT |
|---|---:|---:|---:|---|---:|
| Core product correctness | 16 | 9.0 | 14.40 | HIGH | 0.0 |
| Data integrity & persistence | 15 | 7.8 | 11.70 | MEDIUM-HIGH | 0.0 |
| Reliability & lifecycle management | 10 | 8.5 | 8.50 | HIGH | +0.7 |
| Testing & verification | 10 | 8.0 | 8.00 | HIGH | +1.5 |
| Security (auth + Firestore rules) | 10 | 8.6 | 8.60 | HIGH | 0.0 |
| Privacy | 6 | 7.5 | 4.50 | MEDIUM | 0.0 |
| Architecture & maintainability | 10 | 8.5 | 8.50 | HIGH | 0.0 |
| UX/usability | 8 | 8.0 | 6.40 | HIGH | 0.0 |
| Accessibility | 5 | 7.5 | 3.75 | MEDIUM-HIGH | 0.0 |
| Deployment/release engineering | 6 | 8.5 | 5.10 | HIGH | +3.0 |
| Dependency/supply-chain health | 4 | 7.5 | 3.00 | HIGH | 0.0 |

## Overall

**82.5 / 100** (RUN-002-REAUDIT: 78.5 / 100 → **Δ +4.0**)

(Baseline RUN-001: 71.3 / 100 → cumulative Δ +11.2 across both reaudits.)

## Score interpretation

This reaudit's movement is concentrated almost entirely in the two domains RUN-002-REAUDIT flagged as its one disclosed regression: Deployment/release engineering (+3.0) and Testing & verification (+1.5). Both moves are direct, evidence-backed reversals — CI was removed at RUN-002-REAUDIT time and is now restored, debugged through 11 real rounds of root-cause investigation, and confirmed genuinely green on the current `HEAD` commit, covering more ground (release build + real on-device e2e) than either prior run's CI was ever proven to cover. Reliability moved up a smaller amount (+0.7) on the strength of two real product-code fixes for unbounded network waits, discovered as a byproduct of the CI debugging but genuine independent of it. The remaining eight domains are unchanged — nothing in this delta touched their surface, and fresh re-execution of the global gates (`tsc`, `npm test`) confirms no silent regression anywhere.

## Material score movements explained

- **Deployment (+3.0)**: CI restored and proven green end-to-end on `HEAD` — typecheck, tests, rules tests, release build, and a real on-device Maestro flow, all passing. Not scored to 9+ because `main` has no branch-protection rule (CI is visible, not enforced) and the release APK still ships signed with the debug keystore (pre-existing, unresolved).
- **Testing (+1.5)**: the same CI restoration reverses RUN-002-REAUDIT's correction — "CI actually gates merges" is materially true again, more thoroughly than either prior run had verified.
- **Reliability (+0.7)**: two genuine unbounded-network-wait fixes (`catalogueService.ts`, `AppBootstrap.tsx`), verified present in current source and indirectly re-confirmed by `e2e-smoke`'s now-consistent pass.
- **All other domains (0.0)**: no code touched their surface this cycle; carried forward from `RUN-002-REAUDIT` with fresh-gate re-confirmation (300/300 tests, 0 `tsc` errors) that nothing regressed.

## Evidence limitations (updated)

Same global limitations as `RUN-002-REAUDIT/08_SCORECARD.md` (no production telemetry, iOS unbuildable from this checkout, `DATA-001`'s two-device test still unperformed, `ACC-001`'s remaining scope still untested). New this reaudit: `npm run test:rules` could not be executed live on this local machine (Java 8 present, JDK 21 required) — substituted with CI's own current, passing run of the identical command, disclosed as `NOT EXECUTED (local)` / `VERIFIED (CI)` rather than assumed.
