# SPRINT-001 — Root Cause & Invariant Plan

Baseline revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Working revision: uncommitted working tree on top of the baseline (no commit made)

## Sprint 1 Global findings

GLOBAL-QA-001, GLOBAL-QA-002, GLOBAL-QA-003, GLOBAL-QA-004, GLOBAL-QA-005, GLOBAL-QA-006, GLOBAL-QA-007, GLOBAL-QA-013, GLOBAL-QA-014, GLOBAL-QA-031 (see `01_MASTER_SCOPE_MAP.md`).

## Root-cause clusters involved

CLUSTER-001 (progress schema & merge completeness), CLUSTER-002 (remote-absent vs. remote-failure), CLUSTER-003 (reset semantics), CLUSTER-004 (account-deletion lifecycle), CLUSTER-008 (test-oracle/failure-path assurance) — from `MASTER-001-CONSOLIDATION/03_ROOT_CAUSE_CLUSTERS.md`.

## Actual production call chains (traced from current source, not assumed)

**Signed-in cold start:**
`AppBootstrap`'s `onAuthStateChanged` callback → `loadUserData()` (storage.ts) → `mergeAndSyncUserData(uid, localData)` (firestore.ts) → `fetchUserDataResult(uid)` → branch on `found`/`absent`/`failed` → (`found`) `mergeUserData(local, remote)` (progressMerge.ts, pure) → `syncUserData()` + `syncUserProgress()` (write-through to Firestore) → `saveUserData(mergedData)` (local persist) → `userProgress.refresh()`.

**Local rollover / cold start hydration:** `useUserProgress`'s `init()` effect → `loadUserData()` → `updateDailyStreak()` → `applyDailyRollover()` → `setUserData()` → `saveUserData()` skipped when `auth.currentUser` is set (the merge above is the sole writer for that case; unchanged by this sprint).

**Ongoing progress writes:** `updateAndPersist()` (useUserProgress.ts) → `saveUserData()` (local) +, if signed in, `Promise.all([syncUserData(), syncUserProgress()])` (fire-and-forget cloud sync) → now instrumented with `noteCloudSyncOutcome()`.

**Signed-in local reset:** `DataManagementCard`'s `executeReset()` → `clearAllLocalData()` (storage.ts, now returns `{success, data}`) → on success, `userProgress.reloadLocalOnly()` (new — loads from AsyncStorage only, no Firestore write) → success/failure dialog.

**Account deletion:** `AccountManagementCard`'s `executeDelete()` → `deleteAccount()` (auth.ts) → `deleteUserData(uid)` (firestore.ts: purges `items`, now also `dailyTasks`, then `progress/main`, then `users/{uid}`) → `deleteUser(user)` (Firebase Auth) → on Auth failure, throws `PartialAccountDeletionError` wrapping the cause → UI distinguishes "data gone, auth pending" from a full failure.

**Failed sync then cold restart (the historical DATA-QA-002 scenario):** device passes a level exam locally → `updateAndPersist`'s background `syncUserData`/`syncUserProgress` call fails (network/service) → app restarts → `AppBootstrap`'s merge runs against a stale remote copy that never received the exam pass → **before this fix**, the merge's `{...local, ...remote}` spread silently discarded the local-only `passedLevelExams` entry (and 7 other fields) because they were absent from the explicit re-merge list → **after this fix**, `mergeUserData()` classifies `passedLevelExams` as `UNION_STRING_ARRAY`, so the local-only pass survives unconditionally, regardless of which fields the old code happened to re-list.

## Data invariants (reconstructed from actual source, not assumed)

See `03_FIELD_SEMANTICS_MATRIX.md` for the full per-field table. Summary of invariant families actually found in the codebase:

- **Monotonic achievement (never regress):** `xp`, `streak` (existing, unchanged — `Math.max`), `lastActiveDate` (later date wins), `level` (higher ordinal wins — new; previously silently took whichever the merge happened to leave in place).
- **Fact sets (once true, stays true everywhere):** `solvedQuestionIds`, `rewardedQuestionIds`, `unlockedBadges` (existing, unchanged — `Set` union), `passedLevelExams`, `celebratedLevels`, `favoriteWordIds`, `dailyReviewXpIds` (new — previously NOT unioned, silently remote-wins).
- **Richer structured records:** `learningProgress` (existing `mergeLearningProgress`/`pickRicherRecord`, unchanged), `dailyQuests` (new — per-quest-id richer-progress merge, previously silently remote-wins), `questHistory`/`practiceHistory` (new — append-only-log union / same-day richer-counts merge, previously silently remote-wins).
- **One-way flags:** `onboardingCompleted`, `hasSeenGardenExplainer` (OR-true).
- **Device-local/transient (never cross-device merged):** `activeSession`, `lastCompletedWord`.
- **Account settings (unflagged, unchanged behavior):** `locale`, `dailyGoalMinutes`, `practiceSessionSize`, `notificationsEnabled`, `soundEnabled`, `reduceMotion`, `avatarId`, `displayName`, `lastKnownServerDate`, `schemaVersion` — remote-authoritative, matching the app's existing behavior for these fields; no audit flagged a defect here, so behavior is preserved, not changed.

