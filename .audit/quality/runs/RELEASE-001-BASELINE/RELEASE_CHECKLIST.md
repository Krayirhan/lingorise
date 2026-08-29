# Release Checklist

| Item | Status | Evidence | Blocking? | Confidence |
|---|---|---|---|---|
| Revision locked | PASS | HEAD and `origin/main` = `16b9aab…` | Yes | High |
| CI green | PASS | Run `33193481724`, all three jobs success | No | High |
| Production AAB generation | NOT VERIFIED | Profile exists; no EAS production build evidence | Conditional | High |
| EAS production profile | PASS | Production AAB + autoIncrement configured | No | High |
| Production signing | NOT VERIFIED | EAS/Play credential state unavailable | Conditional | High |
| Package ID | PASS | Expo/native/APK all `com.lingorise.app` | No | High |
| Version / versionCode | PARTIAL | `0.1.0` / code 1; Play collision unavailable | Conditional | High |
| Target/API compliance | PASS | APK target/compile SDK 36; official policy checked 2026-08-29 | No | High |
| Manifest / launch / deep link | PASS | Launcher activity exported; `lingorise` scheme; production cleartext not enabled | No | High |
| Permissions | PARTIAL | Internet/vibrate, capped legacy storage, alert-window, plugin notification permissions | No | Medium |
| Firebase production config | NOT VERIFIED | EAS environment unknown | Conditional | High |
| Privacy policy | FAIL | Configured anonymous URL provides generic shell; app-specific policy content not reachable | Yes | High |
| Data Safety | NOT VERIFIED | Worksheet exists; Play Console state unavailable | Conditional | High |
| Account deletion | PARTIAL | In-app implementation present; Play web declaration unavailable | Conditional | High |
| Store listing external state | NOT VERIFIED | No Play Console access | Conditional | High |
| Critical smoke test | PASS | Current SHA CI release-APK Maestro smoke succeeded | No | High |
| Offline content | PASS | Remote/cache/bundled catalogue fallback | No | High |
| Progress-data integrity | FAIL | Stale remote merge can erase passed exam and persist regression | Yes | High |
| Observability | PARTIAL | Local telemetry/logging only; no remote crash monitoring | No | High |
| Branch/repository controls | PARTIAL | `main` unprotected; not release artifact blocker | No | High |

## Manifest / permissions note

The release manifest declares Internet, Vibration, capped read/write external storage (`maxSdkVersion=32`), and `SYSTEM_ALERT_WINDOW`; the merged release manifest also includes notification-related plugin permissions. Debug-only manifests set cleartext traffic, while the production manifest does not. Nothing here was established as a production submission blocker; permission justification should nevertheless be confirmed during Play declaration review.
