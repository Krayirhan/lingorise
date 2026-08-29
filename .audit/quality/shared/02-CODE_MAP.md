# 02-CODE_MAP

Shared Discovery ID: SHARED-DISCOVERY-001
Revision: 16b9aab

Compact responsibility map. No scoring, no findings.

## APP BOOTSTRAP
- `src/app/AppBootstrap.tsx` — `AppBootstrap()`. Waits on Firebase `onAuthStateChanged` (with a fallback timer per commit history) before rendering; owns top-level guest/authenticated branch.
- `src/app/AppNavigator.tsx` (~376 lines) — screen switch/routing, wires `useAppSession`/`useUserProgress` view-models into screens, defensive `startPracticeSafe`/`startExamSafe` wrappers (toast on failed session build).

## NAVIGATION / SCREEN SHELL
- `src/screens/*.tsx`: `HomeScreen`, `PracticeHubScreen` (~480 lines), `PracticeScreen`, `GameScreen`, `ProgressScreen`, `ProfileScreen`, `AuthScreen` (~337 lines), `OnboardingScreen`.
- Bottom nav: `src/features/home/components/HomeBottomNav.tsx` (referenced by PracticeHubScreen et al.).

## LEARNING DOMAIN
- `src/domain/learning/levelExam.ts` — `EXAM_QUESTION_COUNT`, `EXAM_PASS_COUNT`, `buildLevelExam()`, `isExamAvailable()`, `isExamPassed()`.
- `src/domain/learning/promotion.ts` — `evaluatePromotion()`, `assessLevelChoice()`.
- `src/domain/learning/mastery.ts` — `createLearningItem()`, `isLeech()` (`LEECH_THRESHOLD=8`), `deriveStatus()`, `recordLearningOutcome()`, `summarizeMastery()`, `mergeLearningProgress()`, `countMasteredWords()`.
- `src/domain/review/spacedRepetition.ts` — legacy SM-2-style scheduling logic (117 lines); re-exported via `src/services/spacedRepetition.ts` barrel.
- `src/domain/practice/{answer,distractors,reverseMode}.ts` — answer evaluation, distractor generation, EN↔TR reverse-mode transform.
- `src/state/useAppSession.ts` — `pickNewWords()`, `buildDailySession()`, `useAppSession()` hook (session lifecycle, `startPractice`/`startExam` boolean-returning).

## GAMIFICATION
- `src/domain/gamification/xp.ts` — `calculateGardenProgress()`.
- `src/domain/gamification/streak.ts` — `updateDailyStreak()`.
- `src/domain/gamification/badges.ts` — `DAILY_QUEST_PRACTICE_ID`/`DAILY_QUEST_REVIEW_ID`, `createDailyQuests()`, `archiveDailyQuests()`, `evaluateBadges()`, `updateDailyQuests()`.
- `src/domain/gamification/dailyRollover.ts` — daily quest/streak rollover logic.
- `src/services/gamification.ts` — barrel re-export of the four files above.

## USER STATE
- `src/state/useUserProgress.ts` (463 lines) — top-level user-progress hook; XP/streak/quest/level mutation surface consumed by screens.
- `src/types/user.ts` — `UserData`, `DailyQuest`, `ActiveSessionState`, etc.

## LOCAL STORAGE
- `src/services/storage.ts` (391 lines) — `CURRENT_SCHEMA_VERSION=3`, `DEFAULT_USER_DATA`, `migrateV1ToV2()`, `migrateV2ToV3()`, `normalizeUserData()`, `loadUserData()`, `saveUserData()`, `exportUserDataJSON()`, `importUserDataJSON()`, `clearAllLocalData()`, `resetUserData()`.

