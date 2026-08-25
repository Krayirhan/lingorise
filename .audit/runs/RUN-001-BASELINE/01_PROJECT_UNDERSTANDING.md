# 01 — Project Understanding

## Executive description
LingoRise is a React Native / Expo (SDK 56) mobile app that teaches English vocabulary to Turkish speakers (and vice versa) through a gamified, spaced-repetition ("SM-2"-style) practice loop: multiple-choice meaning-matching questions, daily streaks, XP, badges, and a "garden growth" progression metaphor. `CONFIRMED`.

## Product classification
Consumer mobile app (Android primary — `android/` is a committed native project with its own build/signing config; iOS bundle identifier declared in `app.json` but no committed `ios/` project, so iOS is config-only at this revision). Local-first data model with optional Firebase Authentication + Firestore cloud sync. `CONFIRMED`.

## Technical topology
- Language: TypeScript (strict mode, `tsconfig.json:3`), React 19.2.3 / React Native 0.85.3 / Expo ~56.
- State: custom hooks (`src/state/useUserProgress.ts`, `src/state/useAppSession.ts`), no Redux/MobX/Zustand.
- Local storage: `@react-native-async-storage/async-storage` via `src/services/storage.ts` (authoritative source of truth).
- Remote storage/backend: Firebase Firestore (`src/services/firestore.ts`), Firebase Auth (`src/services/auth.ts`, `src/services/firebase.ts`). No custom backend server.
- Auth: Firebase email/password + guest mode (local-only, no account).
- Network use: Firestore sync only when signed in; no other network calls found.
- Background jobs: none (no cron/queue); `expo-notifications` schedules a local daily-reminder notification only.
- Third-party SDKs: Firebase JS SDK, `expo-notifications`, `expo-speech` (TTS pronunciation), `expo-sharing`.
- Analytics/crash reporting: none wired to any external service — `src/services/telemetry.ts` is a **local-only** AsyncStorage ring buffer (200 events), explicitly documented as not sending data anywhere (telemetry.ts, header comment). `CONFIRMED`.
- Testing stack: custom `ts-node` assertion script (`tests/testSuite.ts`, 283 assertions, no Jest/RTL/Detox), `tests/firestoreRules.test.ts` (`@firebase/rules-unit-testing`), Maestro E2E smoke test (`.maestro/smoke.yaml`).
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`) — runs on PR and push to `main`: `npm ci` → `npm run typecheck` → `npm test` → `npm run test:rules`. No Maestro run, no release-build compile check in CI. `CONFIRMED`.

## Module/component map
```
src/
  app/         — AppBootstrap (auth listener, root error boundary wiring), AppNavigator
  screens/     — top-level screens (Auth, Onboarding, Home, Game, ...)
  features/    — screen-scoped feature slices (home, practice, profile) with their own hooks/components
  components/  — shared presentational components
  domain/      — pure business logic: review (SRS), learning (mastery/leech), gamification (xp/streak/badges/rollover), practice (answer/distractors/reverseMode)
  state/       — stateful React hooks orchestrating domain + storage + firestore + telemetry
  services/    — I/O boundaries: storage, firestore, firebase, auth, notifications, telemetry, error reporting
  content/     — static question banks (A1–C2) + content-unit helpers
  i18n/        — EN/TR copy dictionaries
  types/, utils/, theme/, context/ — supporting layers
```
`domain/*` is verified free of imports from `screens/`, `state/`, or `features/` (grep-verified) — the intended dependency direction (domain has no upward knowledge of UI/state) holds. `CONFIRMED`.

## Data flow
1. User answers a question → `applyPracticeAnswer` (pure, `domain/practice/answer.ts`) computes the new `UserData` snapshot (XP, streak contribution, mastery/leech state via `domain/learning/mastery.ts`, next review date via `domain/review/spacedRepetition.ts`).
2. `useUserProgress.updateAndPersist` writes the new snapshot to AsyncStorage **first** (`saveUserData`), then fires an async, non-blocking Firestore sync if the user is signed in.
3. On sign-in / cold start with a persisted session, `AppBootstrap.tsx`'s `onAuthStateChanged` handler merges local + remote (`mergeAndSyncUserData`, max-wins on XP/streak, item-level merge on `learningProgress`) and writes the merged result back to both AsyncStorage and Firestore.
4. Daily streak/rollover is derived from the device clock (`utils/clock.ts` → `nowDate()`) compared against `lastActiveDate`, with an added server-date cross-check (`checkServerDateAnomaly`, added in the SRS-hardening work) that only emits telemetry, never alters behavior.

## Trust/network boundaries
- Client ↔ Firestore is the only network trust boundary. Enforced via `firestore.rules`: per-user subcollections require `request.auth.uid == userId`; catalogue collections are public-read/no-write. `CONFIRMED` (source-read).
- No server-side code is present in this repository to independently audit (rules are declarative and directly inspectable; there is no Cloud Functions directory).

## Critical user state
- `learningProgress` (per-word SRS/mastery state), `streak`, `xp`, `solvedQuestionIds`/`rewardedQuestionIds`, `unlockedBadges`, `dailyQuests` — all persisted in a single `UserData` object in AsyncStorage, optionally mirrored to Firestore. Loss or corruption of this object is the project's single largest realistic failure mode (see `01_PROJECT_UNDERSTANDING` → Data flow and `07_DETAILED_AUDIT` → Data Integrity).

## Release target
Repository contains explicit pre-launch artifacts: `docs/roadmap/12-launch-readiness-checklist.md`, `docs/roadmap/17-data-safety-worksheet.md` (Play Store Data Safety form prep), `eas.json` with `preview`/`production` build profiles. This indicates the intended release target is a **public consumer app store release (Google Play primary)**, not an internal prototype. `STRONGLY_INFERRED` from documentation + build config; no evidence found that it has actually been published live (no store listing URL, no production `google-services.json` committed — expected, since it's gitignored).

## Known constraints
- No backend beyond Firebase (BaaS) — by design; this is a small-team/solo mobile app, not a distributed system.
- No committed `ios/` native project — iOS support is declared in config but not currently buildable from this checkout without `expo prebuild`.
- Extensive uncommitted build-log/screenshot noise exists at the repository root (`*.log`, ad-hoc `.png`) but all of it is `.gitignore`d and **not** tracked (`git ls-files` returns 224 tracked files, none of the noise files) — does not affect the actual shipped/reviewed codebase, only local working-directory hygiene.

## Unknowns / confidence
- Actual current Play Store publication status: `UNKNOWN` (no evidence either way in-repo).
- Real-world crash/error rate in production: `UNKNOWN` — no crash-reporting SDK (e.g., Sentry/Crashlytics) is wired up, so this audit cannot observe production runtime failures; all reliability conclusions in this run are based on source inspection and local test execution only (see `06_EVIDENCE_INDEX.md` limitations).
- iOS-specific runtime behavior: `UNKNOWN` — audit evidence is Android-weighted since that is the only buildable native project in this checkout.
