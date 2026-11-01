# RC-001-RETRY — EAS PRODUCTION AAB

## Status

**PASS WITH PLAY CONDITIONS**

## Exact Source

SHA: `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`
Clean worktree: `D:/lingorise-rc1-build-v2`, confirmed matching before and after all commands.

## EAS Identity

Owner: `mfurkant` | Project: `@mfurkant/lingorise` | Project ID: `cb13fe89-238a-4a69-9b8e-a128808fc1c6` | Package: `com.lingorise.app`

## Production Firebase Environment

6/6 required `EXPO_PUBLIC_FIREBASE_*` variables created in the `production` environment of `@mfurkant/lingorise`, sourced authoritatively from `lingorise-65cb1`'s own registered Web App config via `firebase apps:sdkconfig`. **VERIFIED.**

## Production Signing

EAS-managed Android credential auto-generated and successfully used (first build for this project, non-interactive completion to FINISHED is proof of a working credential). Capability: **VERIFIED**. Certificate fingerprint metadata: **NOT VERIFIED** (interactive-only tooling, non-blocking). Play App Signing: **NOT VERIFIED** (expected — no Play Console access yet).

## Build

Build ID `a9d0a048-2c1e-451d-99b3-4656c021fe21`, profile `production`, distribution `STORE`, result **FINISHED**, 0 retries. EAS's own metadata independently recorded `gitCommitHash: b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4` — an exact match, confirmed by EAS's own system, not merely asserted.

## AAB Identity

Filename `lingorise-production-a9d0a048.aab`, 53,908,153 bytes, package `com.lingorise.app` (double-confirmed via EAS metadata and direct binary inspection), version `0.1.0`, versionCode `2`.
**SHA-256: `62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6`**

## Artifact Provenance

**PARTIAL** — every link verified except the signing certificate's own fingerprint (tooling-access limitation, not a defect indicator).

## Verification

Typecheck: PASS (0 errors) | Primary suite: PASS — 422/422 | Both fresh, in the clean exact-SHA worktree.

## Privacy / Account Deletion

Privacy Policy: PASS (HTTP 200, fresh check) | Account deletion: PASS (HTTP 200, fresh check)

## Remaining Play Conditions

See `09_REMAINING_PLAY_CONDITIONS.md` — Play App Signing verification, AAB upload to Internal Testing, Data Safety declaration, account-deletion declaration, store listing, content rating/audience/countries, release notes. Optionally: retrieve the signing certificate fingerprint (non-blocking).

## Source Integrity

Source changed: **NO** (`origin/main` re-fetched post-build, confirmed unchanged at `b8d0687...`). A local, uncommitted `versionCode` bump appeared in the disposable build worktree only, as `eas.json`'s own documented `autoIncrement` side effect — never staged, committed, or pushed. See `01_SOURCE_IDENTITY.md`.

Git commit: NONE
Git push: NONE
Other EAS projects touched: NO
