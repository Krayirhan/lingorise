# DATA-002-REAUDIT — Failure and Offline Matrix

## DATA-QA-001 — remote failure vs. absence, independently re-traced end-to-end

Actual production call chain (`src/app/AppBootstrap.tsx` → `src/services/firestore.ts` → `src/domain/sync/remoteSync.ts`):

```
onAuthStateChanged(user)
  → loadUserData()                                [storage.ts, unchanged]
  → mergeAndSyncUserData(uid, localData)           [firestore.ts]
      → fetchUserDataResult(uid)                   [firestore.ts — real I/O]
          → withRetry(() => getDoc(...), 2, 400)
              found  → {status:"found", data}
              not found (snap.exists() === false) → {status:"absent"}
              throws (network/service/auth-transition, after 2 retries) → caught → {status:"failed", error}
      → decideMergeAction(remoteResult, localData) [remoteSync.ts — pure]
          failed  → {action:"unknown-remote-state", error}
          absent  → {action:"first-sync", data: localData}
          found   → {action:"merge", data: mergeUserData(localData, normalizeUserData(remote))}
      → if action === "unknown-remote-state": throw RemoteStateUnknownError(error)
      → else: syncUserData(uid, decision.data); syncUserProgress(uid, decision.data); return decision.data
  → (back in AppBootstrap) await saveUserData(mergedData); userProgress.refresh()
  → catch (err) { console.warn(...); userProgress.reportCloudSyncFailure(); }
```

**Required questions, answered from this trace:**

1. **Remote document NOT_FOUND:** `decideMergeAction` returns `{action:"first-sync", data: localData}` — local data is pushed up as the account's first cloud record. Correct, unchanged behavior for a genuinely new signed-in account.
2. **Remote read rejection (e.g. permission-denied, service unavailable):** Caught by `fetchUserDataResult`'s `try/catch` after `withRetry` exhausts its 2 retries; returns `{status:"failed", error}`. `decideMergeAction` returns `{action:"unknown-remote-state"}`. `mergeAndSyncUserData` throws `RemoteStateUnknownError`. `AppBootstrap`'s `catch` block catches it, logs, and calls `reportCloudSyncFailure()` — **no `saveUserData`, no `syncUserData`, no `syncUserProgress` call occurs on this path.** Local state is left exactly as it was.
3. **Transient network error:** Same as #2 — `withRetry`'s error classification is generic (any thrown error triggers a retry, then ultimately propagates); a transient network error surfaces identically to a permission error at this layer. No special-cased "transient vs. permanent" distinction exists, which is proportionate (both cases correctly resolve to the same safe "unknown, do nothing destructive" outcome).
4. **Firebase/service error:** Same as #2/#3.
5. **Can a failed read still authorize local-over-remote overwrite?** **No** — confirmed by the trace above: the `unknown-remote-state` branch never reaches `syncUserData`/`syncUserProgress`, and it throws before `mergeAndSyncUserData` can return a value, so `AppBootstrap` never calls its own `saveUserData(mergedData)` either. Local storage and the remote document are both left untouched.
6. **Is unknown remote truth ever represented as empty remote state?** No — `{status:"failed"}` and `{status:"absent"}` are distinct union members, both in the type system and in `decideMergeAction`'s `if`/`if` branching (verified: `failed` is checked and returned before `absent` is ever considered, so there is no code path where a `failed` result falls through to being treated as `absent`).
7. **Can a subsequent Firestore write occur using guessed canonical state after a failed read?** No — see #5. The only writes reachable in `mergeAndSyncUserData` are inside the `first-sync` and `merge` branches, neither of which is reachable when `decideMergeAction` returns `unknown-remote-state`.

**DATA-QA-001 status: CLOSED.** The destructive-overwrite path is provably closed by direct code trace (E2, high confidence given the trace is short and unambiguous), reinforced by the decision logic's E3 executable test coverage (`tests/testSuite.ts` §56's three `decideMergeAction` assertions, confirmed independently re-run and passing). The only remaining gap is that the actual network I/O itself (a live `getDoc` throwing) is not exercised end-to-end by an executable test — this is an evidence-strength/confidence note, not a defect (see `06_TEST_AND_RUNTIME_EVIDENCE.md`).

## Failed sync → restart (RELEASE-QA-001 evidence trail), independently re-traced

