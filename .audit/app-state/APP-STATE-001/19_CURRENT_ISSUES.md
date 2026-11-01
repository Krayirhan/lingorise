# 19 — What Is Actually Missing

## A. MUST FIX BEFORE NEXT APP DEVELOPMENT MILESTONE
1. **B1-C2 content is non-functional** (3-5 questions/level vs. 100+ needed; exams unseatable below 50). The app claims A1-C2 coverage but only delivers ~2 of 6 levels. This is a genuine defect against the app's stated scope, not a future ambition.
2. **ErrorBoundary hardcodes Turkish, bypassing i18n** — an English-locale user sees Turkish text on any crash screen, despite the translation keys already existing.

## B. SHOULD IMPROVE SOON
1. No crash-reporting integration (console-only `reportError`) — production crashes are currently invisible to the team.
2. Auth flows (register/login/logout/delete) have no automated test coverage beyond error-message mapping — regressions here would only surface manually.
3. No offline write-retry queue — a failed background sync is silently dropped until the next mutation or explicit refresh (mitigated by idempotent full-state pushes, but still a gap under sustained connectivity loss).
4. Firestore rules validation is shallow on `items`/`dailyTasks` subcollections compared to the main user document.
5. Two small dead-code items (`GameScreen.tsx`, `isOfflineError`) — low risk, easy cleanup.
6. Accessibility live-region coverage and explicit font-scaling handling are thin outside the specifically-tested components.
7. Favorites has no dedicated domain module or tests — logic lives directly in a UI component.

## C. FUTURE ROADMAP
1. Dark mode / theme switching (not present, not currently expected).
2. Notification-tap deep-link handling (reminder currently just opens the app via OS default).
3. Additional locales beyond Turkish/English, RTL support.
4. Realtime (`onSnapshot`) multi-device sync instead of sync-on-open/refresh only.
5. Content-authoring pipeline/tooling to scale B1-C2 (and beyond) vocabulary generation, if the roadmap calls for full CEFR coverage.
