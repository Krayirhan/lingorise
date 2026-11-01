import { allQuestions } from "../support/bundledCatalogue";
import { createDailyQuests, DAILY_QUEST_PRACTICE_ID } from "../../src/domain/gamification/badges";
import { applyPracticeAnswer, calculatePracticeAnswerXp } from "../../src/domain/practice/answer";
import { EXAM_PASS_COUNT, EXAM_QUESTION_COUNT } from "../../src/domain/learning/levelExam";
import { getRetryAction } from "../../src/domain/practice/sessionControls";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { UserData } from "../../src/domain/models/user";
import * as fs from "fs";
import * as path from "path";
import { assert } from "../support/assertions";

// 59. Exam vs. Practice Reward/Quest Accounting (CORE-QA-001 / GLOBAL-QA-008):
console.log("\n59. Exam vs. Practice Reward/Quest Accounting (CORE-QA-001):");
{
  const srcRoot = path.join(__dirname, "..", "..", "src");
  const examQuestion = allQuestions[1];
  const examCorrectAnswer = examQuestion.meaning || examQuestion.answer || "";
  const baseState: UserData = {
    ...DEFAULT_USER_DATA,
    xp: 0,
    learningProgress: {},
    dailyQuests: createDailyQuests(20, false),
  };
  const practiceQuestBefore = baseState.dailyQuests.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)!;

  // A first-encounter correct answer during an EXAM must not progress the daily practice quest.
  const afterExamAnswer = applyPracticeAnswer(baseState, examQuestion, examCorrectAnswer, 10, "EXAM");
  const practiceQuestAfterExam = afterExamAnswer.dailyQuests.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)!;
  assert(
    practiceQuestAfterExam.current === practiceQuestBefore.current,
    "an EXAM answer does not advance the daily practice quest's progress — exam activity is not what that quest is designed to measure"
  );
  assert(
    afterExamAnswer.dailyQuests.every((q, i) => q.completed === baseState.dailyQuests[i].completed),
    "an EXAM answer cannot silently complete the daily practice/review quest banner"
  );

  // The same answer, in a PRACTICE session, DOES progress the quest — confirming the branch is real,
  // not just "quests never update."
  const afterPracticeAnswer = applyPracticeAnswer(baseState, examQuestion, examCorrectAnswer, 10, "PRACTICE");
  const practiceQuestAfterPractice = afterPracticeAnswer.dailyQuests.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)!;
  assert(
    practiceQuestAfterPractice.current === practiceQuestBefore.current + 1,
    "the identical answer in a PRACTICE session does progress the daily practice quest — confirming the EXAM skip is a real branch, not quests being broken generally"
  );

  // XP, rewarded-state, solved-state, and mastery tracking are UNCHANGED by session mode — a correctly
  // answered new word is genuinely learned regardless of which session type taught it.
  assert(
    afterExamAnswer.xp === afterPracticeAnswer.xp,
    "XP earned for a first-encounter correct answer is identical whether it happened in an EXAM or PRACTICE session — no XP regression from the quest-skip fix"
  );
  assert(
    afterExamAnswer.rewardedQuestionIds.includes(examQuestion.id) && afterPracticeAnswer.rewardedQuestionIds.includes(examQuestion.id),
    "rewarded-state is recorded identically regardless of session mode"
  );
  assert(
    afterExamAnswer.solvedQuestionIds.includes(examQuestion.id) && afterPracticeAnswer.solvedQuestionIds.includes(examQuestion.id),
    "solved-state is recorded identically regardless of session mode"
  );
  assert(
    Boolean(afterExamAnswer.learningProgress[examQuestion.id]) && Boolean(afterPracticeAnswer.learningProgress[examQuestion.id]),
    "mastery/learningProgress tracking is recorded identically regardless of session mode — an exam-taught word is genuinely known"
  );

  // Level-exam pass/fail itself is tracked independently (levelExam.ts's own scoring, not dailyQuests) —
  // confirm an exam's own scoring is untouched by this fix.
  assert(EXAM_PASS_COUNT === 50 && EXAM_QUESTION_COUNT === 60, "level-exam scoring thresholds are independent of daily-quest accounting and remain unaffected by the CORE-QA-001 fix");

  // Sprint 1: the session summary must use the same XP delta as the persisted
  // answer transition, including quest bonuses and zero-payout answers.
  assert(
    calculatePracticeAnswerXp(baseState, examQuestion, "wrong", 10, "PRACTICE") === 0,
    "wrong answers have zero displayed XP delta"
  );
  assert(
    calculatePracticeAnswerXp(baseState, examQuestion, examCorrectAnswer, 10, "PRACTICE") ===
      afterPracticeAnswer.xp - baseState.xp,
    "displayed practice XP equals the persisted XP delta, including the quest bonus"
  );
  assert(
    calculatePracticeAnswerXp(baseState, examQuestion, examCorrectAnswer, 10, "EXAM") ===
      afterExamAnswer.xp - baseState.xp,
    "displayed exam XP equals the persisted XP delta without daily quest bonus"
  );
  const retry = () => undefined;
  assert(
    getRetryAction("PRACTICE", retry) === retry &&
      getRetryAction("EXAM", retry) === undefined &&
      getRetryAction("CHECKPOINT", retry) === undefined,
    "only practice feedback exposes retry; exam and checkpoint attempts stay scored"
  );
  const practiceScreenSrc = fs.readFileSync(path.join(srcRoot, "screens/PracticeScreen.tsx"), "utf-8");
  assert(
    practiceScreenSrc.includes("recordedCurrentAnswer") && practiceScreenSrc.includes("displayedXpEarned"),
    "feedback reads the recorded XP delta rather than the raw question reward"
  );
}

// 59b. ErrorBoundary Restart Actually Remounts (REL-QA-002 / GLOBAL-QA-020):
console.log("\n59b. ErrorBoundary Restart Actually Remounts (REL-QA-002):");
{
  // No React renderer is available in this test environment (plain ts-node,
  // no AsyncStorage, no React rendering — see VERIFICATION-ASSURANCE
  // baseline's own documented limitation), so this is a static verification
  // of the actual recovery mechanism, following the same pattern already
  // used for other component behavior checks in this file (see "Automated
  // Accessibility Scanner" above).
  const srcRoot = path.join(__dirname, "..", "..", "src");
  const errorBoundarySrc = fs.readFileSync(path.join(srcRoot, "components/ErrorBoundary.tsx"), "utf-8");
  assert(
    errorBoundarySrc.includes("restartKey"),
    "ErrorBoundary tracks a restartKey — the previous implementation only cleared hasError, re-rendering the same crashed tree instead of actually recovering"
  );
  assert(
    /key=\{this\.state\.restartKey\}/.test(errorBoundarySrc),
    "ErrorBoundary applies restartKey as a React key on the recovered subtree, forcing a real unmount/remount instead of a no-op state clear"
  );
  assert(
    /restartKey:\s*prev\.restartKey\s*\+\s*1/.test(errorBoundarySrc),
    "handleRestart increments restartKey on every restart, so each restart forces a fresh remount rather than reusing the previous key"
  );
}

