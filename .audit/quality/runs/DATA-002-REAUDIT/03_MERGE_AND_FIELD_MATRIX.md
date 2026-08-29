# DATA-002-REAUDIT — Merge and Field Matrix

Every field in `PROGRESS_FIELD_STRATEGY` independently checked against `mergeUserData()`'s actual implementation and, where relevant, against how the field is used elsewhere in production code (not just whether the matrix entry "exists").

| Field | Declared strategy | Source-verified implementation | Semantically correct? |
|---|---|---|---|
| `xp` | MONOTONIC_MAX_NUMBER | `Math.max(local.xp \|\| 0, remote.xp \|\| 0)` | YES — unchanged from pre-Sprint-1 correct behavior |
| `streak` | MONOTONIC_MAX_NUMBER | `Math.max(local.streak \|\| 0, remote.streak \|\| 0)` | YES — unchanged, and consistent with the separately-verified `detectClockAnomaly` guard against clock manipulation |
| `lastActiveDate` | LATER_DATE_STRING | `laterDateString(local, remote)`, lexical `>=` comparison on `YYYY-MM-DD` strings | YES — lexical comparison is valid for zero-padded ISO date strings; consistent with the existing MAX-style treatment of `xp`/`streak` |
| `level` | HIGHER_LEVEL | `LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b` | **PARTIALLY** — see new finding DATA-QA-005 in `07_FINDING_RECONCILIATION.md`. Correct for the achievement angle (never regress below a level the learner has demonstrably reached), but `level` is also a free, user-reversible content-selection preference (`LevelSwitcherModal` → `setLevel`, wired in `AppNavigator.tsx`), and an intentional manual downgrade can be silently overridden by a stale-but-higher value on the next merge. Bounded, not a data-loss defect. |
| `solvedQuestionIds` | UNION_STRING_ARRAY | `unionValues(...)`, `Set`-based | YES — unchanged, already-correct |
| `rewardedQuestionIds` | UNION_STRING_ARRAY | `unionValues(...)` | YES — unchanged, already-correct |
| `unlockedBadges` | UNION_STRING_ARRAY | `unionValues(...)` | YES — unchanged, already-correct |
| `favoriteWordIds` | UNION_STRING_ARRAY | `unionValues(...)` | YES — a genuinely additive, unioned fact; matches product intent (bookmarking) |
| `passedLevelExams` | UNION_STRING_ARRAY | `unionValues(...)` | YES — the primary historically-omitted field; a passed exam is a one-way achievement, union is correct and matches `markLevelExamPassed()`'s own idempotent-append pattern in `useUserProgress.ts` |
| `celebratedLevels` | UNION_STRING_ARRAY | `unionValues(...)` | YES — a celebration shown is a one-way fact; consistent with `markLevelCelebrated()`'s own "already celebrated, no-op" guard |
| `dailyReviewXpIds` | DAILY_SCOPED_UNION_STRING_ARRAY | `mergeDailyScopedValue(local.lastActiveDate, remote.lastActiveDate, ..., unionValues)` | YES, verified by independent call-chain trace (see `04_FAILURE_AND_OFFLINE_MATRIX.md`'s day-boundary analysis) — same-day union prevents double-XP; cross-day the later side wins, and `applyDailyRollover()` independently clears this field on any genuine day transition anyway, so the two mechanisms are complementary, not conflicting |
| `dailyQuests` | MERGE_DAILY_QUESTS (day-scoped) | `mergeDailyScopedValue(..., mergeDailyQuestsSameDay)` — same-day: per-quest-id `current: max`, `completed: OR`; cross-day: later side wins outright | YES, verified by the same call-chain trace — this is the fix for the real defect an earlier internal review caught and got corrected before this reaudit; independently re-verified as correct and non-redundant with `applyDailyRollover()`'s separate day-transition handling |
| `questHistory` | MERGE_QUEST_HISTORY | Union by `(date, questId)` composite key, remote-then-local precedence on collision (collision should not occur in practice since a given quest is completed once per day) | YES — an append-only log; union-by-identity is the correct treatment |
| `practiceHistory` | MERGE_PRACTICE_HISTORY | Union by `date` key; same-date entries take `Math.max` of `answers`/`correct`/`xp` | YES — correct richer-record-per-day treatment; consistent with `syncUserProgress`'s own separate mirror of this same field (see cross-check below) |
| `learningProgress` | RICHER_LEARNING_PROGRESS | Delegates to pre-existing `mergeLearningProgress()`/`pickRicherRecord()` (`src/domain/learning/mastery.ts`, unchanged by Sprint 1) | YES — unchanged, already-correct, independently re-verified as still called correctly |
| `onboardingCompleted` | OR_TRUE_BOOLEAN | `Boolean(local) \|\| Boolean(remote)` | YES — a one-way flag; matches the fact that `mergeAndSyncUserData` only ever runs for an account that has already completed sign-in |
| `hasSeenGardenExplainer` | OR_TRUE_BOOLEAN | `Boolean(local) \|\| Boolean(remote)` | YES — a one-way "shown once" flag |
| `lastSyncSuccessAt` | LATEST_TIMESTAMP_NUMBER | `Math.max(local \|\| 0, remote \|\| 0) \|\| undefined` | YES — informational only, no downstream logic depends on its exact value beyond "most recent" |
| `activeSession` | DEVICE_LOCAL | `local.activeSession ?? null` | YES — an in-progress session is inherently single-device UI state; taking local unconditionally (never resurrecting a stale remote session) is correct |
| `lastCompletedWord` | DEVICE_LOCAL | `local.lastCompletedWord` (no remote fallback) | YES — verified this was corrected during Sprint 1's own review cycle to remove an earlier `?? remote.lastCompletedWord` fallback that contradicted its DEVICE_LOCAL label; now consistent |
| `locale`, `dailyGoalMinutes`, `practiceSessionSize`, `notificationsEnabled`, `soundEnabled`, `reduceMotion`, `avatarId`, `displayName`, `lastKnownServerDate`, `schemaVersion` | REMOTE_AUTHORITATIVE | Come from the `{...remote}` baseline spread, unmodified | YES for Data Integrity purposes — this is unflagged, pre-existing, unchanged behavior; no audit (historical or current) has identified a defect here. A UX question (should a device's own sound/notification preference really be overwritten by a cross-device sync?) exists but is out of Data Integrity's scope and not newly introduced by Sprint 1. |

## Cross-check: `syncUserProgress()`'s separate field list vs. the merge registry

`syncUserProgress()` (`src/services/firestore.ts`) writes `{xp, level, streak, lastActiveDate, practiceHistory}` to `users/{uid}/progress/main` — a strict subset of the registry's fields, all five of which are independently confirmed correct per the table above. This document's scope (`progress/main`) is deliberately narrower than the full `users/{uid}` document `syncUserData()` mirrors; no evidence found that any production code path reads `progress/main` expecting a field outside this five-field set. Not a Data Integrity defect — see `07_FINDING_RECONCILIATION.md` for its Maintainability-tier disposition.

## Idempotency / stability — independently re-verified

Re-derived by direct reasoning about each strategy's mathematical properties, not merely by trusting the existing passing test:
- `Math.max(x, x) = x` — `xp`/`streak` stable under repeated merge. Confirmed.
- `Set` union of a set with itself is itself — `solvedQuestionIds`/`rewardedQuestionIds`/`unlockedBadges`/`favoriteWordIds`/`passedLevelExams`/`celebratedLevels`/`dailyReviewXpIds` stable, no growth, no duplication. Confirmed.
- Per-id/per-date "richer record" merges (`dailyQuests`, `practiceHistory`, `learningProgress` via `mergeLearningProgress`) are idempotent by construction: merging an identical record with itself produces `max(x,x)=x`/`OR(x,x)=x` per field, and the id/date key set does not grow. Confirmed by direct reasoning; also covered by an executable test in `tests/testSuite.ts` §56.
- `questHistory`'s union-by-`(date,questId)` identity is a `Map` keyed by that composite — re-inserting an identical entry set does not grow the map. Confirmed.
- `onboardingCompleted`/`hasSeenGardenExplainer`: `OR(x,x)=x`. Confirmed.
- `level`/`lastActiveDate`: `max`-equivalent (ordinal / lexical) — stable under repeated merge. Confirmed.

No monotonic-field regression, no duplication, no growing histories, and no daily-state resurrection risk found under repeated reconciliation of an already-converged state.
