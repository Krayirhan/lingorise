# FIX-2026-08-25-04

MODE: FIX
APPROVED_ACTIONS: ACT-DEPLOY-001
Source run: RUN-001-BASELINE

## ACT-DEPLOY-001 — Add Maestro E2E and release-build compile gates to CI

Status: **DONE, verification partially executed** (see gap below)

### Change
`.github/workflows/ci.yml` — added two new jobs alongside the existing `verify` job:

1. **`android-build`** — checks out, installs Node deps, sets up JDK 17 (Temurin), and runs `./gradlew assembleRelease --no-daemon` in `android/`. Uses the committed `android/app/debug.keystore` (already what release builds are signed with — see `android/app/build.gradle`'s own "Caution! In production, you need to generate your own keystore file" comment), so no GitHub secrets are required.
2. **`e2e-smoke`** — builds a debug APK (`assembleDebug`, faster than release since this job only needs an installable artifact), installs the Maestro CLI, enables KVM for hardware-accelerated emulation, boots an API 34 x86_64 emulator via `reactivecircus/android-emulator-runner@v2`, installs the APK, and runs `maestro test .maestro/smoke.yaml`.

Both jobs run on the same triggers as `verify` (`pull_request` and `push` to `main`) — the original finding's own acceptance criteria ("CI fails if the Maestro smoke flow breaks or if the Android project fails to compile") calls for unconditional gating, not an opt-in check that could be ignored.

### Why two separate jobs instead of one
`android-build` uses `assembleRelease` specifically because that's the artifact that actually ships (closing the "no automated release-build compile check" half of the finding); `e2e-smoke` uses the faster `assembleDebug` because it only needs the app installed to drive Maestro, not a shippable build — reusing the release job's slower build for a job that doesn't need it would add unnecessary CI time for no benefit.

### Verification performed this pass
- YAML syntax validated with `js-yaml` (already present in `node_modules` as a transitive dependency) — parses cleanly, all three jobs (`verify`, `android-build`, `e2e-smoke`) present as expected.
- `cd android && ./gradlew assembleRelease` — BUILD SUCCESSFUL (the exact command the new `android-build` job runs).
- `cd android && ./gradlew assembleDebug` — BUILD SUCCESSFUL (the exact command the new `e2e-smoke` job runs before Maestro), output confirmed at the exact path referenced in the workflow (`android/app/build/outputs/apk/debug/app-debug.apk`).

### Verification gap (disclosed, not hidden)
The workflow has **not** been executed on GitHub Actions itself — that requires an actual push/PR to observe. The `reactivecircus/android-emulator-runner` action and the KVM-enablement steps follow a well-established, widely-used pattern for Android emulator CI on GitHub-hosted `ubuntu-latest` runners, but I have not personally observed this exact job succeed in GitHub's runner environment (installed tool versions, KVM availability specifics, network access to Maestro's install script from a GitHub runner, etc. are all assumptions consistent with common practice, not independently confirmed here). Per the Evidence Policy's "no fabricated execution" rule, this is disclosed rather than claimed as fully proven. Recommend watching the first real CI run on this branch/PR closely and adjusting (e.g., emulator API level, timeout) if anything about the hosted-runner environment differs from the standard case.

## Scope discipline
Only `.github/workflows/ci.yml` was modified. No product source, no other CI-adjacent files (e.g., `eas.json`) touched.

## Files changed
- `.github/workflows/ci.yml`
