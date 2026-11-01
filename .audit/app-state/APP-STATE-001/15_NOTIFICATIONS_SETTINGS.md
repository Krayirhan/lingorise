# 15 — Notifications &amp; Profile/Settings

## Notifications
- `expo-notifications` is lazily required and explicitly disables itself in Expo Go (the native module throws there on SDK 53+) — degrades gracefully rather than crashing.
- Daily reminder: creates an Android notification channel before requesting permission (Android 13+ requirement), cancels any existing reminder before scheduling a new one, wired to a Profile toggle.
- **Not implemented:** no notification-tap / deep-link response handling exists anywhere — tapping the daily reminder just opens the app via default OS behavior; the app's own `lingorise://` deep-link handling is unrelated and not connected to notifications.

## Profile / Settings — all implemented, none are placeholders
- Display name, avatar picker, language setting, notifications toggle (backed by real scheduling), sound &amp; reduce-motion toggles, account management (logout, delete-account with confirmation + partial-failure handling, password reset, email verification), data export/import/reset.
- **Not implemented:** no dark-mode/theme switcher — app is single-theme (light only).
- A dev-only diagnostics card exists and is explicitly no-op in release builds.

**Assessment: Profile/Settings is one of the most completely implemented areas of the app** — every visible control has a real handler, nothing is a dead stub, though most of it lacks automated test coverage.
