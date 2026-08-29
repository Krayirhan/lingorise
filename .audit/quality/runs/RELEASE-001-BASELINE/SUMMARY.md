# RELEASE-001-BASELINE

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## RELEASE GATE: NO-GO

Diagnostic Release Readiness: **61/100**  
Confidence: **HIGH** for the NO-GO decision; **MEDIUM** for remote EAS/Play status.

The gate takes precedence over the diagnostic score. The exact revision has a verified production data-loss path: following a transient cloud-sync failure, the cold-start merge can overwrite a locally passed level exam with stale remote state and immediately persist that regression. This must be corrected and verified before production shipment.

## Intended shipping path

Android → EAS `production` profile → Android App Bundle (AAB) → Google Play. `eas.json` sets `android.buildType: app-bundle` and `autoIncrement: true` for production. This is distinct from the local/CI `./gradlew assembleRelease` APK path, which is verification-only and debug-signed.

## Diagnostic scorecard

| Dimension | Score | Basis |
|---|---:|---|
| Build / production artifact readiness | 15/20 | Same-HEAD CI release APK and smoke passed; production AAB has not been verified. |
| Production signing / credentials | 10/20 | EAS production signing and Play App Signing are unavailable for read-only verification. |
| Android manifest / runtime config | 9/10 | Consistent identity, target API 36, valid icon/deeplink and production cleartext separation. |
| Privacy / Data Safety / account lifecycle | 6/15 | In-app deletion exists, but public policy/declaration state is not release-ready; current policy URL fails anonymous app-specific verification. |
| CI / smoke / release verification | 9/10 | CI jobs succeeded for this exact SHA and smoke uses a release APK; AAB is untested. |
| Store / version / platform compliance | 8/15 | Target API 36 is compliant; Play Console/listing/version state is not available. |
| Operational production readiness | 4/10 | Bundled-content fallback exists, but an active merge data-loss path is a release blocker and no remote crash monitoring exists. |

## Findings

| ID | Severity | Blocking | Title |
|---|---|---|---|
| RELEASE-QA-001 | P1 | YES | Cold-start cloud merge can silently erase and persist passed-level exam progress |
| RELEASE-QA-002 | P1 | CONDITIONAL | Actual EAS production AAB signing / Play App Signing is not verified |
| RELEASE-QA-003 | P1 | YES | Configured privacy-policy URL does not expose an app-specific policy anonymously |
| RELEASE-QA-004 | P1 | CONDITIONAL | EAS production Firebase environment is not verified |
| RELEASE-QA-005 | P3 | NO | Play Console version/listing/Data Safety completion is not externally verified |
| RELEASE-QA-006 | P3 | NO | Production observability is local-only |

## Conditions to clear before shipping

1. Fix `mergeAndSyncUserData` to preserve/merge `passedLevelExams` and the other omitted progress/history fields; verify a failed background sync followed by restart cannot regress and re-persist user progress.
2. Replace the current Claude Artifact link with a durable, anonymously reachable, app-specific privacy policy URL.
3. Produce and inspect an EAS production AAB from this release revision; verify persistent production credentials and Play App Signing, not the repository debug key.
4. Verify the EAS production environment supplies all six required `EXPO_PUBLIC_FIREBASE_*` values and that the AAB initializes its Firebase-backed functionality.
5. Complete and verify the Play Console Data Safety/account-deletion web declaration, versionCode acceptance, and listing state.

## Strong evidence

- Current same-HEAD CI run `33193481724`: `verify`, `android-build`, and `e2e-smoke` all succeeded.
- The release APK metadata resolves to `com.lingorise.app`, versionCode `1`, versionName `0.1.0`, minSdk `24`, targetSdk/compileSdk `36`.
- `app.json`, native `namespace`, and `applicationId` all use `com.lingorise.app`; the `lingorise` deep-link scheme and app icon are present.
- Offline catalogue fallback ships bundled questions; notifications are local and request permission at runtime.
- In-app account deletion is available, deletes Firestore user/items/progress, then deletes Firebase Auth; the UI handles a recent-login requirement.

## External-policy evidence

As checked 2026-08-29, Google Play’s official target-API guidance requires API 35 for current new app/update submissions and API 36 from 2026-08-31; this build targets API 36. Official Play guidance also requires Data Safety declarations and, for apps that create accounts, account-deletion disclosure/pathways including a functional web resource in the Data Safety flow. Sources: [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en), [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

## Independent review / reconciliation

Independent reviewer: **ADJUST**, then **NO-GO** after separately supplied current-code evidence confirmed the merge data-loss path. The reviewer explicitly rejected treating CI debug signing, branch protection, or npm advisories as the production release blocker.

Historical reconciliation performed last: `DATA-QA-002` is **REDISCOVERED** as a current release blocker based on independent source verification (its historical P0 label was not imported); `DEPLOY-001` is **CLOSED AND STILL VALID** for CI success; `DEPLOY-002` and `SEC-003` remain repository hardening concerns, not the primary shipping blocker; `DATA-004` is **NOT REVERIFIED** as a separate release-blocking condition.

No source, test, configuration, workflow, registry, or prior-audit artifact was changed.
