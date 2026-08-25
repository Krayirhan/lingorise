# 13 — Regression Report

## Method
For every finding closed since baseline, re-verified evidence fresh this reaudit pass (not trusted from the FIX logs alone): re-ran `tsc`/`npm test`, re-read the changed source files, and — for the accessibility and UX-facing changes — re-installed and re-launched the current release build on-device with a clean `logcat` check.

## Regressions in previously-closed findings
**None found.** All 10 findings marked `CLOSED` since baseline were re-confirmed closed on fresh evidence this pass:
- `CORE-001`, `CORE-002`, `CORE-003` — all associated tests still present and passing in the 300/300 fresh run.
- `DATA-002`, `REL-001` — source re-read, fixes intact.
- `ARCH-001`, `ARCH-002`, `ARCH-003`, `ARCH-004` — source re-read, no reversion; `ARCH-003`'s on-device rendering re-confirmed unchanged from its original fix verification.
- `SEC-002` — `.env.example` re-read, placeholders intact.

## Regressions in test/build health
**None.** `npm test` returns 300/300 (the same count as when each fix was individually verified — no test was silently removed or broken by a later change). `tsc --noEmit` returns 0 errors. `gradlew assembleRelease` succeeds and the resulting APK installs and launches without crash.

## New defects discovered as a byproduct of other work
Three (`ACC-002`, `ACC-003`, `ACC-004`) — all discovered during the dedicated `ACT-ACC-001` accessibility pass, not as a side effect of any *other* fix in this cycle. All three were fixed and verified within the same pass; none were introduced by an earlier fix in this same reaudit cycle (each traces to pre-existing code that simply had never been tested with a real accessibility service or at maximum font scale before this session).

## One genuine, deliberate capability regression (disclosed, not hidden)
**CI/CD automation went from (assumed) present to confirmed entirely absent.** This is not a code regression and not something a diff-based regression check would normally flag (no source file "broke") — it is a process/infrastructure regression, fully attributable to a specific, traceable cause (GitHub Actions account billing block, discovered via `gh run list`) and a specific, deliberate decision (the account owner directed removal rather than paying to fix it). It is reflected in the `Deployment/release engineering` and `Testing & verification` domain score changes in `12_DELTA_REPORT.md`, and as a standing condition in `11_RELEASE_VERDICT.md` — not omitted from this report merely because it resulted from an explicit instruction rather than an accidental code change.

## Conclusion
This reaudit found a clean delta: broad, verified improvement across most domains, one disclosed and reasoned regression (CI), zero silent regressions, and three new-but-immediately-closed accessibility findings that reflect increased scrutiny finding real pre-existing issues, not new breakage.
