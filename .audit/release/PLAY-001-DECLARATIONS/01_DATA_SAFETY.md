# Data Safety Audit

Evidence source priority followed: application source → native manifest/AAB → installed dependencies → Firebase config → runtime behavior → public privacy/deletion pages.

## Data category matrix

| Category | Collected | Shared | Purpose | Required/Optional | Encrypted in transit | Deletion supported | Evidence |
|---|---|---|---|---|---|---|---|
| Email address | YES (signed-in users only; guest mode collects none) | NO | Account creation/authentication | Optional (guest mode fully functional without it) | YES (Firebase Auth, HTTPS/TLS) | YES (`deleteAccount()`, `src/services/auth.ts`) | `src/services/firebase.ts` (`getAuth`), `src/services/auth.ts` |
| User ID (Firebase Auth UID) | YES (signed-in only) | NO | Associate progress data to account | Required if signed in | YES | YES (deleted with account) | Same |
| App activity / learning progress (XP, streak, level, solved questions, learning history) | YES, cloud-synced only if signed in; local-only otherwise | NO | Core app functionality (progress sync across devices) | Optional (guest mode: local only, never leaves device) | YES (Firestore over HTTPS) | YES (`deleteAccount()` purges the Firestore doc; "Reset Local Data" clears local copy) | `src/domain/sync/progressMerge.ts`, `src/services/firestore.ts` |
| Device/local storage (settings, active session state) | Local only, never transmitted | NO | On-device preferences (sound, notifications, reduce-motion, active practice session) | N/A (never leaves device) | N/A | YES ("Reset Local Data") | `src/services/storage.ts`, `AsyncStorage` |
| Diagnostics / crash logs | **NO** | NO | N/A | N/A | N/A | N/A | Confirmed: no crash-reporting SDK in `package.json` (no Crashlytics, Sentry, or equivalent) |
| Analytics / usage analytics sent to a server | **NO** | NO | N/A | N/A | N/A | N/A | Confirmed: no analytics SDK in `package.json` (no Firebase Analytics, Amplitude, Mixpanel, etc.) |
| In-app usage logs (screen opens, session completion) | Local only, never transmitted | NO | N/A (on-device only) | N/A | N/A | YES ("Reset Local Data") | Established in Sprint 3's Privacy Policy content, verified consistent with source — no telemetry call exists anywhere in `src/` |
| Device identifiers | **NO** | NO | N/A | N/A | N/A | N/A | No `expo-device`/advertising-ID/IDFA-equivalent usage found in dependencies or source |
| Push notification tokens | **NO** | NO | N/A | N/A | N/A | N/A | `src/services/notificationService.ts` uses only local `scheduleNotificationAsync`; never calls `getExpoPushTokenAsync` or any server endpoint |
| Advertising data | **NO** | NO | N/A | N/A | N/A | N/A | No ad SDK present (see `04_ADS.md`) |
| Purchases / subscriptions | **NO** | NO | N/A | N/A | N/A | N/A | No IAP/billing SDK (`react-native-iap`, `expo-in-app-purchases`, RevenueCat, etc.) in `package.json` |
| Camera | **NO** | NO | N/A | N/A | N/A | N/A | No `expo-camera`/`expo-image-picker` dependency, no `CAMERA` permission in manifest |
| Microphone | **NO** | NO | N/A | N/A | N/A | N/A | No `expo-av`/audio-recording dependency for input, no `RECORD_AUDIO` permission. (`expo-speech` is text-to-speech output only, no microphone input) |
| Location | **NO** | NO | N/A | N/A | N/A | N/A | No `expo-location` dependency, no location permission in manifest |
| Contacts | **NO** | NO | N/A | N/A | N/A | N/A | No `expo-contacts` dependency, no contacts permission |
| Photos/files (read/write) | Technically possible via `READ/WRITE_EXTERNAL_STORAGE` (legacy, `maxSdkVersion=32`) | NO | Backup-JSON export/share (`exportUserDataJSON`, `expo-sharing`, `expo-file-system`) — writes to the app's own cache directory for sharing the user's own data export, not reading the user's photo library | Optional (only triggered by the user's own explicit "Export Data" action) | N/A (local file only) | YES (part of local data, cleared by "Reset Local Data") | `src/features/profile/components/DataManagementCard.tsx`'s `handleExport`, `expo-file-system`/`expo-sharing` dependencies |
| Third-party APIs / data sharing | **NO third party beyond Firebase itself** | NO | N/A | N/A | N/A | N/A | Firebase (Auth + Firestore) is the sole external service; no other network call target found in `src/services/` |

## Summary for the Google Play Data Safety form

- **Data collected:** Account info (email), User IDs, App activity (learning progress) — all **optional** (guest mode collects none of it).
- **Data shared with third parties:** **NONE.**
- **Data encrypted in transit:** **YES**, for all collected categories (Firebase Auth/Firestore over HTTPS/TLS).
- **Data deletion:** **YES** — in-app account deletion (Firestore doc + Auth account) and local "Reset Local Data," both independently confirmed in source across Sprint 1/2/3's own verified fixes.
- **No** analytics, crash reporting, advertising, or device-identifier collection of any kind.

## Classification

**Data Safety: READY** — every field above is evidence-backed (VERIFIED), not guessed. No field required OWNER CONFIRMATION, since none of the ambiguous categories (financial, health, sensitive personal info, precise location, SMS/call logs) apply to this app at all, confirmed by the complete absence of any supporting SDK/permission/code path.
