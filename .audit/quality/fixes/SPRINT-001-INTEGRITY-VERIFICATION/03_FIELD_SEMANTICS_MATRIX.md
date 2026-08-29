# SPRINT-001 — Field Semantics Matrix

Generated from the actual current `UserData` type (`src/types/user.ts`) and the canonical `PROGRESS_FIELD_STRATEGY` registry (`src/domain/sync/progressMerge.ts`). "Local?" / "users/{uid}?" / "progress/main?" reflect what is actually persisted where, per `src/services/storage.ts` and `src/services/firestore.ts`'s `syncUserData`/`syncUserProgress`.

| Field | Local? | users/{uid}? | progress/main? | Canonical owner | Merge strategy | Reset behavior | Failure behavior | Derived/source? | Historical risk | Executable test? |
|---|---|---|---|---|---|---|---|---|---|---|
| `onboardingCompleted` | YES | YES | no | client | OR_TRUE_BOOLEAN | resettable (local-only) | non-destructive (defaults false) | source | none | YES (§56) |
| `xp` | YES | YES | YES | client | MONOTONIC_MAX_NUMBER | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56) |
| `level` | YES | YES | YES | client | HIGHER_LEVEL | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `locale` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no (unchanged, out of scope) |
| `streak` | YES | YES | YES | client | MONOTONIC_MAX_NUMBER | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56) |
| `lastActiveDate` | YES | YES | YES | client | LATER_DATE_STRING | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `dailyGoalMinutes` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `practiceSessionSize` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `notificationsEnabled` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `soundEnabled` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `reduceMotion` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `avatarId` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `displayName` | YES | YES | no | client | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no |
| `favoriteWordIds` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | none (unflagged, preserved) | no (analogous coverage via other UNION_SET fields) |
| `solvedQuestionIds` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56) |
| `rewardedQuestionIds` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56) |
| `unlockedBadges` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56) |
| `dailyQuests` | YES | YES | no | client | MERGE_DAILY_QUESTS | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `dailyReviewXpIds` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `learningProgress` | YES | YES | no | client | RICHER_LEARNING_PROGRESS | resettable (local-only) | non-destructive | source | none (already correct) | YES (§56, pre-existing + new) |
| `celebratedLevels` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `passedLevelExams` | YES | YES | no | client | UNION_STRING_ARRAY | resettable (local-only) | non-destructive | source | **HIGH — the primary DATA-QA-002 / RELEASE-QA-001 field** | YES (§56, plus dedicated regression test) |
| `practiceHistory` | YES | YES | YES | client | MERGE_PRACTICE_HISTORY | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `questHistory` | YES | YES | no | client | MERGE_QUEST_HISTORY | resettable (local-only) | non-destructive | source | **HIGH — was DATA-QA-002-class** | YES (§56) |
| `activeSession` | YES | YES (mirrored, not authoritative) | no | device | DEVICE_LOCAL | resettable (local-only) | non-destructive | derived/transient | low (pre-existing spread bug could clobber an active session on merge; now explicitly local-only) | no (not user-facing progress; low priority) |
| `lastSyncSuccessAt` | no (not read back) | YES | no | client | LATEST_TIMESTAMP_NUMBER | resettable (local-only) | non-destructive | derived | none | no |
| `lastKnownServerDate` | YES | YES | no | server-derived | REMOTE_AUTHORITATIVE | resettable (local-only) | non-destructive | derived | none (server-authoritative by design) | YES (indirectly, via §53 clock-anomaly tests) |
| `schemaVersion` | YES | YES | no | client (recomputed) | REMOTE_AUTHORITATIVE | always recomputed to `CURRENT_SCHEMA_VERSION` on normalize | non-destructive | derived | none | no |
| `hasSeenGardenExplainer` | YES | YES | no | client | OR_TRUE_BOOLEAN | resettable (local-only) | non-destructive | source | none | no |
| `lastCompletedWord` | YES | YES | no | device | DEVICE_LOCAL | resettable (local-only) | non-destructive | derived/transient | none | no |

**"HIGH — was DATA-QA-002-class"** marks the 8 fields the historical defect actually omitted from the merge's explicit re-list (`passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate`) — every one of them now has an explicit, tested, non-`REMOTE_AUTHORITATIVE` strategy.

Note on `activeSession`: `syncUserData()` mirrors the full `UserData` object including `activeSession` into `users/{uid}` today (unchanged by this sprint — it was already being written), but the merge treats it as `DEVICE_LOCAL` (local wins, never resurrected from remote) since an in-progress session belongs to exactly one device's screen at a time.
