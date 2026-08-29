# Release Path Map

## Declared production path

`Git revision 16b9aab` → EAS `production` profile → Android AAB → Google Play / Play App Signing → Play distribution.

| Path | Artifact | Signing evidence | Purpose | Status |
|---|---|---|---|---|
| Local repository Gradle | `assembleRelease` APK | **DEBUG** — `release` uses `signingConfigs.debug` | Local native verification | PARTIAL |
| GitHub CI `android-build` | Release APK | **DEBUG** — same Gradle configuration | Build verification; not Play publication | PASS for SHA |
| GitHub CI `e2e-smoke` | Same release APK installed to emulator | **DEBUG** | Launch/onboarding/Practice-Hub smoke verification | PASS for SHA |
| EAS `preview` | Internal APK | Not inspected remotely | Preview/internal distribution | NOT VERIFIED |
| EAS `production` | AAB (`android.buildType: app-bundle`) | Remote credential provenance unavailable | Intended Play submission artifact | NOT VERIFIED |
| Google Play | Submitted AAB | Play App Signing unavailable | End-user distribution | NOT VERIFIED |

## Production-path controls

| Control | Evidence | State |
|---|---|---|
| Production artifact type | `eas.json`: `app-bundle` | VERIFIED (E2) |
| Production version mechanism | `autoIncrement: true`; local versionCode 1 | PARTIAL |
| EAS project/linkage and latest production build | No local project ID/owner or CLI session | NOT VERIFIED |
| EAS production credentials | No read-only remote evidence | NOT VERIFIED |
| Firebase build-time config | Local ignored `.env` has six required keys; CI injects them; EAS source unavailable | NOT VERIFIED |
| Play App Signing | Console state unavailable | NOT VERIFIED |
| Play current versionCode / package acceptance | Console state unavailable | NOT VERIFIED |

## Current release blocker in the code path

`mergeAndSyncUserData()` reads remote state and builds a merged object by spreading `localData`, then `remote`, before explicitly preserving only XP, streak, solved/rewarded IDs, badges, and learning progress. `passedLevelExams` and several progress/history fields are omitted. A failed background cloud sync can therefore leave remote state stale; a normal restart then takes stale remote `passedLevelExams`, saves it locally, and writes it back to Firestore. This affects the production app independently of which valid signing path produces the AAB.
