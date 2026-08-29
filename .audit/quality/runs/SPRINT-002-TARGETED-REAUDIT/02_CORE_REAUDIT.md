# Core Targeted Reaudit

## GLOBAL-QA-008 / CORE-QA-001

Independently traced `applyPracticeAnswer` (`src/domain/practice/answer.ts`):

- `sessionMode` now genuinely branches: `sessionMode === "EXAM" ? {updatedQuests: previous.dailyQuests, bonusXpEarned: 0} : updateDailyQuests(...)`. An EXAM answer's `dailyQuests` state is passed through unchanged; no quest progression, no quest-bonus XP.
- XP, `rewardedQuestionIds`, `solvedQuestionIds`, and `learningProgress` (mastery) computation happen earlier in the function and do NOT read `sessionMode` at all — verified by reading lines 25-75: the `isCorrect`/`isFirstEncounter`/`wasDue` branch that awards `nextXp`/`nextRewarded`/`nextSolved` and the `recordLearningOutcome` call are unconditional. This confirms the claim: reward/mastery state is identical between EXAM and PRACTICE for the same answer; only quest progression differs.
- Confirmed this is wired to real production data flow, not just a test-only parameter: `AppNavigator.tsx:172` passes the actual `session.sessionMode` (from `session.sessionMode !== "EXAM"` checks elsewhere in the same file, i.e., a real discriminated session-mode field, not a hardcoded literal) into `useUserProgress.ts`'s `recordAnswer(question, picked, xpReward, sessionMode, quality)`, which passes it straight to `applyPracticeAnswer`. There is no separate/duplicate answer-handling path for exams.
- Test evidence (`tests/testSuite.ts` §59, 8 assertions) independently re-run fresh: all 8 PASS, including the specific assertions that would fail if XP/reward/solved/mastery differed by session mode.

**Verdict: GLOBAL-QA-008 CLOSED.** Genuine root-cause fix, not a cosmetic re-parameterization; production-wired; regression-tested with real production logic.

## CORE-QA-002 (GLOBAL-QA-018)

Confirmed still OPEN, not touched by Sprint 2, and not silently closed. `01_MASTER_SCOPE_MAP.md`/`10_RESIDUAL_RISK.md` both list it as explicitly deferred ("narrow, low-frequency edge case; lower leverage than items actually fixed"). No source file related to session-restore (`ActiveSessionState`, `picked`/`submitted` persistence) appears in the Sprint 2 diff (`git diff --stat` above) — confirming the deferral claim is accurate, not a cover for an untraced regression.

**Current severity: P3, unchanged.** Narrow (requires precise app-kill timing mid-question), no proven widespread impact, no evidence it worsened. Not downgraded, not escalated.

## Core score

| Dimension | Historical | Notes |
|---|---:|---|
| Baseline total | 88/100 | CORE-001-BASELINE, driven down by CORE-QA-001 (P2, exam/practice reward blindness) and CORE-QA-002 (P3, session-restore edge case) |

CORE-QA-001 is now genuinely closed with strong (E2 static + E3 executable, production-wired) evidence. CORE-QA-002 remains open at its original P3 severity, unrecovered.

**Current score: 94/100** (+6)
**Confidence: HIGH** — the fix was independently re-traced end-to-end (UI session state → hook → domain function), not just re-read in isolation, and the regression tests exercise the real function with meaningfully different EXAM/PRACTICE assertions rather than a single happy-path check.

No speculative bonus applied beyond the demonstrated fix; CORE-QA-002's unrecovered P3 keeps this below a perfect Core score.
