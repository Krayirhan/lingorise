# DATA-001-BASELINE — Merge Matrix

Revision: 16b9aab
Source: `src/services/firestore.ts: mergeAndSyncUserData()` (lines 199-233), `src/domain/learning/mastery.ts: mergeLearningProgress()` (lines 170-182)

| Field | Merge strategy (current code) | Semantically correct? | Evidence |
|---|---|---|---|
| `xp` | MAX (`Math.max(local, remote)`) | Correct — monotonic field | E2 + E3 |
| `streak` | MAX | Correct — monotonic within the merge's own scope (day-rollover correctness is a separate, already-audited concern) | E2 + E3 |
| `solvedQuestionIds` | UNION (`Set` of both arrays) | Correct — monotonic set | E2 + E3 |
| `rewardedQuestionIds` | UNION | Correct — monotonic set | E2 + E3 |
| `unlockedBadges` | UNION | Correct — monotonic set | E2 + E3 |
| `learningProgress` | DOMAIN-SPECIFIC MERGE (`mergeLearningProgress`/`pickRicherRecord`, whole-record, attempts→serverSyncedAt→lastAnsweredAt tie-break) | Correct — well-reasoned, atomic per-word merge | E2 + E3 |
| `onboardingCompleted` | Explicit `true` (replacement, but only ever moves false→true in practice) | Correct — effectively monotonic in this codebase | E2 |
| **`passedLevelExams`** | **REPLACEMENT** (via `...remote`, not explicitly listed) | **INCORRECT** — monotonic array (once passed, always passed), should be UNION like `unlockedBadges`/`solvedQuestionIds` | E2 (DATA-QA-002) |
| `level` | REPLACEMENT (via `...remote`) | Questionable — a learner's current level choice is a *setting*, not a monotonic achievement; remote-wins can silently revert a legitimate local level switch | E2 (related symptom, same root cause as DATA-QA-002) |
| `lastActiveDate` | REPLACEMENT (via `...remote`) | Questionable — this feeds `updateDailyStreak` on the next cold start; a stale remote value could distort the next day's rollover calculation | E1/E2 (plausible, not runtime-reproduced) |
| `dailyQuests` | REPLACEMENT (via `...remote`) | INCORRECT for same-day state — a quest already completed locally today can revert to incomplete if remote hasn't caught up | E2 (related symptom) |
| `dailyReviewXpIds` | REPLACEMENT (via `...remote`) | INCORRECT — this is a same-day duplicate-payout guard; losing it on merge can allow a stray extra review-XP grant | E2 (related symptom, low impact) |
| `practiceHistory` | REPLACEMENT (via `...remote`, whole array) | INCORRECT — should be a date-keyed union/reconciliation like the per-day entries `applyPracticeAnswer` already builds; local-only days can be discarded | E2 (related symptom) |
| `questHistory` | REPLACEMENT (via `...remote`, whole array) | INCORRECT — same class of issue as `practiceHistory` | E2 (related symptom) |
| `celebratedLevels` | REPLACEMENT (via `...remote`) | Minor — can cause a level-up celebration modal to reappear after already being dismissed locally; not destructive, just repetitive | E1/E2 |
| `activeSession` | REPLACEMENT (via `...localData` then `...remote` — remote wins; remote is never written with a live session per `syncUserData`'s payload, so this is low-risk in practice) | Acceptable — a mid-session interruption during a merge is already an edge case (see CORE-001-BASELINE's CORE-QA-002) | E1 |
| Settings (`soundEnabled`, `reduceMotion`, `notificationsEnabled`, `dailyGoalMinutes`, `practiceSessionSize`, `locale`, `avatarId`, `displayName`) | REPLACEMENT (via `...remote`) | Acceptable — these are genuinely "last write wins" preference fields, not progress; remote-wins is a defensible default for settings specifically (unlike the progress-shaped fields above) | E1 |

## Summary

Six fields (`xp`, `streak`, `solvedQuestionIds`, `rewardedQuestionIds`, `unlockedBadges`, `learningProgress`) are correctly merged with a monotonic-safe strategy. **`passedLevelExams` — arguably the single most consequential achievement field in the schema — is the most severe omission**, sharing the exact same "should be UNION" shape as the fields that *were* handled correctly, with no comment explaining the exclusion (in an otherwise thoroughly-commented codebase). Five additional fields (`dailyQuests`, `questHistory`, `practiceHistory`, `dailyReviewXpIds`, `celebratedLevels`) share the identical root cause (naive `{...localData, ...remote}` spread with a hand-picked override list) at lower individual severity. `level`/`lastActiveDate` are borderline (arguably settings-like, but interact with progression logic). Genuine settings fields correctly default to remote-wins, which is a defensible choice for that category alone.
