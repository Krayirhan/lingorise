# 12 — Delta Report

RUN-002-REAUDIT (`3436a1b`) → RUN-003-REAUDIT (`29ce04e`) · Rubric v1.0 (unchanged, directly comparable)

## Score delta

| Domain | Previous | Current | Δ | Confidence | Main reason |
|---|---:|---:|---:|---|---|
| Core product correctness | 9.0 | 9.0 | 0.0 | HIGH | No change in surface; 300/300 re-confirmed. |
| Data integrity & persistence | 7.8 | 7.8 | 0.0 | MEDIUM-HIGH | DATA-001 untouched, still PARTIAL. |
| Reliability & lifecycle management | 7.8 | 8.5 | +0.7 | HIGH | Two unbounded-network-wait fixes (catalogueService.ts, AppBootstrap.tsx), verified present and indirectly confirmed via CI's now-passing e2e-smoke. |
| Testing & verification | 6.5 | 8.0 | +1.5 | HIGH | CI restored and confirmed genuinely green — reverses the prior correction for CI's absence. |
| Security | 8.6 | 8.6 | 0.0 | HIGH | firestore.rules/auth unchanged; public-repo secret-exposure re-check found nothing new (2 new low-severity observations recorded as findings, not score deductions). |
| Privacy | 7.5 | 7.5 | 0.0 | MEDIUM | No change. |
| Architecture & maintainability | 8.5 | 8.5 | 0.0 | HIGH | The two touched files are narrowly-scoped additive changes; no new layering/size issues. |
| UX/usability | 8.0 | 8.0 | 0.0 | HIGH | No change; reliability fixes scored under Reliability instead. |
| Accessibility | 7.5 | 7.5 | 0.0 | MEDIUM-HIGH | ACC-001 untouched, still PARTIAL. |
| Deployment/release engineering | 5.5 | 8.5 | +3.0 | HIGH | CI restored, debugged through 11 real rounds, and confirmed green end-to-end on the current HEAD — a direct reversal of RUN-002-REAUDIT's one disclosed regression, with stronger evidence than either prior run had. |
| Dependency/supply-chain health | 7.5 | 7.5 | 0.0 | HIGH | No dependency changes this cycle. |

**Overall: 78.5 → 82.5 (Δ +4.0)**

## Finding delta

- **Closed** (re-confirmed, none newly closed this cycle beyond DEPLOY-001 which was already closed and is now re-confirmed on stronger, current-revision evidence): `DEPLOY-001`.
- **Newly opened** (2, both P4): `DEPLOY-002` (no branch protection on `main`), `SEC-003` (secret scanning disabled on now-public repo).
- **Accepted risk removed** (1): `DEPLOY-001`'s prior `ACCEPTED_RISK` status is superseded — its own documented re-review trigger ("the repository is made public") occurred, and CI is now restored and green, so this is a genuine closure, not merely a re-review.
- **Still open / partial** (2, unchanged): `DATA-001`, `ACC-001` — neither touched by this delta.
- **Invalidated** (0): none.

## Action delta

| Status | Count | IDs |
|---|---:|---|
| Unchanged, still open | 2 | ACT-DATA-001-VERIFY, ACT-ACC-001-CONTINUE |
| Newly added (P4) | 2 | ACT-DEPLOY-002, ACT-SEC-003 |
| Reversed (accepted risk → resolved) | 1 | DEPLOY-001's no-CI accepted risk |

## Regression delta

See `13_REGRESSION_REPORT.md` — **zero regressions detected**, including in the CI/deployment area that was itself the site of the most change. The one prior disclosed regression (CI removal, from RUN-002-REAUDIT) is itself the thing that reversed this cycle.

## Improvement attribution

Every domain movement above is attributed to specific, independently-verified evidence gathered fresh this reaudit (a live `gh run view` against the exact evaluated revision, direct reads of the two changed source files, fresh `tsc`/`npm test` runs) — not accepted from the FIX-2026-08-25-09 README's own claims without independent re-check. The CI-green claim in particular was verified against `HEAD` (`29ce04e`, run `32900631213`), one commit newer than the FIX log's own cited passing run (`1b616e0`, run `32899393092`), confirming the green state held through the subsequent documentation-only commit rather than being stale by the time of this reaudit.

## Rubric-version note

Not applicable — rubric v1.0 was reused unchanged across all three runs, so this delta (and the cumulative delta back to `RUN-001-BASELINE`) is a direct, valid comparison with no version-mismatch caveat required.
