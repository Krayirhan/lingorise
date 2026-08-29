# SPRINT-001 — Review Results

Neither reviewer was told the expected closure count, PASS verdict, or expected finding count. Both were given: the Sprint 1 Global findings and root causes, the acceptance criteria, the actual diff, the new tests, and the relevant canonical invariants.

## Independent code reviewer (`code-reviewer`)

**Verdict: ADJUST**

Confirmed accurate: `mergeUserData()` is genuinely single-sourced (both production and tests call it); `fetchUserDataResult`/`RemoteStateUnknownError` genuinely distinguish absent from failed; a failed merge triggers no local/cloud write; `reloadLocalOnly` genuinely never touches Firestore (unlike the old `refresh()` wiring); `deleteUserData` is idempotent and safe to retry after a `PartialAccountDeletionError`; the new `firestore.rules` validation does not break any existing production write path; no over-engineering, no new `any`/`unknown` casts in touched safety-critical paths, no race condition, no write-amplification regression, no tautological test.

**Concern raised (HIGH) — applied:** `mergeDailyQuests` (and, by the same root cause, `dailyReviewXpIds`'s plain union) merged by quest/id-set identity with no day-boundary awareness. `DailyQuest` carries no date of its own — `applyDailyRollover()` regenerates the list from scratch every day under fixed ids. A remote copy from yesterday with `completed: true` could merge into today's freshly-rolled-over quest by id and silently mark it complete, blocking that day's quest XP — reachable on the single most common merge trigger (an overnight-then-morning-login cold start). This was not a new regression (the pre-fix code had the same latent exposure, just via a different code path), but it meant the "comprehensive fix" claim did not yet fully hold.

**Applied:** Added `mergeDailyScopedValue()` in `src/domain/sync/progressMerge.ts` — `dailyQuests` and `dailyReviewXpIds` now only apply their richer-merge logic when `local.lastActiveDate === remote.lastActiveDate`; across a day boundary, the side with the later date wins outright instead of merging. Added a named regression test reproducing the exact scenario the reviewer described (`tests/testSuite.ts` §56, "cross-day merge does not let yesterday's completed quest silently mark today's freshly-rolled-over quest complete"). Re-ran typecheck + full suite: still 0 failures.

**Concern raised (MEDIUM), documented, not further changed:** `normalizeUserData()`'s own field list (`src/services/storage.ts`, untouched this sprint) is still a separate, non-compiler-enforced manual list — a new optional `UserData` field could still be silently dropped in the local-storage round trip even though the merge layer would now catch it. This is a real, correctly-scoped observation that the root-cause fix is complete for the *merge* layer (Sprint 1's actual mandate) but not for the *storage normalization* layer — noted explicitly in `08_RESIDUAL_RISK.md`, not silently accepted as "fully solved."

**Observation (LOW), applied:** `lastCompletedWord`'s `DEVICE_LOCAL` label said "never resurrected from another device" but the code fell back to `remote.lastCompletedWord` when local was unset — a real label/behavior mismatch, though low-stakes (a UI hint, not progress data). Fixed to strictly local (`local.lastCompletedWord`, no remote fallback), matching its label exactly.

## Independent test reviewer (`test-reviewer`)

**Verdict: ADJUST**

Confirmed accurate: no hand-copied production algorithm remains anywhere in test code; the DATA-QA-002 regression scenario is represented by an explicitly, honestly named test; idempotency and the A→B→A round trip are genuinely meaningful (verified they would fail under a blind `{...local,...remote}` regression); the clock-anomaly test is genuinely real, not tautological; no assertion-count padding was found across the reviewed sections.

**Concern raised (HIGH) — applied:** `favoriteWordIds` (a `UNION_STRING_ARRAY` field in the registry) had zero merge-outcome assertions in §56 — a mutation deleting that field's union logic from `mergeUserData` would pass the full suite undetected, since the registry-completeness backstop only checks that a strategy *exists*, not that `mergeUserData`'s body actually honors it.

**Applied:** Added a direct `favoriteWordIds` union assertion to `tests/testSuite.ts` §56.

**Concern raised (MEDIUM) — applied:** §56's own header comment listed `GLOBAL-QA-003` (remote-fetch-failure ≠ remote-absent) among the findings it covers, but no assertion anywhere in the file exercised that decision — an overclaim relative to actual coverage.

**Applied:** Extracted the pure decision (`decideMergeAction`) that `mergeAndSyncUserData()` executes into a new dependency-free module (`src/domain/sync/remoteSync.ts`, no Firebase SDK import) specifically so it could be unit-tested with synthetic `RemoteUserDataResult` values — no live/mocked Firestore SDK required. Added three real assertions to §56 covering `absent` → `first-sync`, `failed` → `unknown-remote-state` (never conflated with absent), and `found` → a real `merge` decision whose data is produced by the actual `mergeUserData` function.

**Noted, correctly out of scope:** an unrelated pre-existing tautological assertion (`word_marked_leech telemetry event is callable without errors`, line ~1334) was flagged as the same anti-pattern class but confirmed — via `git log` — to predate this sprint and lie outside its touched sections; left untouched, consistent with the "no Sprint 2 scope creep" rule.

## Post-review verification

After applying both reviewers' HIGH/MEDIUM findings:
- `npm run typecheck`: PASS (0 errors)
- `npm test`: **392 passed, 0 failed** (up from the pre-review-fix 382; +10 new assertions: `favoriteWordIds` union, 3 day-boundary regression assertions, 1 same-day-unaffected confirmation, 5 `decideMergeAction` assertions)

Both reviewers' concerns were either applied as code/test changes (all HIGH and actionable MEDIUM items) or explicitly documented as a correctly-scoped residual limitation (the `normalizeUserData` storage-layer observation) — none were silently dismissed.
