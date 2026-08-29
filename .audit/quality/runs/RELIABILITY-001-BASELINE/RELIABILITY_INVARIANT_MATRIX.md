# RELIABILITY-001-BASELINE — Invariant Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Invariant | Implementation owner | Evidence | Status |
|---|---|---|---|
| A recoverable network failure must not crash the app | `src/services/catalogueService.ts` (timeout + remote→cache→bundled fallback), `src/services/errorReporter.ts` (`withRetry`, `isOfflineError`) | E2 | PASS |
| An expected Firebase rejection must not leave the UI permanently loading | `AppBootstrap.tsx` bounded 8s auth-state timeout → falls back to guest; `AuthScreen.tsx` `try/finally` resets `busy`; `useUserProgress.ts` catches sync rejections, never blocks on them | E2 | PASS |
| Repeated user input must not execute a critical action twice | `PracticeScreen.tsx` conditionally unmounts the Check button once `submitted` is true; `AppNavigator.tsx`'s `examResultRecordedRef` guards exam-result recording to once per attempt; `markLevelExamPassed` is explicitly idempotent | E2 | PASS |
| An interrupted session should return to a coherent supported state | `useAppSession.ts` persists `activeSession` (questionIds/currentIndex/answers/mode), restores with a clamped `currentIndex`; falls back to `home`/`onboarding` if restored questions don't resolve | E2 | PARTIAL — restore itself is coherent and crash-free, but can produce a duplicate-answer entry in a narrow interruption window (see REL-QA note; root cause and scoring owned by CORE-001-BASELINE's CORE-QA-002, cross-domain observation only here) |
| Malformed optional persisted data should not make the app unusable | `storage.ts`'s `loadUserData()`/`normalizeUserData()`/`fillDefaults()` — full try/catch, shape-detecting migrations, safe defaults for every field | E2 | PASS |
| An empty candidate pool should produce a defined terminal/empty state | `useAppSession.ts`'s `startPractice`/`startExam` return `false` on empty pool; `AppNavigator.tsx`'s `startPracticeSafe`/`startExamSafe` surface a toast instead of silently no-op'ing | E2 | PASS |
| A failed background/cloud operation should not silently break local usability | `useUserProgress.ts`'s `updateAndPersist`/`refresh` — cloud sync is fire-and-forget/caught, local save/state always proceeds regardless of cloud outcome | E2 | PASS (local usability preserved) — but see REL-QA-004: the user has no way to know sync is failing |
| Async completion after navigation/unmount should not create harmful stale state | Most effects are React-state-scoped and safe; **exception**: `AppBootstrap.tsx`'s catalogue-load effect writes to a module-level function (`setRuntimeQuestions`) with no request-ordering guard | E2 | FAIL (REL-QA-001) — narrow, requires rapid level-switch timing |
| Loading/error states should have a reachable exit path | Auth flows recover via try/finally; ErrorBoundary provides a fallback screen with an action button | E2 | PARTIAL — the ErrorBoundary's action button doesn't actually remount/reload (REL-QA-002); no realistic render-throw path was found this pass, so this is a hardening/coverage gap, not a demonstrated dead-end |
| Failure handling should not rely exclusively on console logging | Most user-impacting failures (save failure, empty pool, auth errors) reach the toast/UI layer | E2 | PARTIAL — cloud-sync failures (REL-QA-004) and local-storage-clear failures (REL-QA-003) are console-only |
| Ordinary restart should recover from previously persisted valid state | `storage.ts` load path + `useAppSession.ts` restore path both function correctly for well-formed prior state | E2 | PASS |

Legend: PASS = invariant holds. PARTIAL = holds in the common case, a real bounded gap exists. FAIL = a concrete, evidenced defect. NOT VERIFIED = genuinely not established this pass (not treated as FAIL).
