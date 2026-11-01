# Android Permission Audit (post-fix)

Carried forward from `PLAY-001-DECLARATIONS/09_ANDROID_PERMISSIONS.md`'s full merged-manifest extraction, with exactly one change applied this run: `android.permission.SYSTEM_ALERT_WINDOW` **removed** (`15_SYSTEM_ALERT_WINDOW.md`).

| Permission | Source | Feature | Used | Runtime request | Play declaration | Sensitive | Remove? |
|---|---|---|---|---|---|---|---|
| `INTERNET` | App manifest | Firebase network access | YES | Normal | NO | NO | NO |
| `ACCESS_NETWORK_STATE` | Transitive (RN/Firebase) | Connectivity awareness for merge/sync | YES | Normal | NO | NO | NO |
| `VIBRATE` | `expo-notifications` | Notification feedback | YES | Normal | NO | NO | NO |
| `WAKE_LOCK` | Transitive (FCM library) | Inert (app doesn't use remote push) | Indirect only | Normal | NO | NO | Not worth pursuing (transitive, inert, non-sensitive) |
| `POST_NOTIFICATIONS` | `expo-notifications` | Daily-reminder local notification | YES, genuinely | Runtime (user grants via OS prompt) | NO (standard runtime permission) | NO | NO |
| `RECEIVE_BOOT_COMPLETED` | `expo-notifications` | Re-schedule notifications after reboot | YES, indirect | Normal | NO | NO | NO |
| ~~`SYSTEM_ALERT_WINDOW`~~ | First-party manifest (unused, present since initial commit) | None identified | NO | N/A | Was required | YES | **REMOVED this run** |
| `READ_EXTERNAL_STORAGE` (`maxSdkVersion=32`) | App manifest | Legacy local backup-export | YES, capped | Runtime on API ≤32 only | NO (legacy-capped) | NO | NO — still needed for min-SDK-24 compatibility |
| `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion=32`) | App manifest | Same | Same | Same | NO | NO | NO |
| `DUMP` | Transitive (dev tooling) | None (signature-permission, inert for a released app) | NO | N/A (unrequestable by third-party apps) | NO | NO | Not worth pursuing |
| FCM (`c2dm.*`) permissions | Transitive (Firebase) | Inert (no remote push used) | NO | N/A | NO | NO | Same as `WAKE_LOCK` |
| OEM launcher-badge permissions | Transitive (`expo-notifications`) | Inert unless the app sets a badge count (it doesn't) | NO | N/A | NO | NO | Not practically removable, zero risk |

## Owner feature confirmations — all match source exactly

Location: NO (confirmed, no `expo-location`). Camera: NO (confirmed, no `expo-camera`). Microphone: NO (confirmed, `expo-speech` is output-only TTS). Photos/files: NO *first-party feature* beyond the legacy backup-export path already accounted for above. Overlay: NO — **now also true of the manifest itself**, closing the one prior contradiction (`SYSTEM_ALERT_WINDOW` was present with no matching feature; it no longer is).

## Status

**Sensitive permissions: PASS.** The one contradiction found in `PLAY-001-DECLARATIONS` (`SYSTEM_ALERT_WINDOW` present, unused) is now resolved by actual removal, not merely flagged.
