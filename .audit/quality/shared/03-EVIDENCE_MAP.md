# 03-EVIDENCE_MAP

Shared Discovery ID: SHARED-DISCOVERY-001
Revision: 16b9aab

Pointers only — no judgment, no severity, no scoring. Future domain audits read the relevant group(s) instead of re-discovering paths.

## CORE_LOGIC
- `src/state/useAppSession.ts` — `pickNewWords()`, `buildDailySession()`, `useAppSession()` (startPractice/startExam)
- `src/domain/learning/levelExam.ts` — `buildLevelExam()`, `isExamAvailable()`, `isExamPassed()`
- `src/domain/learning/promotion.ts` — `evaluatePromotion()`, `assessLevelChoice()`
- `src/domain/practice/answer.ts`, `distractors.ts`, `reverseMode.ts`
- Tests: `tests/testSuite.ts` — session-building, exam, promotion sections (see Birim-numbered blocks throughout the file)

## DATA_STORAGE
- `src/services/storage.ts` — `CURRENT_SCHEMA_VERSION`, `migrateV1ToV2()`, `migrateV2ToV3()`, `normalizeUserData()`, `loadUserData()`, `saveUserData()`, `clearAllLocalData()`, `resetUserData()`
- `src/types/user.ts` — `UserData` shape, `RawUserData`
- Config/runtime surface: AsyncStorage keys (defined inside `storage.ts`)
- Tests: `tests/testSuite.ts` migration-related assertions

## OFFLINE_SYNC
- `src/services/firestore.ts` — `mergeAndSyncUserData()`, `syncUserData()`, `syncUserProgress()`, `syncLearningItemProgress()`
- `src/services/catalogueService.ts` — `loadCatalogue()` (cache→bundled fallback path)
- `src/app/AppBootstrap.tsx` — `onAuthStateChanged` handling, guest/auth transition
- Tests: `tests/testSuite.ts` cold-start/merge assertions (referenced in `.audit/state/FINDING_REGISTRY.md` history as DATA-001, not re-read here)

## AUTHENTICATION
- `src/services/auth.ts` — `register()`, `login()`, `logout()`, `resetPassword()`, `sendVerificationEmail()`, `deleteAccount()`, `isGuestMode()`/`enableGuestMode()`/`disableGuestMode()`
- `src/services/authErrors.ts` — `getAuthErrorMessage()`
- `src/services/firebase.ts` — `auth` instance init
- `src/screens/AuthScreen.tsx`
- `src/features/profile/components/AccountManagementCard.tsx` — logout/delete-account/verify/reset-password call sites

## FIRESTORE_AUTHORIZATION
- `firestore.rules` — `users/{userId}` + subcollections (`progress`, `dailyTasks`, `items`), `contentMeta`, `contentVersions`, `units`, `items`
- `firestore.indexes.json`
- Tests: `tests/firestoreRules.test.ts` (requires JDK 21+ emulator; local run failed on this machine this pass — see 04-VERIFICATION_STATE.md)

## PRIVACY_DATA_LIFECYCLE
- `src/features/profile/components/DataManagementCard.tsx` — export (`exportUserDataJSON`), reset (`clearAllLocalData`), privacy-policy link
- `src/services/storage.ts` — `exportUserDataJSON()`, `importUserDataJSON()`, `clearAllLocalData()`
- `src/services/auth.ts` — `deleteAccount()`
- `src/services/firestore.ts` — `deleteUserData()`
- `src/components/AppDialog.tsx` — branded confirm/notice dialog used for reset-data confirm/success (and exit-practice)

## RELIABILITY_ERROR_HANDLING
- `src/services/errorReporter.ts` — `withRetry()`, `isOfflineError()`, `reportError()`
- `src/services/catalogueService.ts` — network-call timeout wrapper (per commit history)
- `src/app/AppBootstrap.tsx` — auth-state fallback timer (per commit history)
- `src/app/AppNavigator.tsx` — `startPracticeSafe`/`startExamSafe` (toast on failed session build)

## ARCHITECTURE
- Layering: `domain/` (pure logic) ← `state/` (hooks) ← `screens/`/`features/*/components` (UI) ← `services/` (Firebase/storage/external)
- Barrel re-export pattern: `src/services/gamification.ts`, `src/services/spacedRepetition.ts` (thin re-exports of `domain/`)
- `src/app/AppNavigator.tsx` — central composition point wiring state hooks to screens

