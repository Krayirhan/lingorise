# 01-PROJECT_PROFILE

Shared Discovery ID: SHARED-DISCOVERY-001
Revision: 16b9aab1f776503ec52067d4f543af8ab6f2e9aa (main = origin/main)

## Product purpose
React Native / Expo English-vocabulary learning app for Turkish-speaking learners. A1-C2 level flow, daily practice sessions, gamification (XP/streak/badges), garden-growth visual metaphor, single deliberate level-completion exam (not per-word spaced-repetition promotion).

## Target platform(s)
Android is the buildable/shippable target (`android/` native project present, CI builds a release APK). iOS has only `bundleIdentifier` config in `app.json` — no committed `ios/` project. Web target exists via `react-native-web`/`expo start --web` but is not the release focus.

## Framework/runtime
- Expo SDK ~56, React Native 0.85.3, React 19.2.3
- TypeScript ~6.0.3, strict mode (see tsconfig)
- Metro bundler, `expo-status-bar`, `expo-system-ui`

## Key dependencies
- `firebase` ^12.18.0 (Auth + Firestore client SDK)
- `@react-native-async-storage/async-storage` 2.2.0 (local persistence)
- `expo-notifications`, `expo-speech`, `expo-sharing`, `expo-file-system`, `expo-font`, `expo-asset`
- `@expo/vector-icons`
- Dev: `firebase-tools`, `@firebase/rules-unit-testing`, `ts-node`, `typescript`

## Persistence model
Local-first: AsyncStorage is the authoritative local store (`src/services/storage.ts`, `CURRENT_SCHEMA_VERSION = 3`, versioned migrations v1→v2→v3). Firestore is an optional cloud mirror/sync layer, not a requirement for app function.

## Backend/cloud model
Firebase-only BaaS — no custom server. Firestore used for: user progress sync (`src/services/firestore.ts`), content catalogue/versioning (`src/services/catalogueService.ts`, `src/services/contentService.ts`). No Cloud Functions found in this repo.

## Authentication model
Firebase Auth (email/password) via `src/services/auth.ts` (register/login/logout/resetPassword/sendVerificationEmail/deleteAccount) plus an explicit guest mode (`isGuestMode`/`enableGuestMode`/`disableGuestMode`, also AsyncStorage-backed).

## Guest/local-first behavior
App is fully functional without an account (guest mode). Signing in triggers merge/sync (`mergeAndSyncUserData` in `firestore.ts`) rather than overwrite. Local data reset/export available in Profile (`DataManagementCard`).

## Major learning mechanics
- Daily practice: new-word-only session builder (`src/state/useAppSession.ts: buildDailySession`), no per-word review resurfacing in the daily flow.
- Level completion: single 60-question exam per level, 50+ correct passes (`src/domain/learning/levelExam.ts`), gates promotion (`src/domain/learning/promotion.ts`).
- Legacy SRS/mastery machinery (`src/domain/review/spacedRepetition.ts`, `src/domain/learning/mastery.ts`) still exists and still drives: badge unlocking, garden-growth stage, and the "remind me later" bookmark — but no longer drives daily practice selection or promotion (per project history; see prior commits, not re-verified in this discovery pass).
- Gamification: XP (`domain/gamification/xp.ts`), streak (`domain/gamification/streak.ts`), badges (`domain/gamification/badges.ts`), daily quests (`daily rollover/archival` in `dailyRollover.ts`).

## Release/build model
EAS Build (`eas.json`): `preview` profile → internal APK, `production` profile → app-bundle with autoIncrement. CI (`​.github/workflows/ci.yml`) has 3 jobs: `verify` (typecheck + unit tests + Firestore rules tests), `android-build` (release APK build), `e2e-smoke` (Maestro flow against the built APK on an emulator).

## Testing stack
- Unit/domain tests: `tests/testSuite.ts` (ts-node, custom assert-based runner, no external test framework), 342 assertions as of this revision.
- Firestore Rules tests: `tests/firestoreRules.test.ts` via `@firebase/rules-unit-testing` + `firebase emulators:exec` (requires JDK 21+).
- E2E smoke: `.maestro/smoke.yaml` (Maestro, run against release APK in CI and locally against a connected emulator).

## IN-SCOPE quality concerns
- Correctness of core learning/progression logic (domain layer)
- Local persistence integrity, migration correctness
- Firestore rules authorization (tenant isolation per `userId`)
- Guest↔authenticated merge/sync correctness
- Reliability of local-first behavior on poor/no network
- Accessibility of interactive UI (labels, reduceMotion, TalkBack-observable behavior)
- Android release build health, CI gate integrity
- Dependency health for a small single-maintainer app
- Basic supply-chain hygiene (no secrets in repo, branch protection posture)

## OUT-OF-SCOPE enterprise requirements
- Multi-region/high-availability backend architecture (single Firebase project, no custom server)
- Enterprise observability/APM, SOC2-style compliance tooling
- Payments, health data, or other regulated-data handling (none present)
- Real-time multi-device collaboration
- iOS release readiness (no committed `ios/` project at this revision)
- Horizontal scaling concerns (BaaS-managed, not self-hosted infra)

## Consumer Design (explicitly not scored here)
Consumer Design has its own independent audit history under `.audit/consumer/` (CONSUMER-001-BASELINE, CONSUMER-002-REAUDIT, CONSUMER-003-REAUDIT). This Shared Discovery does not read, copy, or reference its scores — future quality audits must not anchor on it.
