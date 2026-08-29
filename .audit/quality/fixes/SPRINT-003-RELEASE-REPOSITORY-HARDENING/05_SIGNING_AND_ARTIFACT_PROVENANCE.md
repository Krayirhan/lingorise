# Signing and Artifact Provenance

## Verification APK signing (CI / local Gradle build)

**CONFIRMED debug signing**, by direct read of `android/app/build.gradle`:
```
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        ...
    }
}
buildTypes {
    debug { signingConfig signingConfigs.debug }
    release { signingConfig signingConfigs.debug }   // ← release buildType also uses the debug config
}
```
This is the CI (`android-build`, `e2e-smoke` jobs) and any local `assembleRelease` artifact's actual signing — genuinely debug-signed, matching the historical SEC-QA-004/SUPPLY-QA-004 finding exactly. This artifact is **never uploaded, published, or distributed** by CI (confirmed: neither `android-build` nor `e2e-smoke` has an `upload-artifact` step for the APK itself — only Maestro's own debug screenshots/logs are uploaded on failure). It exists solely to prove the native build compiles and the smoke flow runs. This distinction is now made explicit in `.github/workflows/ci.yml`'s `android-build` job comment (this sprint's edit — see `08_REPOSITORY_HARDENING.md`).

## Production EAS signing

**NOT VERIFIED.**

No authenticated EAS CLI session exists in this environment (`eas whoami` → "Not logged in"). EAS-managed Android credentials (keystore, upload key) are stored remotely on Expo's servers or in the developer's own configured credentials source — neither is inspectable without an authenticated session tied to the actual project owner's EAS account. This is an account-credential action outside what an automated sprint should attempt (logging into someone else's build/credentials account is not a locally-fixable configuration change).

**This does NOT mean production signing IS debug-signed.** Per RELEASE-001-BASELINE's own explicit caution (repeated here to avoid the exact overclaim Section 43's independent reviewer is asked to check for): the repo/CI Gradle debug-signing fact says nothing about what EAS actually does for its own separately-managed `production` profile build — EAS builds are not required to reuse `android/app/build.gradle`'s local debug keystore at all; by default EAS provisions and manages its own release keystore unless explicitly configured otherwise.

## Play App Signing

**NOT VERIFIED — EXTERNAL PLAY CONSOLE CONDITION.** No Play Console access/credential is configured in this environment. Per Section 16's explicit instruction, this is reported as NOT VERIFIED, not FAIL.

## Safe certificate metadata

None available to record — no EAS/Play Console session exists from which to retrieve fingerprints. No attempt was made to fabricate or approximate this data.

## Artifact provenance model (as designed, not yet exercised)

Intended model per `eas.json`/`06_RELEASE_DEPENDENCY_MAP.md`: one exact committed git revision → `eas build --profile production` → one AAB, with EAS recording the git commit SHA as build metadata (a standard EAS behavior, not custom to this project) → that same AAB uploaded to Play Console. This model requires a committed (not merely locally-modified) source revision to have well-defined provenance — an EAS build against a dirty/uncommitted working tree is technically possible but its provenance would not map to any reviewable git history, which Section 15 explicitly instructs this sprint to avoid presenting as a "final RC."

## Exact source-state requirement

Current state: HEAD = origin/main = `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`, with Sprint 1 + Sprint 2 + Sprint 3's own working-tree changes (22 Sprint-1/2 files + this sprint's `firebase.json`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, `public/`, and `DataManagementCard.tsx`'s URL constant) all **uncommitted**, per every sprint's own explicit instruction and this sprint's own absolute commit/push rule.

**No production AAB was generated this sprint.** Both independently-sufficient blockers apply: (1) no authenticated EAS session, (2) no locked source revision. Per Section 41/42, this is reported as an EXTERNAL / USER-AUTHORIZATION GATE, not a Sprint failure — see `13_RESIDUAL_EXTERNAL_CONDITIONS.md` for the exact next actions required.
