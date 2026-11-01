# AAB Artifact

Generated: **YES**

## Download

Source URL: `https://expo.dev/artifacts/eas/2u9xUKOVvI6byzT68NRZeI8ma9LL6bDZ92q3FypEC1c.aab` (from the build's own `applicationArchiveUrl`)
Local path: `D:/lingorise-release-artifacts/lingorise-production-a9d0a048.aab` (outside Git — not committed, not tracked)

| Field | Value |
|---|---|
| Filename | `lingorise-production-a9d0a048.aab` |
| Artifact type | AAB (Android App Bundle) — confirmed structurally: a real zip container with `BUNDLE-METADATA/`, `base/manifest/AndroidManifest.xml`, `base/resources.pb`, `BundleConfig.pb`, and per-ABI native debug symbols (arm64-v8a, armeabi-v7a, x86, x86_64) — a genuine, complete React Native release bundle, not a stub |
| File size | **53,908,153 bytes** (~51.4 MB) |
| SHA-256 | **`62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6`** |
| Package | `com.lingorise.app` — **independently confirmed twice**: (1) from EAS's own build metadata (`appIdentifier`), (2) directly from the AAB's own binary `base/manifest/AndroidManifest.xml` via a raw string extraction (`com.lingorise.app"K`, plus `com.lingorise.app.MainApplication`, `com.lingorise.app.MainActivity`, and related component names) |
| Version | `0.1.0` (EAS-reported `appVersion`) |
| VersionCode | `2` (EAS-reported `appBuildVersion`, resolved by `autoIncrement`) |
| Min SDK / Target SDK | **NOT VERIFIED** — not extractable via the lightweight `strings`-based inspection performed (no `bundletool`/`aapt2`-for-AAB installed, per the explicit instruction not to install new tooling solely for cosmetic evidence); these are integer-encoded attributes in the binary protobuf manifest, not plain-text strings |
| Certificate/signing metadata | **NOT VERIFIED** — see `04_ANDROID_PRODUCTION_SIGNING.md` (interactive-only credentials command, expired log URL) |
| Build ID | `a9d0a048-2c1e-451d-99b3-4656c021fe21` |
| Signing status | EAS-managed production credential (capability-level VERIFIED; certificate fingerprint NOT VERIFIED) — see `04_ANDROID_PRODUCTION_SIGNING.md` |

No value in this table was guessed — each is either directly reported by EAS's own build system or independently confirmed by inspecting the actual downloaded artifact.
