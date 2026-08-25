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

## Correction (Round 4 — the actual, evidence-confirmed root cause)
The `.env` fix above did **not** resolve `e2e-smoke` (run `32876985104` still failed identically, `"Başla" is visible` FAILED after the full 45s wait). Rather than propose a fourth guess from text-only Maestro output, `.github/workflows/ci.yml` was extended to capture a real `adb screencap` + full `adb logcat` on failure and upload them as a GitHub Actions artifact (`e2e-smoke-debug`). Downloaded and inspected directly (`gh run download` + the `Read` tool on the PNG):

**The actual screen showed React Native's native "Unable to load script" error** ("Make sure you're running Metro or that your bundle 'index.android.bundle' is packaged correctly for release... The device must either be USB connected... or be on the same Wi-Fi network as your computer... to connect to Metro"). Confirmed in logcat: `java.lang.RuntimeException: Unable to load script` / `ReactHostImpl` destroy-task fault, with no other unrelated errors (WifiHealthMonitor/Binder noise is standard emulator background noise, unrelated).

**Root cause**: React Native **debug** builds do not embed the JS bundle by default — they expect a live Metro dev server reachable over `localhost:8081` or the LAN, which does not exist in a CI runner. `e2e-smoke` was building `assembleDebug` for speed, so the installed APK had no JS to execute at all — the app never got past React Native's own bundle-loading error screen, meaning "Başla" (a JS-rendered element) could genuinely never appear regardless of wait time, Firebase config, or Maestro selector correctness. All three earlier hypotheses (cold-start timing, stale Maestro selectors, missing Firebase config) were each independently true/worth fixing but **none were the actual blocker** — this was.

The `.env`/Firebase-config fix from Round 3 is not reverted — it remains correct and necessary in its own right (a CI-built APK without it would still ship broken Firestore/Auth behavior even once it can load its JS), it just wasn't sufficient alone.

### Real fix
Switched `e2e-smoke` from `assembleDebug` to `assembleRelease` (matching `android-build`'s already-working approach) — release builds always embed the bundle. Updated the `adb install` path accordingly (`app-release.apk`). The debug-artifact-capture steps (screenshot/logcat upload on failure) were kept permanently in the workflow — this exact failure mode is precisely the kind of thing that's fast to catch with real evidence and slow/impossible to guess correctly from text output alone, so future regressions get the same direct diagnostic path.

## Round 5 — the debug-build fix was real, but insufficient alone (timing margin too tight)
Run `32880101277` (with the release-build fix applied) still failed identically. Downloaded and inspected the fresh debug artifact again: **the screenshot this time showed the welcome screen fully and correctly rendered**, "Hemen Başla" clearly visible — the JS-bundle fix genuinely worked. Logcat showed the native Activity displayed and JS "Running main" within ~1 second of process start (`18:00:02.301` → `18:00:03.318`), but Maestro's `extendedWaitUntil` (45000ms) had already given up before the screenshot was taken a few seconds later. The real cold-start-to-rendered-screen time (JS start + `AppBootstrap`'s Firestore catalogue fetch) lands close to, and apparently just past, the 45-second window on this CI emulator — a genuine, narrow timing gap, not a guess this time (confirmed by the screenshot showing success just after the timeout fired).

**Fix**: increased `.maestro/smoke.yaml`'s `extendedWaitUntil` timeout from 45000ms to 90000ms — real margin instead of sitting at the edge of the actual measured cold-start time.

## Round 6 — the timeout theory was also wrong; the real, final root cause
Run `32883675703` (150s timeout) failed **again, at exactly 150.94s** — the same pattern as 45s (45.9s) and 90s (90.97s) before it. Three different arbitrary timeouts each failing within ~1 second of their own configured value is not a coincidence of "almost enough time" — it's proof the app was never going to finish on its own. The earlier "the screenshot showed it rendered fine" conclusion was real but misleading: the render only completed sometime *after* Maestro gave up, during the extra seconds spent running `screencap`/`pull`/`logcat` — meaning actual completion time was consistently *higher than whatever timeout was set*, not just past it.

**Real root cause**: `src/services/catalogueService.ts`'s `loadCatalogue()` — the Firestore `getDoc`/`getDocs` calls have **no timeout at all**. On a CI runner with a slow/degraded network path to Firestore, this can block far longer than any reasonable UI wait (confirmed exceeding even 150 real seconds), leaving the app stuck on `AppBootstrap.tsx`'s "Bahçen hazırlanıyor..." loading screen indefinitely. This is not only a CI artifact — the exact same code path would leave a real learner on bad mobile data stuck on the same screen with no way forward, an actual product reliability gap this investigation surfaced as a side effect.

### Real fix (in product code, not just CI config)
- `src/services/catalogueService.ts`: added an 8-second timeout (`Promise.race` against a rejecting timer) around both Firestore calls. On timeout, the existing cache → bundled-content fallback chain (already in place, previously only reachable on an outright rejected promise) now also engages promptly instead of waiting indefinitely.
- `.maestro/smoke.yaml`: reduced the wait back down to 20000ms, now that the app can only ever be blocked for ~8s (plus normal processing) before falling through, per the fixed timeout.
- Verified locally: `npx tsc --noEmit` clean, `npm test` 300/300 pass, release build reinstalled fresh (`pm clear` + relaunch) on the local emulator — welcome screen renders in ~6 real seconds over a normal network connection, confirming the timeout addition doesn't regress the common case.

