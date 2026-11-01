# PR and CI Evidence

## Pull Request

`release/lingorise-rc1` → `main`, **PR #2**: https://github.com/Krayirhan/lingorise/pull/2
Title: "Release: LingoRise RC1 preparation"
Head SHA at creation: `28b47dbe3c2714a2f82253092ca5e8d159a3db18`

## Branch protection — required checks (from `main`'s live ruleset, established in Sprint 3)

`verify`, `android-build`, `e2e-smoke` (strict — branch must be up to date).

## CI run tested against the exact release branch SHA

Run ID `33263889909`, triggered by the push to `release/lingorise-rc1`, **head SHA `28b47dbe3c2714a2f82253092ca5e8d159a3db18`** — the exact PR revision, not a prior committed baseline.

| Check | Status | Duration | Run/Job URL |
|---|---|---|---|
| `verify` | **pass** | 43s | https://github.com/Krayirhan/lingorise/actions/runs/33263889909/job/99130373789 |
| `android-build` | **pass** | 9m16s | https://github.com/Krayirhan/lingorise/actions/runs/33263889909/job/99130373936 |
| `e2e-smoke` | **pass** | 10m12s | https://github.com/Krayirhan/lingorise/actions/runs/33263889909/job/99130373894 |
| `Analyze (javascript-typescript)` (CodeQL, non-required) | **pass** | 1m2s | https://github.com/Krayirhan/lingorise/actions/runs/33263888975/job/99130373127 |
| `CodeQL` (non-required, status check placeholder) | **pass** | 3s | https://github.com/Krayirhan/lingorise/runs/99130483003 |

All 3 **required** checks passed on the exact tested revision. The 2 CodeQL-related checks are not part of branch protection's required list but ran and passed anyway — a positive additional signal, not treated as required for the merge gate.

`gh pr view 2 --json mergeable,mergeStateStatus` after CI completion: `{"mergeable":"MERGEABLE","mergeStateStatus":"CLEAN"}` — confirms branch protection considered the PR fully satisfied, no bypass was needed or used.

## Principle satisfied

**THE EXACT RELEASE BRANCH SHA WAS TESTED** — verified directly from the CI run's own `headSha` field matching the PR's head SHA at merge time, not inferred from prior baseline CI history (the prior 8/8 green runs at `16b9aab` are a separate, older fact and were not relied upon here).

## Post-merge CI on `main` (Section 17) — one transient failure, classified and reconfirmed

After the merge, `main`'s own push-triggered `CI` workflow ran again at the merge commit `82adb7719b833f1198c5a2129ae63bf1f9ca48f7` (run `33264428895`). First attempt:

| Job | Conclusion |
|---|---|
| `verify` | success |
| `android-build` | success |
| `e2e-smoke` | **failure** |

**Failure classification: ENVIRONMENT DEFECT (transient, not caused by any Sprint 1/2/3 change).** The `Install Maestro CLI` step's log shows: `curl: (22) The requested URL returned error: 504` followed by `Downloaded zip archive is corrupt.` — a transient upstream 504 from Maestro's install CDN (`get.maestro.mobile.dev`) during the download, not a logic error in the pinned-version change (`MAESTRO_VERSION: 2.9.0` was correctly passed as an env var; the request itself simply timed out server-side). This is not a product/test defect: the exact same commit's content had already passed `e2e-smoke` cleanly on the `release/lingorise-rc1` branch minutes earlier (`04_PR_AND_CI_EVIDENCE.md`'s pre-merge table above), and no code was changed between that run and this one.

**Confirmation, not a patch:** per Section 15 ("classify failure first... do not immediately patch unrelated code"), the failed job was re-run as-is via `gh run rerun 33264428895 --failed` (no workflow/config edit). Result: **all 3 jobs passed** (`verify`, `android-build`, `e2e-smoke` all `success`) on the identical commit, confirming the first failure was genuinely transient and not reproducible. No commit was added to the release branch or `main` for this — nothing needed fixing.

This does not affect the PASS status of the source-revision lock: the merge gate itself was satisfied by the pre-merge PR CI run (which never encountered this flake), and this post-merge observation is additional confirmatory evidence, not a retroactive invalidation.