## Failure-state model

`RemoteUserDataResult` (`src/services/firestore.ts`):
- `{status:"found", data}` — remote document exists and was read successfully.
- `{status:"absent"}` — remote document genuinely does not exist (first sign-in on this account).
- `{status:"failed", error}` — the read itself failed (network/service/auth-transition); remote truth is UNKNOWN, not empty.

`mergeAndSyncUserData()` throws `RemoteStateUnknownError` on `failed` — the caller (`AppBootstrap`) already treats any thrown error from the merge as "leave local state untouched, do not persist or push anything," which is the correct safe default; this sprint additionally makes that failure visible to the user via `reportCloudSyncFailure()` instead of console-only.

`AUTH_NOT_READY` / `SIGNED_OUT` / `LOCAL_DATA_PRESENT` / `LOCAL_DATA_ABSENT` map onto existing, unchanged code: `auth.currentUser` truthiness gates every sync call site (unchanged); `loadUserData()` already returns `DEFAULT_USER_DATA` for an absent/corrupt local record (unchanged, not part of this defect family).

## Architecture strategy

One canonical pure merge function (`mergeUserData`) driven by one canonical, compiler-enforced field-strategy registry (`PROGRESS_FIELD_STRATEGY: Record<keyof UserData, FieldStrategy>`) — chosen over a schema framework, DI container, or runtime-reflection approach because the project is a small mobile app with one merge site; the registry's `Record<keyof UserData, ...>` typing already gives full compile-time exhaustiveness (adding a `UserData` field without updating the registry fails to typecheck), and the function itself is plain, readable, directly unit-testable TypeScript with no framework dependency. See `progressMerge.ts` for the full rationale comment.

## Test strategy

Tests call `mergeUserData()` and `detectClockAnomaly()` directly — no hand-copied algorithm in test code (previously the root cause of VERIFY-QA-001). See `04_TEST_EVIDENCE.md` for the full matrix.

## Migration strategy

No data-shape change was made to `UserData` itself — `PROGRESS_FIELD_STRATEGY` classifies existing fields, it does not add or remove any. `normalizeUserData()`'s existing migration pipeline (`migrateV1ToV2`/`migrateV2ToV3`/`fillDefaults`) is unchanged and untouched; a migrated (v1-shaped) local record is exercised through the new merge path in the test matrix (see `04_TEST_EVIDENCE.md`) to confirm no regression.

## Non-goals (explicitly out of scope this sprint)

- No fix for CORE-QA-001/CORE-QA-002, Accessibility, Localization, Performance, or Reliability findings not listed above (Sprint 2 scope).
- No Privacy Policy hosting, EAS/Play work, branch protection, secret scanning, Dependabot, or CI hardening (Sprint 3 scope).
- No attempt to make Firestore + Firebase Auth account deletion transactionally atomic — the client-only architecture cannot provide that; the residual limitation is documented in `08_RESIDUAL_RISK.md`, not hidden.
- No new offline-queue architecture, DI container, event bus, schema framework, or runtime reflection.
- No change to `xp`/`streak`/`learningProgress`/`solvedQuestionIds`/`rewardedQuestionIds`/`unlockedBadges`'s existing (already-correct) merge behavior beyond routing them through the same canonical function.

## Risks

- `level`'s new HIGHER_LEVEL merge strategy is a genuine behavior change (previously it silently took whichever value the buggy spread happened to leave — effectively unpredictable/remote-leaning). The new behavior (higher ordinal wins) is a deliberate, documented choice consistent with how `passedLevelExams`/`xp` are already treated, not an accidental side effect — flagged here for reviewer scrutiny per the sprint's own review checklist.
- Firestore rules validation (`isValidUserDoc`) could in principle reject a legitimate write if a future code change ever writes an out-of-range value for the validated fields; scope was deliberately kept to the handful of fields most directly tied to SEC-QA-001's fabrication concern, not the full document shape, to bound this risk.
- Firestore emulator rules tests could not be executed locally (pre-existing JDK 17 vs. required 21+ gap) — the new rules and rules-test assertions are E2 static-verified (careful reading + the existing test's established pattern), not E3 executable-verified, this pass. See `04_TEST_EVIDENCE.md` and `08_RESIDUAL_RISK.md`.

## Rollback considerations

Every change in this sprint is additive/corrective to existing call sites, not a data-shape migration — reverting the diff requires no data cleanup. `firestore.rules` changes are the only server-side artifact; reverting them requires a rules redeploy (not performed by this sprint — no deployment of any kind was done).
