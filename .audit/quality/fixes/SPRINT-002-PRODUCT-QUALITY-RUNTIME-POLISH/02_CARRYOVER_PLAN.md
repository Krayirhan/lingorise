# SPRINT-002 — Carry-Over Plan (Phase A)

## DATA-QA-005 — level downgrade semantics

**Product contract determination (from actual source, not assumption):**
1. Is manual downgrade intentionally supported? **YES** — `LevelSwitcherModal.tsx`'s own doc comment: "Every level is selectable — access is never locked... Levels without enough content are the one exception."
2. What does downgrade mean? **A content-selection preference** — the level determines which word pool is shown for practice, independent of achievement. `passedLevelExams` (a separate, correctly-append-only field) is the actual achievement record.
3. Should it synchronize across devices? **Yes, but as "whichever device changed it most recently," not "whichever is higher."** All three call sites (`onboarding` choice, `LevelSwitcherModal` manual switch, automatic promotion after passing an exam) are equally legitimate, deliberate "this is the level now" moments.
4. Should a stale cloud higher level override it? **No** — that is exactly DATA-QA-005.
5. Is there enough metadata to determine intent? **Not before this fix.** Added the minimal metadata required: `levelSetAt?: number` (epoch ms), stamped in the single `setLevel()` callback all three call sites already funnel through.

**Root cause:** `level`'s merge strategy (`HIGHER_LEVEL`) was copied from the achievement-field pattern (`xp`, `passedLevelExams`) without checking whether `level` is actually monotonic. It is not.

**Minimal remediation:** One new optional field (`levelSetAt`), one write site (`setLevel`), one merge function (`pickLevelByRecency`) — no event sourcing, no history log. Backward-compatible: absent on old data, merge falls back to the pre-existing higher-wins heuristic only when neither side has ever stamped a timestamp.

**Required regression:** intentional downgrade → cold start → merge → downgrade survives (added); normal legitimate promotion still works (added); legacy fallback for pre-migration data (added). See `tests/testSuite.ts` §56 addendum.

## DATA-QA-006 — stale streak resurrection

**Actual current bootstrap chain (traced from source):**
```
AppBootstrap.onAuthStateChanged(user)
  → loadUserData()                    [storage.ts — schema migration/normalization ONLY, no rollover]
  → mergeAndSyncUserData(uid, localData)
```
Confirmed: `loadUserData()` never calls `updateDailyStreak`/`applyDailyRollover` — rollover previously only happened in `useUserProgress.ts`'s `init()`/`refresh()`, which run AFTER the merge (via `userProgress.refresh()` at the end of the sign-in flow). This is the exact root cause: the merge sees raw, potentially many-days-stale `streak`/`lastActiveDate`.

**Desired invariant:** stale streak state must be normalized to current-day semantics BEFORE it can influence canonical merged progress.

**Fix — two complementary layers (not redundant, each closes a different gap):**
1. **`mergeUserData` itself** (`src/domain/sync/progressMerge.ts`) now normalizes EACH side's `streak` via a new `normalizedStreak()` function (calls the real, unchanged `updateDailyStreak` against the actual current date) before taking `Math.max`. This closes the bug regardless of which side — local OR the fetched remote document — is the stale one, and regardless of caller behavior.
2. **`AppBootstrap.tsx`** additionally rolls the LOCAL side over to today via a new shared `rolloverToToday()` helper (extracted to `src/domain/gamification/dailyRollover.ts`) BEFORE calling the merge. This is still necessary because layer 1 only touches `streak`; it does not regenerate local's day-scoped `dailyQuests`/`dailyReviewXpIds`, which still need `applyDailyRollover` to run on the local side specifically so a genuinely new day's fresh quest list is what enters the merge (Sprint 1's existing `mergeDailyScopedValue` day-boundary logic then handles the local-vs-remote day comparison correctly from there).

**Why not just reorder functions blindly:** the two-layer split was chosen specifically because a single reordering (e.g., "always roll over BOTH sides before merging") is not possible for the remote side — the remote side's `dailyQuests` do not need regeneration via `applyDailyRollover` if the merge's own day-boundary comparison already discards a stale remote day's daily-scoped state (this is what `mergeDailyScopedValue` already does, unchanged from Sprint 1). Only `streak` needed a merge-internal fix; only local's daily-scoped fields needed a pre-merge fix.

**Extracted helper (`rolloverToToday`) also removes duplication:** the same 6-line rollover pattern previously existed independently in `useUserProgress.ts`'s `init()`, `refresh()`, and `reloadLocalOnly()` (added in Sprint 1) — now all three call the one shared function, a proportionate small refactor directly required by this fix (not a broader cleanup).

**Required scenarios (all added as executable tests):** same-day startup (no-op confirmed), next-day startup, multi-day gap (the core scenario), stale local/fresh remote, both stale (the case only layer 1 can fix). Offline cold start / failed cloud fetch / restart-after-failed-sync are covered structurally: `rolloverToToday` operates purely on local data, independent of remote/network state, so it applies unconditionally regardless of merge outcome.

## VERIFY-QA-003 — verification root cause

**Why the matrix failed to catch DATA-QA-005/006:**
1. Fixture not representing actual bootstrap state — the two-device test pre-applied `updateDailyStreak`/`applyDailyRollover` to local state before calling `mergeUserData`, which `AppBootstrap` does not do (for streak; it does for daily-scoped fields, but that's a separate concern).
2. Missing downgrade intent — no scenario existed for a merge-participant field that is also a user-reversible preference.

**Correction (not superficial):**
- Rewrote the two-device test to stop pre-rolling-over local state, since `mergeUserData` now self-normalizes — this makes the test MORE accurate to production, not less.
- Converted hardcoded historical date literals (`"2026-08-24"` etc.) to dynamically-computed relative dates (`new Date()`-based), since the new streak-normalization logic reads the real system clock — a fixed past-date literal would eventually look "stale" purely from the passage of real time, which would have made the test flaky/wrong in the future.
- Added dedicated DATA-QA-005 scenarios (intentional downgrade, legitimate promotion, legacy fallback) and DATA-QA-006 scenarios (local-stale, both-stale, same-day-no-op) — all calling the real `mergeUserData`/`rolloverToToday` functions, no test-only replicas.

Full detail and line-level evidence: `tests/testSuite.ts` §56 addendum (search "Sprint 2 Phase A carry-over regressions").
