# RELIABILITY-001-BASELINE — Async / Race Review

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Area | Risk considered | Finding | Status |
|---|---|---|---|
| Login/auth state initialization | Race between `onAuthStateChanged` firing and the 8s fallback timer | `settled` boolean flag correctly prevents both paths from double-firing; `clearTimeout` on real callback and on unmount | PASS (E2) |
| Cloud sync (`updateAndPersist`) | Overlapping saves from rapid successive updates | Each call is independent (`setUserData` functional updater + fire-and-forget `Promise.all`); no explicit sequencing/queue, but Firestore's own `setDoc` full-object writes make out-of-order completion a last-write-wins scenario consistent with the rest of the sync design (already assessed for correctness in DATA-001-BASELINE; no additional reliability-specific crash/dead-end found) | PASS (no reliability-distinct defect; cross-domain note only) |
| Practice submission | Double-tap / rapid repeated submit | `submitted` state conditionally unmounts the Check button; `onCheck` cannot fire again until `resetQuestionState` runs on `onNext`/`onRetry` | PASS (E2) |
| Exam submission / result recording | Double-recording exam completion (e.g. re-render, remount) | `examResultRecordedRef` in `AppNavigator.tsx` keys on a joined question-id string and only records once per unique exam attempt | PASS (E2) |
| Persistence scheduling | Local save vs. cloud sync ordering | Local `saveUserData` is always attempted regardless of cloud outcome; cloud failure never blocks or reorders the local write | PASS (E2) |
| Reset/delete account | Overlapping/duplicate delete taps | `AccountManagementCard.tsx` gates the delete action behind a `busy` flag set before the async call and reset in every catch/finally path | PASS (E2) |
| Navigation while async operation is pending (catalogue load) | Stale/late callback overwriting current state after a level switch | **REL-QA-001**: `AppBootstrap.tsx`'s catalogue-loading effect has no cancellation token or generation counter; a stale in-flight `loadCatalogue()` call for a previously-selected level can resolve after a newer one and overwrite the module-level `setRuntimeQuestions()` with outdated content | FAIL (bounded) — E2 |
| Cleanup/unsubscribe behavior | Effects leaking after unmount | `onAuthStateChanged` unsub, deep-link listener `.remove()`, and the auth timeout's `clearTimeout` are all correctly returned as cleanup functions | PASS (E2) |
| Interrupted session restore | Late state write after app-kill mid-answer | Session-restore itself does not race (state is loaded synchronously into `useState` initializers); the narrow duplicate-answer window on restore (cross-referenced as CORE-QA-002 in CORE-001-BASELINE) is a data-correctness artifact of a specific interruption timing, not an async race condition per se | PARTIAL, cross-domain — no additional reliability scoring impact |

## Summary

The app's async design is generally disciplined: fire-and-forget cloud writes never block local usability, busy/loading flags are consistently reset in `finally`-equivalent paths, and the two places genuine idempotency matters (practice-answer submission, exam-result recording) both have explicit guards. The one confirmed, distinctly reliability-flavored race is the catalogue-loading effect's missing request-ordering guard (REL-QA-001) — narrow in trigger condition (requires two rapid level switches with unlucky network completion order) but real and reachable through ordinary UI action (`LevelSwitcherModal`).
