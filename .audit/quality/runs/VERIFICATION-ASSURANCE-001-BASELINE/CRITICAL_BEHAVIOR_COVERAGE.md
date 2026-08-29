# VERIFICATION-ASSURANCE-001-BASELINE — Critical Behavior Coverage Matrix (Pass A, Blind)

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Critical behavior | Unit/domain test | Integration test | E2E | Rules test | Runtime | Assurance |
|---|---|---|---|---|---|---|
| Practice question generation | YES (`buildDailySession`, real function) | NO | NO (Maestro flow doesn't answer questions) | N/A | Manual (prior sessions) | MODERATE |
| Answer evaluation | YES (`applyPracticeAnswer`, real function) | NO | NO | N/A | Manual | MODERATE |
| XP / reward idempotency | YES (first-encounter vs. already-rewarded scenarios via real function) | NO | NO | N/A | Manual | MODERATE |
| Daily quests | YES (`updateDailyQuests`, real function, per shared discovery) | NO | NO | N/A | Manual | MODERATE |
| Streak / day rollover | YES (`updateDailyStreak`, real function) | NO | NO | N/A | Manual | MODERATE |
| Clock-manipulation / suspicious-date detection | **TAUTOLOGICAL** (`assert(true, ...)`, VERIFY-QA-002) | NO | NO | N/A | Not observed | **WEAK** |
| Level completion / exam pass-fail | YES (real `isExamPassed`, strong boundary values) | NO | NO | N/A | Manual | MODERATE-STRONG |
| Exam-mode reward differentiation (vs. practice mode) | **NO** — `applyPracticeAnswer` never exercised with `sessionMode: "EXAM"` in any test | NO | NO | N/A | Not observed | **NONE** — this exact gap is why CORE-QA-001 (a separate, already-completed audit's finding) went undetected |
| Terminal fully-learned level state | YES (`buildLevelExam` returning fewer than pass-threshold for thin content) | NO | NO | N/A | Manual | MODERATE |
| Local persistence save/load | YES for pure `normalizeUserData` | **NO** — `loadUserData()`/`saveUserData()`'s actual `AsyncStorage` calls are never executed (test environment has no `AsyncStorage`) | NO | N/A | Manual | WEAK |
| Schema migration | YES (extensive, real functions, multiple legacy shapes) | NO | NO | N/A | N/A | STRONG |
| Local/cloud merge | **WEAK/COUPLED** — real `mergeAndSyncUserData()` never called (VERIFY-QA-001) | NO | NO | N/A | Manual (one real two-device test, per historical registry, scenario-limited) | **WEAK** |
| Guest → account transition | Partially (guest-mode flag logic) | NO | Partially (Maestro flow starts as guest but never signs in) | N/A | Manual | WEAK-MODERATE |
| Offline behavior | Reasoned from architecture (local-first design), not executed under simulated offline conditions | NO | NO | N/A | Manual | WEAK |
| Cloud failure (sync/fetch rejection) | **NONE** — no test simulates a rejected Firestore call | NO | NO | N/A | Not observed | **NONE** |
| Authentication (login/register/reset/delete) | **NONE** — `auth.ts`'s functions are never executed by any automated test | NO | NO (Maestro flow never signs in) | N/A | Manual | **WEAK** |
| Cross-user Firestore isolation | NO (not a domain-function concern) | N/A | N/A | **YES — strong, real emulator** | N/A | **STRONG** |
| Account deletion | **NONE** | NO | NO | N/A | Not observed | **NONE** |
| Reset (local data) | **NONE** for the actual `AsyncStorage.multiRemove`/`removeItem` calls | NO | NO | N/A | Not observed | **WEAK** |
| Error/recovery states (storage failure, sync failure, empty catch paths) | **NONE** | NO | NO | N/A | Not observed | **NONE** |
| Interrupted practice/session restore | **NONE** — the `activeSession` restore path in `useAppSession.ts` is never executed by any test | NO | NO | N/A | Not observed | **NONE** |
| Critical navigation journeys | NO | NO | Partially (one shallow onboarding→home→practice-hub path) | N/A | Manual | WEAK |

## Summary

Assurance is consistently STRONG-to-MODERATE for pure, hand-invokable domain functions and for Firestore-rules authorization specifically. It is consistently WEAK-to-NONE for anything requiring real storage I/O, real network calls, real UI interaction beyond one shallow path, or negative/failure-injection scenarios — this is a structural gap in the test environment's capabilities (plain `ts-node`, no `AsyncStorage`, no React rendering), not a scattering of unrelated small gaps.
