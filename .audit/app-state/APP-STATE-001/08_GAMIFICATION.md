# 08 — XP / Level / Streak / Gamification

## XP
- Source of truth: `src/domain/practice/answer.ts::applyPracticeAnswer`. First-time-correct pays content-defined `xpReward`; already-rewarded-but-due repeat pays a flat `REVIEW_XP_REWARD=5`; daily-quest completion adds bonus XP; exam mode explicitly excludes quest bonus XP (CORE-QA-001).
- Garden display level (1-5) is deliberately decoupled from XP — driven by mastered-word count instead (explicit design decision per in-code comment, after an earlier fixed XP ceiling was hit too fast).
- Duplicate-reward protection: two-tier — `rewardedQuestionIds` (once ever, per question) + `dailyReviewXpIds` (once per word per day, gated by real spaced-repetition due-ness) — both explicitly tested via a dedicated "Review XP Farming Guard" test.
- Merge: `MONOTONIC_MAX_NUMBER` — XP never regresses across devices.

## Content level (A1–C2, distinct from garden level)
- A user-selectable preference, not an achievement. Merge strategy: `MOST_RECENTLY_SET_LEVEL`, keyed by a `levelSetAt` timestamp — genuine latest-write-wins, deliberately so an intentional downgrade survives merge (fix for DATA-QA-005, where the old monotonic-max strategy silently overrode intentional downgrades with a stale-but-higher remote value).

## Streak
- `updateDailyStreak` — same day → unchanged; 1-day gap → +1; backward/no-op clock movement → no-op (not punished); any larger gap → reset to 1.
- Rollover orchestration (`rolloverToToday`) runs at every load/sign-in-merge entry point.
- Merge: `Math.max` of both sides, but each side is **first re-normalized against the real current date** before comparison (fix for DATA-QA-006 — a long-unopened device's frozen-stale streak could otherwise beat a correctly-decayed remote value even under a max-based merge).
- Anomaly detection: `detectClockAnomaly` flags &gt;1-day server-date jumps for telemetry.

## Daily Quests
- Two fixed-id quests (`quest_daily_practice`, `quest_daily_review`, the latter only issued when a real review backlog exists). Wrong answers never advance progress; progress is capped at target; bonus XP fires exactly once on the completion transition.
- Day-boundary handling: quests archived into an append-only `questHistory` (capped at 120 entries) on rollover, then regenerated. Cross-device merge is same-day-aware: same-day quests merge per-quest-id (max progress, OR completed); different-day quests replace outright rather than merging, specifically to stop yesterday's `completed:true` (same fixed id) silently completing today's fresh quest.

## Badges/Achievements
- Pure, stateless recomputation (`evaluateBadges`) from current UserData on every answer — union-only, never revoked. One badge (`badge_master_review`) was deliberately repurposed from a retired mechanic (spaced-repetition review count) to a new condition (2+ passed exams) while keeping the id stable for existing holders.

## Favorites
- Simple toggled id set (`favoriteWordIds`), no dedicated domain module — logic lives directly in UI components (`WordNotebookModal.tsx`). Merge: plain union. No dedicated tests by name (only generic merge-matrix coverage).

## Canonical merge function
`src/domain/sync/progressMerge.ts::mergeUserData` is the single production merge path (verified: both the app's sync service and the test suite call this exact function — no duplicate hand-written merge exists). Its field-strategy table is typed as `Record<keyof UserData, FieldStrategy>`, so adding a new UserData field without a merge rule is a **compile error** — a structural fix for the historical DATA-QA-002/RELEASE-QA-001 defect where a hand-written spread merge silently dropped several fields (including passedLevelExams) on cold-start after a failed background sync.

## What actually works today
XP earning with duplicate protection, streak tracking with real clock-anomaly resilience, quest lifecycle with day-boundary correctness, badge evaluation, and the canonical multi-device merge are all production-solid and covered by the single largest block in the test suite (a ~430-line field-merge regression matrix). The weakest spot is Favorites, which has no dedicated logic layer or named tests, and the fact that "level" exists as three distinct concepts (garden stage, content level, XP) which is a naming/mental-model risk more than a functional bug.
