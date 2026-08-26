# 05 — Tool and Graph Analysis (REAUDIT)

## Change since RUN-002-REAUDIT

| Tool/capability | RUN-002-REAUDIT | RUN-003-REAUDIT |
|---|---|---|
| CI (typecheck/test/rules-test/build/e2e gate) | Restored in workflow file but not yet proven to run successfully | **CONFIRMED GREEN.** `gh run list --limit 8` and `gh run view 32900631213` (the run for current `HEAD`, `29ce04e`) show all 3 jobs (`verify`, `android-build`, `e2e-smoke`) passing. This is materially stronger evidence than baseline ever had (baseline assumed CI worked without a confirmed live green run). |
| Branch protection on `main` | Not examined | **CONFIRMED ABSENT.** `gh api repos/Krayirhan/lingorise/branches/main/protection` → `404 Branch not protected`. CI is informative (visible red/green per push) but not an enforced merge gate. |
| Repo visibility | Private | **Public.** `gh api repos/Krayirhan/lingorise` → `"private": false`, `"visibility": "public"`. |
| Secret exposure scan (repo-wide, given new public visibility) | N/A (private) | Executed this run — see `06_EVIDENCE_INDEX.md`. No committed secrets found; `.env` gitignored; 6 Firebase Web client IDs exposed only as non-sensitive Actions repository variables (visible to write-access accounts, not the public). GitHub secret scanning/push protection found **disabled** (new observation, not a confirmed leak). |
| Custom test suite | 300 assertions | **300 assertions, unchanged** — no test files touched in this delta (`git diff --stat 3436a1b..29ce04e` shows no `tests/` changes). |
| `tsc --noEmit` | Clean at RUN-002 | Re-run fresh this reaudit — clean, 0 errors. |
| `npm test` | 300/300 at RUN-002 | Re-run fresh this reaudit — 300/300 pass, same count (no regression, no silent test removal). |
| `npm run test:rules` (local) | Not executed locally at RUN-002 either (same Java-version gap) | Attempted fresh this run — fails locally with the same pre-existing cause (`firebase-tools no longer supports Java version before 21`; local machine has Java 8). **Not a project defect** — CI's `verify` job installs JDK 21 via `actions/setup-java@v4` specifically for this step and passed (`verify` job succeeded in 50s in run `32900631213`), which is the authoritative pass/fail signal for this check. Marked `NOT EXECUTED (local)` / `VERIFIED (CI)` accordingly. |
| Android release build | Verified 6× across FIX-2026-08-25-01 through 07 | Verified again via CI's `android-build` and `e2e-smoke` jobs (`gradlew assembleRelease`), both green on current `HEAD`. Not re-run locally this pass — CI evidence is direct and current. |
| Maestro E2E smoke | Configured, never executed live (CI job existed but removed before running) | **Executed live and passing** on CI's Android emulator (API 34, Pixel 6 profile) — full guest-onboarding-to-home-screen flow, confirmed via `e2e-smoke` job success and the FIX-09 debug-artifact trail (screenshots, hierarchy dumps, logcat) that led to the final fix. |
| Graphify | Stale, unused | Still stale/unused — not regenerated this session (no code-structure change large enough to warrant it; manual `git diff`/`grep`-based analysis continued to substitute, consistent with prior runs). |

## Executed this run

- `git log --oneline 3436a1b..29ce04e` / `git diff --stat 3436a1b..29ce04e` — change-surface mapping (19 commits, 23 files, +786/−11 lines, almost entirely CI/Maestro config plus 2 product files).
- `npx tsc --noEmit` — fresh execution, clean.
- `npm test` — fresh execution, 300/300 pass.
- `npm run test:rules` (local) — attempted, fails locally on pre-existing Java-version gap (not a project defect; see above); CI's equivalent step confirmed passing.
- `gh run list --limit 8`, `gh run view 32900631213` — real GitHub Actions run history and job-level breakdown for the current `HEAD` commit.
- `gh api repos/Krayirhan/lingorise` — visibility/branch-protection/security-and-analysis settings.
- `gh variable list` — confirmed which 6 non-secret Firebase Web config values are stored as Actions repository variables (not secrets).
- `git ls-files | grep -iE` for common committed-credential file patterns (`.pem`, `.p12`, `.jks`, `.keystore`, `service-account`, `firebase-adminsdk`) — only the pre-existing, already-known, already-accepted `android/app/debug.keystore` matched.
- Direct `Read`/`grep` of `src/services/catalogueService.ts`, `src/app/AppBootstrap.tsx`, `.github/workflows/ci.yml`, `.maestro/smoke.yaml` — confirmed the claimed fixes are genuinely present in current source, not just claimed in FIX logs.
- `git status` — clean working tree, nothing uncommitted.

## Tool limitations (updated)

No crash-reporting SDK; iOS path remains unbuildable from this checkout; `test:rules` could not be executed locally on this machine (Java 8 present, JDK 21 required) — substituted with CI's own passing run of the identical command as the authoritative signal, disclosed rather than guessed.
