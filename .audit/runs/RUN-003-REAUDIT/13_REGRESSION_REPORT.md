# 13 — Regression Report

## Method

For every finding closed as of `RUN-002-REAUDIT`, re-verified evidence fresh this reaudit pass (not trusted from the FIX logs alone): re-ran `tsc`/`npm test`, re-read the two changed source files directly, cross-checked `git diff --stat` against the full commit range to confirm no other files were silently touched, and independently queried the live CI state via `gh run view` against the exact evaluated revision rather than trusting the FIX-2026-08-25-09 README's own claim about an earlier commit.

## Regressions in previously-closed findings

**None found.** All findings marked `CLOSED`/`ACCEPTED_RISK` as of `RUN-002-REAUDIT` were re-confirmed intact on fresh evidence this pass:
- `CORE-001/002/003`, `DATA-002`, `REL-001`, `ARCH-001/002/003/004`, `SEC-002`, `ACC-002/003/004`, `DEP-001` — none of these files appear in `git diff --stat 3436a1b..29ce04e`, so none could have regressed; re-confirmed via the fresh 300/300 test run (same count, same suite) and fresh `tsc` (0 errors).
- `DEPLOY-001` — specifically re-verified against the *current* `HEAD` commit (`29ce04e`, run `32900631213`), not just the commit the original closure evidence cited (`1b616e0`, run `32899393092`), to rule out the possibility that the one subsequent commit (documentation-only, per `git diff --stat` — only `.audit/` files changed) had somehow broken CI again. It had not: the newer run is also fully green.

## Regressions in test/build health

**None.** `npm test` returns 300/300 (identical count to `RUN-002-REAUDIT`, confirming no test was silently removed or broken by the CI-debugging commits). `tsc --noEmit` returns 0 errors. CI's `android-build`/`e2e-smoke` jobs (which run the equivalent of a release build) are green on the current revision.

## New defects discovered as a byproduct of other work

**None new this cycle from a dedicated review pass** — the 2 new observations recorded in `09_FINDINGS.md` (`DEPLOY-002`, `SEC-003`) were surfaced by this reaudit's own required re-examination of CI/security posture given the public-repo change (per the reaudit protocol's step 5, "does making the repo public introduce any exposure finding"), not discovered as a side effect of the FIX-2026-08-25-09 session's own work. Both are low-severity (P4) and neither traces to a code regression.

## Risk of the CI-debugging changes themselves

The two product-code changes made during CI debugging (`catalogueService.ts`, `AppBootstrap.tsx`) were reviewed specifically for whether the CI-driven motivation introduced any hidden downside for real users:
- Both changes are purely additive (a timeout race added around an existing call, a fallback timer added around an existing subscription) — neither removes or alters the original success-path behavior.
- Both were verified in `FIX-2026-08-25-09` to not regress the normal (fast-network) case (local rebuild/reinstall showed ~6-second normal render time, no crash, no behavior change), and this reaudit independently re-confirmed the timeout code is genuinely present and unmodified since.
- No plausible failure mode was identified where the 8-second fallback could fire incorrectly on a healthy connection (both timers are cleared immediately if the real callback/response arrives first).

## Conclusion

Clean delta: broad, verified improvement in the two domains RUN-002-REAUDIT flagged as regressed (Deployment, Testing), a real reliability improvement as a side benefit, zero regressions in previously-closed findings, zero regressions in test/build health, and two new but low-severity, non-blocking findings from the audit's own required re-examination of the public-repo change — not from any new breakage.