## CODE_QUALITY
- Largest files (line count): `PracticeHubScreen.tsx` 480, `GardenHeroCard.tsx` 476, `useUserProgress.ts` 463, `DataManagementCard.tsx` 448, `WordNotebookModal.tsx` 420, `storage.ts` 391, `AppNavigator.tsx` 376, `AuthScreen.tsx` 337, `AccountManagementCard.tsx` 294
- TODO/FIXME count in `src/`: 0
- See `05-STATIC_ANALYSIS_INDEX.md` for tooling availability

## PERFORMANCE
- `src/services/catalogueService.ts` — remote fetch + cache/bundled fallback (network-bound path)
- `src/content/questions/*.ts`, `src/content/vocabulary/*.ts` — bundled content size (largest: `a1ExampleSentences.ts` 351 lines, `a2Generated.ts` 336 lines)
- No dedicated perf test/benchmark harness found in `tests/`

## ACCESSIBILITY
- `src/components/SkeletonLoader.tsx` — `reduceMotion`/`isMotionReduced` handling
- `src/features/profile/components/AvatarPicker.tsx`, `EditableAccountName.tsx` — accessibility labels (per commit history, ACC-001 closure)
- `src/features/onboarding/components/*.tsx` — `accessibilityRole`/`accessibilityLabel` on interactive elements (WelcomeStep, GoalStep, LevelStep, ReadyStep)
- `src/components/AppDialog.tsx` — `accessibilityRole="alert"`, `accessibilityLiveRegion`, decorative-icon `importantForAccessibility="no"`
- Tests: `tests/testSuite.ts` — a11y-related assertion blocks (`npm run test:a11y` aliases the same suite)

## COMPATIBILITY
- `app.json` — Android package `com.lingorise.app`; iOS `bundleIdentifier` present but no committed `ios/` project
- `android/` — native Gradle project, min/target SDK defined inside `android/build.gradle` / `android/app/build.gradle` (not read in this pass)
- `react-native-web` present in dependencies (web target exists but is not the release focus)

## LOCALIZATION
- `src/i18n/{en,tr,auth,home,onboarding,practice,profile,progress}.ts`
- Tests: `tests/testSuite.ts` has a hardcoded-label/localization scan (referenced in commit history as "Bölüm 44")

## TESTING
- `tests/testSuite.ts` — 1782 lines, 342 assertions (this revision), custom runner (no Jest/Mocha)
- `tests/firestoreRules.test.ts` — 38 lines, Firestore emulator-based
- `.maestro/smoke.yaml` — E2E smoke flow
- `package.json` scripts: `test`, `test:a11y` (same suite), `test:rules`, `test:e2e:smoke`

## ANDROID_SECURITY
- `android/app/` — manifest/signing config location (not read in detail this pass)
- `.env` / `.env.example` — env var handling (real IDs previously replaced per commit history, SEC-002 in old registry — not re-verified here)
- `src/services/firebase.ts` — client config (not a secret boundary; Firestore rules are the actual access-control boundary)

## ANDROID_RELEASE
- `eas.json` — build profiles
- `.github/workflows/ci.yml` — `android-build` job (release APK)
- `android/build.gradle`, `android/app/build.gradle` — native build config (not read in detail this pass)

## CI_CD
- `.github/workflows/ci.yml` — 3 jobs: `verify`, `android-build`, `e2e-smoke`
- No branch-protection rule on `main` confirmed in prior project-audit history (not re-verified in this discovery pass; old finding, not carried in as a conclusion)

## DEPENDENCIES
- `package.json` — dependencies/devDependencies listed in `01-PROJECT_PROFILE.md`
- `npm audit` capability available (not run in this pass — see `05-STATIC_ANALYSIS_INDEX.md`)

## SUPPLY_CHAIN_REPO
- Repository is public (per prior project-audit history, not re-verified this pass)
- `.gitignore` — excludes `.mcp.json`; `.claude/settings.local.json` excluded via global gitignore (verified in a prior session, not re-checked here)
- No `.npmrc`/private-registry config found

## TELEMETRY
- `src/services/telemetry.ts` — `track()`, `getRecentEvents()`, `clearTelemetry()` (local-only event log)
- Call sites: `src/screens/PracticeScreen.tsx` (`session_abandoned`), `src/state/useAppSession.ts` (`practice_session_started`, `level_exam_started`), `src/features/home/components/LevelPromotionModal.tsx` (`level_promotion_shown`, `level_promotion_advanced`)