## FIREBASE / CLOUD SYNC
- `src/services/firebase.ts` — `auth`, `db` (Firestore) instances, app init.
- `src/services/firestore.ts` — `fetchUserData()`, `deleteUserData()`, `syncUserData()`, `syncUserProgress()`, `syncLearningItemProgress()`, `mergeAndSyncUserData()` (guest→auth merge path).
- `src/services/catalogueService.ts` — `loadCatalogue()` (remote content w/ cache→bundled fallback, per commit history has an 8s timeout wrapper).
- `src/services/contentService.ts` — `getNextPracticeQuestion()`, `getRecommendedWord()`.
- `firestore.rules` (45 lines) — collections: `users/{userId}` (+ `progress`, `dailyTasks`, `items` subcollections), `contentMeta/{documentId}`, `contentVersions/{versionId}`, `units/{unitId}`, `items/{itemId}`.
- `firestore.indexes.json` — composite index definitions.

## AUTH
- `src/services/auth.ts` — `isGuestMode()`, `enableGuestMode()`, `disableGuestMode()`, `getCurrentUser()`, `register()`, `login()`, `logout()`, `resetPassword()`, `sendVerificationEmail()`, `deleteAccount()`.
- `src/services/authErrors.ts` — `getAuthErrorMessage()` (tr/en mapping).
- `src/screens/AuthScreen.tsx` — registration/login form screen.

## PROFILE / ACCOUNT
- `src/screens/ProfileScreen.tsx` — composes profile sections (Account/Stats grouped, Preferences grouped, Data/About tail).
- `src/features/profile/components/`: `AccountManagementCard.tsx` (294 lines, avatar/name/verify/logout/delete-account), `ProfileStatsCard.tsx`, `LanguageSettingsCard.tsx`, `SoundAndMotionCard.tsx`, `DataManagementCard.tsx` (448 lines, export/reset/privacy), `DevClockCard.tsx` (dev-only), `AvatarPicker.tsx`, `EditableAccountName.tsx`.

## NOTIFICATIONS
- `src/services/notificationService.ts` — `scheduleDailyReminder(hour=19)`, `cancelDailyReminder()`. Uses `expo-notifications`.

## TELEMETRY
- `src/services/telemetry.ts` — `track()`, `getRecentEvents()`, `clearTelemetry()`. Local-only event log (no third-party analytics SDK found in dependencies).
- `src/services/errorReporter.ts` — `withRetry()`, `isOfflineError()`, `reportError()`.

## I18N
- `src/i18n/{en,tr,auth,home,onboarding,practice,profile,progress}.ts` — flat per-domain copy objects, `en`/`tr` pairs.

## ANDROID
- `android/` — native Gradle project (`build.gradle`, `app/`, `gradle/`), committed and buildable (CI builds a release APK from it).
- `app.json` — Expo config: package `com.lingorise.app`, plugins `[expo-asset, expo-notifications, expo-font, expo-sharing, expo-status-bar]`.

## CI / RELEASE
- `.github/workflows/ci.yml` — jobs `verify` (typecheck+test+test:rules, JDK 21 for the rules step), `android-build` (release APK), `e2e-smoke` (Maestro against the APK).
- `eas.json` — `preview` (internal APK) / `production` (app-bundle, autoIncrement) build profiles.
- `.maestro/smoke.yaml` — E2E smoke flow.

## TESTS
- `tests/testSuite.ts` (1782 lines) — unit/domain assertions, 342 as of this revision.
- `tests/firestoreRules.test.ts` (38 lines) — Firestore rules emulator tests.

## CONTENT
- `src/content/questions/{a1,a2,a2Generated,b1,b2,c1,c2,difficulty,index}.ts` — bundled question pools per level.
- `src/content/vocabulary/{a1CoreVocabulary,a1ExampleSentences}.ts` (351 lines for examples).
- `src/content/levels.ts` — level metadata.

## SCRIPTS / TOOLING
- `scripts/seedFirestore.ts` — Firestore content seeding script.
- `.claude/` — project-local Claude Code skills/agents (audit, review, scope-gate tooling; not application code).