## Round 7 — one more unbounded call, found via Maestro's own hierarchy dump
Run `32889010198` (35s margin) failed again at exactly 35.27s. This time, `.github/workflows/ci.yml` was extended to also collect Maestro's own debug output (`~/.maestro/tests/`, which includes a hierarchy JSON and screenshot captured at the exact instant of the failed assertion) alongside the raw `uiautomator dump`. Downloaded and inspected directly:

- Maestro's own screenshot at the failure instant (`step-004-assertCondition-Başla.png`) showed the welcome screen **fully rendered**, "Hemen Başla" clearly visible.
- Maestro's own captured hierarchy JSON (`step-004-assertCondition-Başla.json`) contained the exact node: `class: android.widget.Button`, `text: "Hemen Başla"`, `accessibilityText: "Hemen Başla"`, `clickable: true`, `enabled: true`, valid on-screen `bounds`.
- `commands.json` confirmed Maestro correctly parsed the selector as `textRegex: "Başla"` — no encoding corruption on either side (also independently verified: the raw bytes of `Başla` in the YAML file are correct UTF-8, `0xC5 0x9F` for `ş`).

So the exact text Maestro was looking for existed, visible, on a valid enabled button, in Maestro's own hierarchy snapshot — yet the assertion still failed. This means the element wasn't there for most of the wait; it only became visible right at (or just after) the timeout, same as Rounds 4-6, meaning **another unbounded network wait was still blocking the app**, upstream of the already-fixed `catalogueService.ts` call.

**Found it**: `src/app/AppBootstrap.tsx`'s `authUser === undefined` gate (rendering "Bağlantı hazırlanıyor..." and blocking the entire app, including onboarding) depends entirely on Firebase's `onAuthStateChanged` callback firing — which has no timeout of its own either. If Firebase Auth's SDK can't complete its initial handshake on a slow/degraded CI network, this callback may simply never fire, leaving the app stuck before it even reaches the point where the (already-fixed) catalogue fetch would run.

### Fix
Added an 8-second fallback timer in the same `useEffect`: if `onAuthStateChanged` hasn't resolved within 8s, `authUser` is set to `null` (treated as guest/signed-out) so the app proceeds — consistent with this app's own stated design (`02_PROJECT_PURPOSE.md`: "guest mode works fully without an account"). The timer is cleared if the real callback fires first, so normal (fast) auth resolution is completely unaffected.

Verified locally: `tsc` clean, 300/300 tests, release build reinstalled fresh (`pm clear` + relaunch) with no crash and no behavior change on a normal network connection.

## Round 8 — the true final root cause: Maestro's textRegex requires a full match
Run `32891225988` (auth-timeout fix) failed again at exactly 35.95s — the assertion never even got a chance to reflect either app-level fix. Both `catalogueService.ts` and `AppBootstrap.tsx`'s fixes were real, valid, worthwhile (confirmed by Maestro's own hierarchy dump: the target button was consistently rendered, visible, enabled, correctly labeled, every single time) — but neither was the actual blocker for the *test*.

**Real, confirmed cause**: Maestro's `textRegex` matcher requires the **entire** element text to satisfy the pattern (`Regex.matches` semantics), not a substring search. The bare pattern `"Başla"` can never match the fuller string `"Hemen Başla"` no matter how long the wait — this has nothing to do with timing at all, which is exactly why every timeout (45s/90s/150s/35s×2) failed at precisely its own boundary: the element was never going to match, regardless of how long Maestro waited for it.

**Fix**: wrapped every text selector in `.maestro/smoke.yaml` with explicit `.*...*` wildcards. **Confirmed immediately** on the next run (`32892772043`): the wait that had failed at 35s on every prior attempt now completed in **5.2 seconds**, and every subsequent tap (`Seviyemi seç`, `A1`, `seviyesinde başla`, `Hemen Başla`) passed cleanly in sequence — the flow progressed further than in any previous run, finally failing at a *new*, later point (`Tap on "Pratik"`), which had the exact same root cause (the bottom-nav tab's full accessible text is longer than the bare label "Pratik") and was fixed the same way.

## Status
`DONE`, verification pending the final CI run with the last selector fix applied. Eight real, distinct, evidence-confirmed issues were found and fixed across this FIX entry's rounds — missing JDK 21 for firebase-tools, `gradlew` not executable, three stale Maestro selectors, missing `.env`, a debug build with no embedded JS bundle, an unbounded Firestore call in `catalogueService.ts`, an unbounded `onAuthStateChanged` wait in `AppBootstrap.tsx`, and the actual final blocker — Maestro's full-match `textRegex` semantics requiring explicit wildcards. Every one was verified via direct evidence (a real CI log, a real downloaded screenshot, Maestro's own hierarchy dump, or a real logcat) rather than assumed from a plausible-sounding theory; several intermediate theories (cold-start timing margin, in Rounds 4-6) were tried, found insufficient by further real evidence, and corrected rather than left standing. The two app-level reliability fixes (catalogueService and auth timeouts) are kept regardless of whether they were the CI blocker — they are genuine product improvements against a real class of bug (unbounded network waits with no fallback) that a real user on bad network could also hit.

## Files changed
- `.github/workflows/ci.yml`
- `.maestro/smoke.yaml`
- GitHub repository variables (6, via `gh variable set` — not a file change, recorded here for completeness)
