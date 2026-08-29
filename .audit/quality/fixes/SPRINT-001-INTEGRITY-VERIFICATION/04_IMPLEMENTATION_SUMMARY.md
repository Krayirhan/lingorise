# SPRINT-001 — Implementation Summary

Baseline revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Working revision: uncommitted working tree on top of the baseline

## Files changed

New:
- `src/domain/sync/progressMerge.ts`
- `src/domain/sync/clockAnomaly.ts`
- `src/domain/sync/remoteSync.ts` (added post-review — see "Independent review corrections" below)

Modified:
- `src/services/firestore.ts`
- `src/services/storage.ts`
- `src/services/auth.ts`
- `src/state/useUserProgress.ts`
- `src/app/AppBootstrap.tsx`
- `src/app/AppNavigator.tsx`
- `src/features/profile/components/DataManagementCard.tsx`
- `src/features/profile/components/AccountManagementCard.tsx`
- `src/features/profile/profile.types.ts`
- `src/i18n/profile.ts`
- `firestore.rules`
- `tests/testSuite.ts`
- `tests/firestoreRules.test.ts`

## Root causes fixed

1. No canonical schema for "user progress" → 8 fields silently discarded on cold-start merge (DATA-QA-002 / RELEASE-QA-001 / MAINT-QA-001).
2. Remote fetch failure indistinguishable from remote absence (DATA-QA-001).
3. "Irreversible" local reset actually reversible (and, on closer trace, actively destructive to cloud data) for signed-in users (DATA-QA-003).
4. Reset-operation and cloud-sync failures reported as silent success (REL-QA-003 / REL-QA-004).
5. Non-atomic account-deletion ordering with an incomplete cleanup scope and a false-success risk on partial failure (DATA-QA-004 / SEC-QA-003).
6. Test oracle hand-reimplemented production merge logic instead of calling it (VERIFY-QA-001).
7. Tautological clock-anomaly test (VERIFY-QA-002).
8. No server-side validation on owner-writable progress fields (SEC-QA-001) / no `dailyTasks` cross-user rules test (SEC-QA-005).

## Architecture changes

One new pure module, `src/domain/sync/progressMerge.ts`, owns the canonical merge for every `UserData` field via a `Record<keyof UserData, FieldStrategy>` registry — compiler-enforced: adding a `UserData` field without updating the registry fails to typecheck. `mergeAndSyncUserData()` in `firestore.ts` now delegates to this pure function instead of containing its own inline merge logic. No DI container, schema framework, or event bus was introduced.

## Data model changes

None. `UserData`'s shape (`src/types/user.ts`) is unchanged — this sprint classifies existing fields, it does not add, remove, or reshape any.

## Merge behavior changes

- `passedLevelExams`, `celebratedLevels`, `favoriteWordIds`, `dailyReviewXpIds`: now explicitly unioned (previously silently remote-wins).
- `dailyQuests`: now merged per quest id, taking the richer progress on either side (previously silently remote-wins, whole-array replace).
- `questHistory`: now unioned by `(date, questId)` identity (previously silently remote-wins).
- `practiceHistory`: now merged per date, richer counts on a shared date, union across distinct dates (previously silently remote-wins).
- `level`: now takes the higher ordinal level (previously silently whatever the buggy spread left in place — effectively unpredictable).
- `lastActiveDate`: now takes the later of the two dates (previously silently remote-wins).
- `xp`, `streak`, `learningProgress`, `solvedQuestionIds`, `rewardedQuestionIds`, `unlockedBadges`: unchanged (already correct), now routed through the same canonical function instead of separate inline logic.
- Account-setting fields (`locale`, `dailyGoalMinutes`, `practiceSessionSize`, `notificationsEnabled`, `soundEnabled`, `reduceMotion`, `avatarId`, `displayName`, `lastKnownServerDate`, `schemaVersion`): unchanged (remote-authoritative), preserved deliberately since no audit flagged a defect here.
- `activeSession`, `lastCompletedWord`: now explicitly device-local (local always wins), never resurrected from or overwritten by a remote merge.

## Fetch-failure behavior changes