```
1. Signed-in user passes a level exam locally.
   → markLevelExamPassed(level) → updateAndPersist(prev => ...passedLevelExams: [...prev, level])
   → saveUserData(next) [local write, succeeds]
   → Promise.all([syncUserData(uid, next), syncUserProgress(uid, next)])
       .catch(error => { console.warn(...); noteCloudSyncOutcome(false); })
   [SIMULATED FAILURE: this cloud sync fails — network drop, app backgrounded mid-request, etc.]
   → local storage now has the passed exam; remote Firestore document does NOT.
2. App terminates / restarts.
3. Cold start: AppBootstrap's onAuthStateChanged fires.
   → localData = loadUserData() → includes the passed exam (persisted in step 1's local write)
   → mergeAndSyncUserData(uid, localData)
       → fetchUserDataResult → {status:"found", data: <stale remote, exam NOT passed>}
       → decideMergeAction → {action:"merge", data: mergeUserData(localData, remote)}
       → mergeUserData: passedLevelExams = unionValues(local:[...,"A1"], remote:[...]) = includes "A1"
   → syncUserData/syncUserProgress persist the MERGED (exam-inclusive) result back to Firestore
   → return mergedData → saveUserData(mergedData) [local] → userProgress.refresh()
4. Canonical state (both local and remote) now correctly includes the passed exam.
```

Independently confirmed: the exam pass survives (via `passedLevelExams`'s `UNION_STRING_ARRAY` strategy), and the merged/canonical result — not the stale remote, not a partial local-only state — is what gets persisted in both places. This exact scenario is also directly reproduced as an executable regression test (`tests/testSuite.ts` §56, "cold start after failed cloud sync preserves passed level exam progress") — re-run and confirmed passing during this reaudit.

**Verification against related fields:** the same trace applies identically to `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate` — all reachable via the same merge call, all independently field-verified in `03_MERGE_AND_FIELD_MATRIX.md`. Core protected fields (`xp`, `streak`, `learningProgress`, `solvedQuestionIds`, `rewardedQuestionIds`, `unlockedBadges`) are unchanged from their already-correct pre-Sprint-1 treatment.

## Day-boundary defect recheck — independently re-verified against the full call chain

An earlier internal review (before this reaudit) found and corrected a real defect: `dailyQuests`/`dailyReviewXpIds` merging did not account for calendar-day boundaries, risking a stale remote day's `completed: true` silently blocking a freshly-rolled-over day's quest. This reaudit independently re-traced the fix against the ACTUAL end-to-end call chain (not just the isolated fix) to confirm it is both correct and non-redundant with `applyDailyRollover()`'s separate day-transition logic:

**Scenario A — local already reflects today, remote is stale (yesterday or older):** `mergeDailyScopedValue(local.lastActiveDate="today", remote.lastActiveDate="yesterday", ...)` → dates differ → `laterDateString` picks local → local's (today's, in-progress, correct) `dailyQuests`/`dailyReviewXpIds` are used outright, remote's stale-day state is discarded. Downstream, `AppBootstrap`'s subsequent `userProgress.refresh()` sees the merged `lastActiveDate` already equals today, so `isNewDay` is `false` and `applyDailyRollover()` does NOT re-run — **the merge's day-boundary guard is the ONLY thing preventing contamination in this scenario; it is not redundant.**

**Scenario B — local is stale, remote already reflects today (synced from another device):** Symmetric to A — remote's fresh state is used outright. `refresh()` again sees `isNewDay=false` for the same reason. Guard is load-bearing here too.

**Scenario C — both sides stale (same old date):** Dates are equal → `mergeDailyQuestsSameDay`'s richer per-quest-id merge applies to the (still-stale) shared day. Downstream, `refresh()`'s `loadUserData()` + `updateDailyStreak()` correctly detects `isNewDay=true` relative to the device's real current date, and `applyDailyRollover()` regenerates fresh quests for today and archives the (correctly-merged, most-complete) stale day's quests into `questHistory` via `archiveDailyQuests()`. No contamination: the eventual rollover supersedes the same-day merge result entirely.

**Scenario D — both sides already today:** Dates equal → richer same-day merge — the exact intended behavior (two devices both active today, converge on the union of their progress).

**Conclusion:** the fix is correct and specifically necessary for scenarios A/B, where `refresh()`'s own rollover does not fire (because the merged date already matches "today") and would otherwise leave the day-boundary contamination uncorrected. Independently verified, not merely trusted from the sprint's self-report.

## Offline safety

- **Guest/offline local use:** unaffected by Sprint 1 — no signed-in-only code path was touched in a way that changes guest behavior. `useUserProgress`'s `init()` effect still saves locally unconditionally for guests (`if (!auth.currentUser) await saveUserData(updated)`), unchanged.
- **Signed-in offline startup:** `mergeAndSyncUserData` → `fetchUserDataResult` fails (offline) → `unknown-remote-state` → throws → `AppBootstrap` catches, logs, surfaces a cloud-sync-failure notice, and leaves local state untouched. The user can continue using the app entirely from local state; `useUserProgress`'s own hydration (`init()`) already completed independently of the merge's outcome (both run in parallel `useEffect`s, not sequentially gated on each other).
- **Network unavailable during merge / returns later:** No retry queue exists for the merge itself (a fresh sign-in/cold-start attempt is what re-triggers it) — this is unchanged from before Sprint 1 and proportionate to the app's scale; the safety guarantee (no destructive action on failure) is what changed, not the retry architecture.
- **Local state preservation:** confirmed safe in every traced scenario above.
