# FIX-2026-08-25-09

MODE: FIX (continued CI debugging)
Source: DEPLOY-001, FIX-2026-08-25-08

## Context
After `FIX-2026-08-25-08` restored CI on the now-public repo, real CI runs finally executed (no longer budget-blocked). Two rounds of real, diagnosable failures were found and fixed:

**Round 1** (run `32872538297`): `android-build`/`e2e-smoke` failed with `./gradlew: Permission denied` (exit 126) — the executable bit was never set on `android/gradlew` in git. `verify`'s `test:rules` step failed with `firebase-tools no longer supports Java version before 21` — that job had no `setup-java` step at all. Both fixed in a prior commit (`c70f318`).

**Round 2** (run `32873177438`, then `32874900000`): `verify` and `android-build` passed cleanly. `e2e-smoke` failed at the Maestro step — `Element not found: Text matching regex: Başla`. Investigated by clearing app data and walking the real onboarding flow on the local Pixel_9_Pro emulator with screenshots at each step, cross-checked against source (`OnboardingScreen.tsx`, `LevelStep.tsx`, `onboarding.ts`). Found and fixed 3 real bugs in `.maestro/smoke.yaml` itself (stale selectors that predate this session, never caught because CI had never once run successfully before today): missing wait for cold-start catalogue load, a missing "seviyesinde başla" tap between level selection and completion (selecting a level card doesn't auto-advance), and a completely wrong string ("Bahçeme Başla" — doesn't exist anywhere in the app; the real button is "Hemen Başla"). Committed as `bce2b91`.

## Round 3 (this entry) — the actual root cause
Even with the corrected flow and a 30-second `extendedWaitUntil`, the *very first* assertion (`"Başla" is visible`) still failed after the full 30-second wait elapsed (`Launch app... COMPLETED` at 17:07:16.8, `Assert... FAILED` at 17:07:47.86 — confirms this was not a selector problem, the screen genuinely never showed the expected text within a generous window).

Traced this to: **CI has no `.env` file.** `.env` is correctly gitignored and was never committed — a fresh `actions/checkout@v4` produces a repo with no Firebase configuration at all. `EXPO_PUBLIC_FIREBASE_*` variables are inlined into the JS bundle at Metro/`bundleCommand` build time (not read at runtime), so both the `android-build` and `e2e-smoke` jobs had been silently producing APKs with an **unconfigured Firebase client** baked in. `src/services/catalogueService.ts`'s `loadCatalogue()` makes a real `getDoc`/`getDocs` Firestore call before the app can render past its loading screen (gated in `AppBootstrap.tsx` via `catalogueReady`) — with invalid/undefined Firebase config, this call (or Firebase's own module-level initialization) very plausibly hangs or fails slowly rather than erroring instantly, keeping the app stuck on "Bahçen hazırlanıyor..." indefinitely, which is exactly consistent with "Başla" never becoming visible no matter how long Maestro waits.

This also means `android-build`'s prior "success" only proved the native Gradle/Android compilation succeeds — it never proved the resulting APK actually works, since it was never launched. That job remains a valid, real check for its stated purpose (native build health), but this reveals it doesn't cover as much as a casual reading of its name might suggest — worth keeping in mind.

## Fix
- Added the 6 `EXPO_PUBLIC_FIREBASE_*` values as **GitHub Actions repository variables** (`gh variable set`, not secrets — these are non-sensitive Firebase Web client identifiers; security is enforced by `firestore.rules`, not by hiding them, per this session's own `SEC-002` finding).
- Added a "Write .env" step to both `android-build` and `e2e-smoke` jobs (before their respective Gradle build steps) that assembles `.env` from those repository variables.
- Bumped `.maestro/smoke.yaml`'s initial `extendedWaitUntil` from 30000ms to 45000ms as a safety margin for genuine cold-start network latency on a CI emulator, now that the underlying config-missing cause is also fixed.

## Status
`DONE`, verification pending the next CI run (this fix accompanies a push; results will be checked and this log updated).

## Files changed
- `.github/workflows/ci.yml`
- `.maestro/smoke.yaml`
- GitHub repository variables (6, via `gh variable set` — not a file change, recorded here for completeness)
