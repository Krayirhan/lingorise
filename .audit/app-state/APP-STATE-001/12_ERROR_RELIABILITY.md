# 12 — Error Handling &amp; Reliability

| Area | Rating | Evidence |
|---|---|---|
| React ErrorBoundary | GOOD | Class boundary with real remount-on-restart fix (`restartKey` forces unmount/remount — REL-QA-002 fix for a previous fake-recovery bug) |
| Auth stall / network hang | GOOD | 8s fallback timer forces a guest state if `onAuthStateChanged` never fires, so bootstrap can never hang forever |
| Firebase/auth error messages | GOOD | 11-code table mapped to tr/en friendly strings with generic fallback |
| Sync/merge failure | GOOD | Distinguishes "absent" vs. "failed" remote reads; a failed read throws and blocks merge/push rather than risking an overwrite |
| Retry logic | ACCEPTABLE | Exponential-backoff retry wrapper used on all Firestore reads/writes; a related `isOfflineError` helper exists but appears unused anywhere (dead code) |
| Storage corruption / invalid local state | GOOD | Shape-based (not version-trusting) migrations run on every load; JSON.parse failures fall back to defaults instead of crashing |
| Save/clear failure reporting | GOOD | Save/clear operations return real success/failure instead of assuming success (REL-QA-003 fix) |
| Invalid content | ACCEPTABLE | `validateQuestionDatabase()` checks duplicates/shape, but appears wired at test/build time rather than as a runtime user-facing guard |
| Notification scheduling failure | GOOD | Wrapped in try/catch, degrades gracefully (notably in Expo Go, where the native module throws on init) |
| Crash reporting | **WEAK** | `reportError` only logs to console; no Sentry/Crashlytics or equivalent integration exists despite an extensibility comment |

## Loading / Empty States
- Bootstrap has a dedicated loading screen for both auth-pending and hydration-pending — no blank-page risk at startup.
- PracticeHubScreen explicitly handles the "level fully learned" terminal state (CORE-004 fix) instead of a dead CTA.
- Home/Progress/Profile screens have no local loading/error state of their own — they rely entirely on the top-level `isHydrated` gate one level up, so there's no risk of a screen-level infinite spinner, but also no per-screen recovery if a sub-hook throws after hydration (not separately verified).

## Notable defect found
`src/components/ErrorBoundary.tsx` hardcodes Turkish crash-screen copy directly in the component, even though matching translation keys already exist in both the `en` and `tr` i18n dictionaries — the ErrorBoundary never imports/uses locale. **An English-locale user who hits a crash still sees a Turkish error screen.** This is the one confirmed untranslated surface in the app's actual UI (see 14_LOCALIZATION.md).

**Overall: reliability engineering is a clear strength of this codebase** — most failure modes have been identified and fixed with named regression tests (REL-QA-002/003/004, DATA-QA-001). The two real gaps are the missing crash-reporting integration and the ErrorBoundary's i18n bypass.
