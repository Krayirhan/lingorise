# ARCHITECTURE-001-BASELINE — Architecture Map

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

Graphify was not used to produce this map (not available as a callable tool in this session's toolset); structural relationships below are established via direct source/import inspection (E2 static-certain), not a graph-tool run (E3). Confidence is HIGH regardless — every dependency-direction claim is a grep-verified import fact, not inference.

| Area | Primary modules | Responsibility | Allowed dependencies | Actual dependencies | Ownership clarity |
|---|---|---|---|---|---|
| App / Bootstrap | `src/app/AppBootstrap.tsx` | Auth-state gating, guest/authenticated branch, catalogue load, deep-link routing | state/, services/ | state/, services/, screens/AuthScreen | Clear — single entry composition root |
| Navigation | `src/app/AppNavigator.tsx` (~376 lines) | Screen switch/routing, wiring state hooks to screen props | state/, screens/, domain/ (for promotion/exam checks) | state/, screens/, domain/learning, services/telemetry | Clear — single central router |
| Screens / UI | `src/screens/*.tsx` | Presentation only | state/ (via props), i18n/ | state/ (via props), i18n/, components/ — zero direct Firebase/AsyncStorage imports found | Clear |
| State / Session ownership | `src/state/useAppSession.ts`, `src/state/useUserProgress.ts` | Own all runtime session + persisted user state | domain/, services/ | domain/, services/ | Clear — `useUserProgress` is the single owner of `UserData`; `useAppSession` owns transient session/screen-routing state |
| Domain / learning logic | `src/domain/learning/*`, `src/domain/practice/*`, `src/domain/review/*` | Pure business rules (exam building, promotion, mastery, answer evaluation, distractors) | content/, types/, utils/, other domain/ files | Verified via grep: **zero** imports of React, Firebase, or AsyncStorage anywhere in `src/domain/` | Clear — fully pure, no infrastructure leakage |
| Gamification | `src/domain/gamification/*` (xp, streak, badges, dailyRollover) | XP/streak/quest/badge rules | content/, utils/, other domain/ | Same as above — pure | Clear |
| Local persistence | `src/services/storage.ts` | AsyncStorage read/write, schema migration, defaults | domain/ (for merge helpers), AsyncStorage | domain/learning/mastery indirectly via type re-export, AsyncStorage | Clear — sole local-persistence owner |
| Cloud / Firebase | `src/services/firestore.ts`, `src/services/firebase.ts`, `src/services/catalogueService.ts` | Firestore reads/writes, guest→auth merge, content catalogue fetch+fallback | domain/, storage.ts (for `normalizeUserData`) | domain/learning/mastery, storage.ts, errorReporter.ts | Mostly clear, with one real gap — see ARCH-QA-001 |
| Auth | `src/services/auth.ts`, `src/services/authErrors.ts` | Firebase Auth operations, guest-mode flag | firebase.ts, AsyncStorage | firebase.ts, AsyncStorage, firestore.ts (`deleteUserData`) | Mostly clear — see ARCH-QA-002 for two exceptions |
| Notifications | `src/services/notificationService.ts` | Schedule/cancel daily reminder | expo-notifications, Platform | expo-notifications, Platform only — fully isolated | Clear |
| Telemetry | `src/services/telemetry.ts`, `src/services/errorReporter.ts` | Local event log, retry/offline-detection helpers | AsyncStorage, logger | AsyncStorage, logger | Clear |
| Shared components | `src/components/*` | Presentational primitives (dialogs, buttons, error boundary) | theme/, i18n/ | theme/, i18n/ | Clear |
| Test boundaries | `tests/testSuite.ts`, `tests/firestoreRules.test.ts` | Domain/unit assertions, Firestore rules emulator tests | domain/, storage/ (partially), firestore.rules | domain/ heavily, storage.ts's pure `normalizeUserData` only (AsyncStorage-touching code not exercised — noted, not scored here per RELIABILITY-001's own prior finding) | Clear boundary, known coverage gap (verification concern, not architecture) |

## Notable structural facts (E2, grep-verified)

- Zero cross-feature imports found (`src/features/home` never reaches into `src/features/profile` internals, etc.).
- Zero `domain/` → `services/` imports (correct direction; no reverse coupling).
- Zero module cycles found in the areas checked (`storage.ts` ↔ `firestore.ts` do not import each other).
- `src/services/gamification.ts` and `src/services/spacedRepetition.ts` are pure re-export barrels with **zero real importers** anywhere in `src/` — see ARCH-QA-003.
- `src/features/profile/components/AccountManagementCard.tsx` and `DataManagementCard.tsx` are the only two files in `src/screens/` + `src/features/` that import Firebase directly (bypassing `services/auth.ts`) — see ARCH-QA-002.
- `src/services/firestore.ts` declares the "user progress" field set independently in three places (`syncUserData`'s full-object spread, `syncUserProgress`'s separately curated subset to a second document, `mergeAndSyncUserData`'s own hand-picked merge list) — see ARCH-QA-001.
