# 05 — Practice / Exercise System

Two runtime question modes, one data shape (`MeaningMatchQuestion`, `src/types/content.ts`). A third enum value `QUICK_REVIEW` is declared (`GameMode`) but has zero implementation anywhere in `src/` — not built.

| Mode | Mechanism |
|---|---|
| MEANING_MATCH | English prompt shown, learner picks Turkish meaning from options (correct + wrongOptions) |
| PICK_THE_WORD (reverse) | Runtime transform (`src/domain/practice/reverseMode.ts`) of a MEANING_MATCH session — Turkish meaning shown, learner picks English word; decoys drawn from other session words; requires session size ≥3 |

Level Exam reuses the same question pool/engine as a distinct session mode (`EXAM`), not a new question type.

## Per-type mechanics

| Aspect | PRACTICE (Meaning Match / Pick the Word) | EXAM |
|---|---|---|
| Question source | `buildDailySession`: current unit's unrewarded words, ascending difficulty, sliced to `practiceSessionSize` (default 20) | `buildLevelExam`: 60 Qs, banded easy/medium/hard (~20 each) from the level's full pool |
| Correctness | `picked === question.meaning` | same |
| XP | Content-authored `computeXpReward`: base by level A1=10…C2=35, +5 if word length≥9/multi-word. First-time correct = full reward; already-rewarded-but-due = flat 5 XP/word/day | identical formula |
| Streak effect | Not per-answer — daily rollover concern | same |
| Quest effect | Advances `quest_daily_practice`/`quest_daily_review` on correct answers | **Explicitly suppressed** — exam answers never progress/complete daily quests (fix CORE-QA-001) |
| Retry | "Tekrar Dene" re-scores same question id; wrong answers increment `consecutiveWrongCount` toward leech threshold (8) | same |
| Persistence | `learningProgress`, `rewardedQuestionIds`, `solvedQuestionIds`, `dailyReviewXpIds`, `practiceHistory` — AsyncStorage always + Firestore if signed in | same fields, plus `passedLevelExams[]` on pass |
| Tests | `applyPracticeAnswer`, pick-the-word conversion, distractor randomization, CORE-004 exhaustion block | exam build/pass-threshold tests, CORE-QA-001 exam-vs-practice accounting block |

## Content exhaustion (CORE-004 fix)
`buildDailySession` returns `[]` once every word in the current unit is `rewardedQuestionIds`. `isLevelFullyLearned` (in `useHomeViewModel`) drives Home/PracticeHub CTA gating so the UI shows a real "level complete" state (exam CTA if available, otherwise a non-interactive state) instead of a dead "come back tomorrow" button. `startPractice`/`startExam` return `false` (not a silent no-op) when no questions can be built. Fully covered by tests/testSuite.ts.

## Level Exam system
- Seat requirement: `isExamAvailable(level)` = level has ≥50 questions in its pool.
- Selection: 60 Qs, ~20 per difficulty band, double-shuffled.
- Pass threshold: `EXAM_PASS_COUNT = 50/60` (≈83%).
- Retry: uncapped — no attempts-remaining/cooldown field exists.
- Progression unlock: `evaluatePromotion` — `isEarned = passedLevelExams.includes(level)`; nothing in code actually *blocks* moving to a level early, `assessLevelChoice` only flags "ahead" for UI messaging.
- Guest vs. signed-in: identical local behavior; only difference is Firestore mirroring when signed in.

**Assessment:** the practice/exam engine itself is well-designed, generically level-agnostic, and heavily tested. Its real limitation is content volume (see 06_CONTENT_SYSTEM.md) — B1–C2 cannot seat an exam at all (content pool &lt;50).
