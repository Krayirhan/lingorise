# External State Matrix

| Control | Local evidence | Live external evidence | Status |
|---|---|---|---|
| EAS production signing | Production AAB profile exists | EAS CLI/session and credential state unavailable | NOT VERIFIED |
| Latest EAS production build | No local build metadata/project linkage | Not accessible | NOT VERIFIED |
| Play App Signing | No repository evidence can prove it | Play Console unavailable | NOT VERIFIED |
| Play Console package | Package is `com.lingorise.app` locally | Submission/existence unavailable | NOT VERIFIED |
| Latest Play versionCode | Local code is 1; EAS autoIncrement configured | Console collision state unavailable | NOT VERIFIED |
| Data Safety submission | Detailed repository worksheet exists | Console declaration unavailable | NOT VERIFIED |
| Privacy URL public access | URL configured in-app | Anonymous request yields generic Claude Artifact shell; content host 404, API 403 | FAIL |
| Account-deletion store declaration | In-app delete flow exists | Required web/Data Safety declaration unavailable | NOT VERIFIED |
| Store listing completion | App name/icon configured | Console listing unavailable | NOT VERIFIED |
| Target API acceptance | Local APK target SDK 36 | Official policy current as of 2026-08-29 supports requirement | VERIFIED |
| Production Firebase deployment | Client config contract and rules exist | Project/deployment state unavailable | NOT VERIFIED |
| Branch protection | CI exists | Live GitHub API: `main` unprotected | PARTIAL |

## Policy sources checked 2026-08-29

- Google Play target API: [official requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en). API 36 is required from 2026-08-31 for new mobile apps/updates; this APK targets 36.
- Google Play Data Safety: [official requirements](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en). Developers must complete the form and supply privacy-policy information.
- Google Play account deletion: [official requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en). Apps that allow account creation must offer deletion and provide the applicable functional web/Data Safety resource.

Unknown external state is not automatically failure. The privacy URL is marked FAIL because anonymous requests did not expose a functional LingoRise-specific policy: the configured top-level URL returned only generic, noindex Claude Artifact shell content, its direct content host returned HTTP 404, and its anonymous frame API returned HTTP 403.