`fetchUserDataResult()` (new) distinguishes `found` / `absent` / `failed`. `mergeAndSyncUserData()` now throws `RemoteStateUnknownError` on `failed` instead of treating it identically to `absent` — the caller (`AppBootstrap`) already discards any thrown-merge error without persisting or pushing anything, so this closes the destructive-overwrite path without any new architecture. `fetchUserData()` remains as a thin, backward-compatible wrapper for the one caller (`useUserProgress.refresh()`'s optional clock-reference read) where the found/absent/failed distinction doesn't matter.

## Reset semantics changes

"Reset Local Data" (`DataManagementCard`) now: (1) calls a new `reloadLocalOnly()` instead of `refresh()` — the previous wiring pushed the freshly-wiped local state straight to Firestore via `syncUserData`/`syncUserProgress`, meaning a "reset LOCAL data" action was silently destroying a signed-in user's cloud progress; (2) shows different confirm copy for a cloud-synced account (clarifying cloud progress is unaffected and will be restored on next sync) vs. a guest account (genuinely irreversible); (3) shows a distinct failure dialog if the underlying clear reports failure, instead of always showing success.

## Account deletion changes

`deleteAccount()` now throws `PartialAccountDeletionError` (wrapping the underlying cause) if Firestore deletion succeeded but the Firebase Auth deletion failed, so the UI can tell the user their data is already gone and only the credential removal needs retrying. `deleteUserData()` now also purges the `users/{uid}/dailyTasks` subcollection, which was previously never cleaned up (same gap shape as the historical `items` subcollection fix). No claim of cross-service atomicity is made — the residual limitation (a brief window where Firestore data is gone but the Auth account remains, until a successful retry) is documented in `08_RESIDUAL_RISK.md`, not hidden.

## Test architecture changes

`tests/testSuite.ts`'s multi-device merge test now calls the real `mergeUserData()` production function — no hand-copied merge formula remains. Test coverage was expanded to a full field-merge regression matrix (27+ distinct assertions covering every historically-omitted field, idempotency, A→B→A convergence, stale-snapshot safety, partial/fresh-local-state safety, and migrated-data compatibility) plus a direct reproduction of the historical DATA-QA-002 scenario. The clock-anomaly test now calls the real `detectClockAnomaly()` function with meaningful inputs/outputs instead of `assert(true, ...)`. `tests/firestoreRules.test.ts` gained a `dailyTasks` cross-user denial assertion and field-validation assertions.

## Migration/backward compatibility

No migration changes. The existing `normalizeUserData()` pipeline (`migrateV1ToV2`/`migrateV2ToV3`/`fillDefaults`) is untouched. A migrated (v1-shaped) local record was added to the merge test matrix to confirm it still merges correctly against a richer remote record.

## Firestore rule changes

**YES.** Added `isValidUserDoc()` field validation (non-negative `xp`/`streak`, `level` must be one of the six valid codes, several array-typed fields must actually be lists) to `create`/`update` on `users/{userId}` and `users/{userId}/progress/main`. `read`/`delete` and every other existing rule (including the pre-existing `dailyTasks`/`items` owner-only rules) are unchanged in substance — only split from a combined `read, write` into explicit `read` / `create, update` / `delete` rules so the validation function could be applied to writes without erroring on `request.resource` being null during a delete.

## User-facing copy changes

**YES**, minimal: (1) the reset-data confirmation dialog now shows different, accurate copy for a cloud-synced account vs. a guest account (new `resetDataConfirmSynced` key in both `en`/`tr` i18n files); (2) a new reset-failure dialog ("Yerel veriler sıfırlanamadı. Lütfen tekrar dene."); (3) account-deletion failure alerts now distinguish "your data is already deleted, only the account credential remains" from a full failure. No screen layout, visual hierarchy, palette, or navigation was changed.

## Known residual limitations

See `08_RESIDUAL_RISK.md` for the full list — summary: Firestore emulator rules tests could not be executed locally (pre-existing JDK version gap); account deletion cannot be made truly cross-service-atomic on a client-only architecture; `RemoteStateUnknownError`'s failure path (an actual live network failure during `fetchUserDataResult`) is not exercised by an executable test, only by direct code reading, since it requires a live/mocked Firestore SDK.

## Independent review corrections (applied after initial implementation)

1. **Day-boundary safety for daily-scoped fields (`code-reviewer`, HIGH).** `dailyQuests` and `dailyReviewXpIds` are reset every calendar day but carry no date of their own; the initial merge implementation could let a stale remote day's `completed: true` silently mark a freshly-rolled-over day's quest complete by id. Fixed with a new `mergeDailyScopedValue()` helper in `progressMerge.ts`: these two fields now only apply their richer-merge logic when both sides share the same `lastActiveDate`; across a day boundary, the more current side wins outright. A named regression test reproduces the exact scenario.
2. **`favoriteWordIds` merge coverage gap (`test-reviewer`, HIGH).** Added a direct union assertion — this field had a registry entry but no assertion exercising `mergeUserData`'s actual handling of it.
3. **Remote-absent-vs-failed overclaim (`test-reviewer`, MEDIUM).** The merge test section referenced `GLOBAL-QA-003` without any executable coverage of that decision. Extracted the pure `decideMergeAction()` function (previously inline in `firestore.ts`) into a new, Firebase-SDK-free module `src/domain/sync/remoteSync.ts`, making it directly unit-testable; added three real assertions.
4. **`lastCompletedWord` label/behavior mismatch (`code-reviewer`, LOW).** Its `DEVICE_LOCAL` strategy label said "never resurrected from another device," but the code had a `?? remote.lastCompletedWord` fallback. Fixed to strictly local, matching the label.

See `06_REVIEW_RESULTS.md` for the full review transcript and reasoning.

## Explicit non-goals

CORE-QA-001/CORE-QA-002, Accessibility/Localization/Performance/Reliability findings not in Sprint 1's Global scope, Privacy Policy hosting, EAS/Play signing, branch protection, secret scanning, Dependabot, CI hardening, production observability — all deferred to Sprint 2/3 per `MASTER-001-CONSOLIDATION/07_THREE_SPRINT_PLAN.md`.
