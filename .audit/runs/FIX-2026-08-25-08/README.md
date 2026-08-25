# FIX-2026-08-25-08

MODE: FIX (reversal of a reversal, user-directed)
Source: DEPLOY-001, FIX-2026-08-25-05

## Context
`FIX-2026-08-25-05` removed `.github/workflows/ci.yml` entirely after discovering the account's GitHub Actions spending limit was exhausted (private repo), causing every CI run to fail instantly without executing. The user has since directed making the repository public (`gh repo edit Krayirhan/lingorise --visibility public`, confirmed via `gh repo view` → `isPrivate: false`) — GitHub Actions is free and effectively unlimited for public repositories, so the cost constraint behind DEPLOY-001's `ACCEPTED_RISK` status no longer applies.

## Action taken
Recreated `.github/workflows/ci.yml` identically to the version added in `FIX-2026-08-25-04` (three jobs: `verify` — typecheck/test/rules-test; `android-build` — `gradlew assembleRelease`; `e2e-smoke` — `gradlew assembleDebug` + Maestro on an emulator via `reactivecircus/android-emulator-runner`). YAML re-validated with `js-yaml` — parses cleanly, all three jobs present.

## Status
`DONE`, not yet `VERIFIED` — the workflow has not been observed completing a live run on GitHub Actions yet (that requires the push this action accompanies). Once pushed, watch `gh run list`/`gh run watch` for the actual result; if any job fails for environment reasons (not a code issue), that is a new, separate finding, not evidence this action failed.

## Files changed
- `.github/workflows/ci.yml` (recreated)
