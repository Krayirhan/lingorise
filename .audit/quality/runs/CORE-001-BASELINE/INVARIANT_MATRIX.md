# CORE-001-BASELINE — Invariant Matrix

Revision: 16b9aab

| Invariant | Implementation owner | Verification evidence | Status |
|---|---|---|---|
| A word's first correct answer awards XP exactly once | `src/domain/practice/answer.ts` (`isFirstEncounter`/`nextRewarded`) | E3 (tests/testSuite.ts multiple `applyPracticeAnswer` sequences), E2 (source read) | PASS |
| A due-review word's bonus XP is capped once per word per day | `answer.ts` (`nextReviewXpIds`/`dailyReviewXpIds`) | E3 + E2 | PASS |
| **Exam answers are attributed distinctly from daily-practice answers** | `answer.ts` `applyPracticeAnswer(... _sessionMode ...)` — parameter received but unused | E2 (static, confirmed unused), E3 (no test exercises `"EXAM"` differently) | **FAIL** (CORE-QA-001) |
| A daily quest measures daily-practice activity, not exam activity | `domain/gamification/badges.ts: updateDailyQuests` keyed only on `isFirstEncounter`, not session mode | E2 | **FAIL** (CORE-QA-001, same root cause) |
| Daily practice never resurfaces an already-rewarded word | `useAppSession.ts: buildDailySessionCore` filters `!rewardedQuestionIds.includes` | E2 + E3 (testSuite) | PASS |
| A practice/exam CTA never silently no-ops on an empty session | `useAppSession.ts: beginSession` returns `false` on empty list; `AppNavigator.tsx: startPracticeSafe/startExamSafe` show a toast | E2 + E3 (Birim 58) + E4 (real device, this session and CD-00x work) | PASS |
| Streak increments exactly +1 on a genuine consecutive day, resets to 1 on a gap, no-ops same-day, and is not punished by a backward/anomalous clock | `domain/gamification/streak.ts: updateDailyStreak` | E2 (explicit branch for `diffDays<=0`), historical E3/E4 (CORE-001 legacy fix) | PASS |
| A daily "review" quest is only issued when a review is actually due (never an impossible quest) | `domain/gamification/dailyRollover.ts: applyDailyRollover` (`hasReviewBacklog` gate) | E2 | PASS |
| Guest→signed-in cold-start merge cannot be clobbered by a redundant local rollover write | `state/useUserProgress.ts` init() — skips local `saveUserData` when `auth.currentUser` is set | E2 (explicit comment + guard), historical E4 (two-device test, DATA-001) | PASS (historical, not re-run this session) |
| A level's completion exam draws a representative, seatable question set or none at all | `domain/learning/levelExam.ts: buildLevelExam/isExamAvailable` (`EXAM_PASS_COUNT=50` gate) | E2 + E3 | PASS |
| A learner is not promoted without passing the level's exam | `domain/learning/promotion.ts: evaluatePromotion` (`isEarned = passedLevelExams.includes(level)`) | E2 + E3 | PASS |
| A level exam result is recorded exactly once per attempt | `AppNavigator.tsx: examResultRecordedRef` keyed on the exact question-id set | E2 | PASS |
| A learner is never permanently blocked by a content-incomplete next level | `content/questions/index.ts: isLevelReady` (>=100 questions) gates auto-promotion, but `LevelSwitcherModal` still allows manual switch to any *ready* level regardless of exam status | E2 (explicit "every level is selectable... levels without enough content are the one exception" comment) | PASS (by design; B1–C2 currently have 3–5 questions each and are the disclosed exception — see Known Limitations) |
| A fully-learned level shows a distinct, non-dead-end terminal state on both Home and Practice Hub, consistently | `features/home/hooks/useHomeViewModel.ts: isLevelFullyLearned`, `GardenHeroCard.tsx`, `PracticeHubScreen.tsx` | E2 + E3 (Birim 58, 14 assertions) + E4 (real device, repeatedly this session) | PASS |
| Progress percentages/counts shown across Home, Progress, and the level switcher derive from the same underlying arrays (no contradictory numbers) | `rewardedQuestionIds`/`solvedQuestionIds` used consistently in `useHomeViewModel.ts`, `AppNavigator.tsx` (Progress tab), `LevelSwitcherModal.tsx` | E2 (traced all three call sites to the same source arrays) | PASS |
| An interrupted practice/exam session restores without duplicating an already-submitted answer | `useAppSession.ts` — `picked`/`submitted` are not part of restored state; `currentIndex` only advances in `nextQuestion()`, after submit | E2 (static reasoning) | **PARTIAL** (CORE-QA-002 — narrow window, not runtime-verified) |
| Badge unlock thresholds are idempotent and only reflect genuinely-earned state | `domain/gamification/badges.ts: evaluateBadges` (Set-based, threshold checks) | E2 | PASS |
