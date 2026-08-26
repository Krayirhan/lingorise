# 01 — Project Understanding (REAUDIT)

No material change to product identity, technical topology, or data flow since `RUN-001-BASELINE/01_PROJECT_UNDERSTANDING.md` — that document remains authoritative for architecture/classification and is not repeated here in full.

## What changed since RUN-002-REAUDIT (revision `3436a1b` → `29ce04e`)

`RUN-002-REAUDIT` was taken mid-CI-debugging-saga, at the commit where CI had just been restored (`c13d06d`) but before any of it actually ran successfully. Everything below happened **after** that run, in the same continued session, and is new change surface for this reaudit:

- **CI/CD is now genuinely green end-to-end.** Across `FIX-2026-08-25-08` and `FIX-2026-08-25-09` (11 rounds of real, evidence-driven debugging — see `FIX-2026-08-25-09/README.md` for the full trail), every real failure in the restored `.github/workflows/ci.yml` and `.maestro/smoke.yaml` was found and fixed: missing JDK 21 for `firebase-tools`, `gradlew` not executable, three stale/incorrect Maestro selectors, a missing `.env` in CI (Firebase config never reached the CI-built APK), a debug build with no embedded JS bundle, Maestro's `textRegex` requiring a full match (not substring), a self-inflicted deleted test step, and a case-insensitive substring collision that caused a silent no-op tap. **Confirmed this reaudit**: the latest run on `HEAD` (`29ce04e`, run `32900631213`) is green across all 3 jobs (`verify`, `android-build`, `e2e-smoke`).
- **Two real product reliability fixes landed as a byproduct of that debugging**, not merely CI-config changes:
  - `src/services/catalogueService.ts` — `loadCatalogue()`'s Firestore `getDoc`/`getDocs` calls had no timeout; added an 8-second `Promise.race` timeout so the existing cache → bundled-content fallback engages promptly instead of hanging indefinitely on bad network.
  - `src/app/AppBootstrap.tsx` — `onAuthStateChanged` had no timeout either, which could leave the entire app stuck on "Bağlantı hazırlanıyor..." indefinitely; added an 8-second fallback that treats the user as signed-out/guest if the real callback hasn't fired, consistent with the app's own stated guest-mode design.
  - Both are genuine fixes to a real class of bug (unbounded network waits with no fallback) that a real user on bad mobile data could also hit — not CI-only workarounds.
- **The GitHub repository is now public** (`Krayirhan/lingorise`, confirmed via `gh api repos/Krayirhan/lingorise` → `"private":false`), a prerequisite for free unlimited Actions minutes that made restoring CI viable at all.
- One documentation-only commit (`29ce04e`) closed `DEPLOY-001` in the audit registries — no app/CI code change.

## Known constraints (updated)

- The "no automated CI gate exists" constraint from `RUN-002-REAUDIT` is now **stale and reversed**: CI exists, runs on every push to `main` and on every PR, and is confirmed green on the current revision.
- **New constraint surfaced this reaudit**: `main` has **no branch protection rule** (`gh api repos/.../branches/main/protection` → `404 Branch not protected`). CI provides fast, visible feedback (a red run appears immediately after a bad push) but does not technically block a push or a merge from landing on `main` even if it fails. Given this project's actual workflow is direct pushes to `main` by a single developer (no PRs observed in the commit history), the practical impact is limited, but it is a real gap worth naming rather than assuming CI = enforced gate.
- All other constraints from `RUN-001-BASELINE`/`RUN-002-REAUDIT` remain unchanged (no committed `ios/` project, Android-only evaluated release path, no crash-reporting SDK, release APK still signed with the debug keystore).

## Unknowns / confidence

Unchanged from `RUN-002-REAUDIT` except: CI functional status is now `CONFIRMED GREEN` (was `CONFIRMED REMOVED`); branch-protection status is now `CONFIRMED ABSENT` (previously not examined, since there was no CI to protect); production Play Store publication status remains `UNKNOWN`.
