# FIX-2026-08-25-05

MODE: FIX (reversal, user-directed)
Source run: RUN-001-BASELINE / FIX-2026-08-25-04

## Context

Immediately after pushing FIX-2026-08-25-04 (the CI `android-build`/`e2e-smoke` gates for `ACT-DEPLOY-001`), inspection via `gh run list` revealed that **every CI run on this repository has failed identically since at least Sprint 6** (`2026-08-24T19:02` onward, and continuing through this session's own pushes) with:

```
The job was not started because an Actions budget is preventing further use.
```

The repository is private, and the account's GitHub Actions spending limit/budget is exhausted — every job (including the pre-existing `verify` job, unrelated to this session's changes) is rejected before it can run. The user reported this had already cost them significant money and asked to stop using GitHub Actions entirely ("action kısmı benim çok para yedi bunu kullanmadan gidemez miyiz").

## Action taken

**Removed `.github/workflows/ci.yml` entirely** (including the original `verify` job, not just the two jobs added in FIX-2026-08-25-04) — per the user's explicit instruction, no GitHub Actions workflow remains in the repository, so no further pushes can trigger any Actions usage or cost.

## Consequence for the audit record

This reverses `ACT-DEPLOY-001` and materially changes the evidence behind two findings/domains from `RUN-001-BASELINE`:

- **`DEPLOY-001`**: status changed from `PARTIAL` to `ACCEPTED_RISK`. The underlying gap (no automated gate on typecheck/tests/rules-tests/build/E2E) is *not* closed — it is explicitly and permanently un-automated by the account owner's decision, for a real, disclosed reason (GitHub Actions cost). Verification for every future change reverts fully to the manual discipline already used throughout this session: `npx tsc --noEmit`, `npm test`, a local release build, and an on-device smoke pass before each commit.
- **`06_EVIDENCE_INDEX.md` / `07_DETAILED_AUDIT.md` (Testing & verification, Deployment/release domains)**: the baseline audit's evidence `E-TEST-01` stated CI "runs typecheck + test + rules-test... automated, not manual-only" — this was based on the workflow file's existence and correct syntax, not on an observed successful run. That claim is now known to have been wrong in practice: CI had never actually executed successfully on this repository at any point evidenced by `gh run list`, for reasons unrelated to code quality (an account billing limit). This does not retroactively change the RUN-001-BASELINE score (immutable per Constitution C10), but is recorded here as a correction for any future re-audit to account for: the "Testing & verification" and "Deployment/release engineering" domain scores in RUN-001-BASELINE credited CI's existence at a level of automation that was never actually in effect.

## Not done

No attempt was made to fix the underlying GitHub billing/Actions-budget issue — that is an account-level setting only the account owner can change (GitHub Settings → Billing → Actions spending limit), and is explicitly out of scope per the user's own request to stop using Actions rather than pay to enable it.

## Files changed
- `.github/workflows/ci.yml` (deleted)
