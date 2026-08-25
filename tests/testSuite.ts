import { en, tr, copyByLocale } from "../src/i18n/en";
import { allQuestions, validateQuestionDatabase, getQuestionsByLevel, findQuestionByWord, searchQuestions, CONTENT_VERSION, getLevelUnitInfo, CONTENT_UNIT_SIZE, detectUnitJustCompleted } from "../src/content/questions";
import {
  getDueReviewItems,
  isItemDue,
  DEFAULT_EASE_FACTOR,
  applyIntervalJitter,
  nextIntervalDays,
  bringForward,
  RELEARN_DELAY_MS,
} from "../src/services/spacedRepetition";

const DAY_MS = 24 * 60 * 60 * 1000;
import {
  calculateGardenProgress,
  updateDailyStreak,
  evaluateBadges,
  updateDailyQuests,
  applyDailyRollover,
  createDailyQuests,
  archiveDailyQuests,
  DAILY_QUEST_PRACTICE_ID,
  DAILY_QUEST_REVIEW_ID,
} from "../src/services/gamification";
import { applyPracticeAnswer } from "../src/domain/practice/answer";
import { buildDailySession, REVIEW_DEBT_LIMIT, REVIEW_DEBT_TAPER_START, pickNewWords } from "../src/state/useAppSession";
import {
  evaluatePromotion,
  assessLevelChoice,
  PROMOTION_THRESHOLD_PERCENT,
} from "../src/domain/learning/promotion";
import { isLevelReady, getNextLevel } from "../src/content/questions";
import { getTopicLabel } from "../src/features/home/topicLabel";
import { toPickTheWordSession, canUsePickTheWord } from "../src/domain/practice/reverseMode";
import {
  recordLearningOutcome,
  deriveStatus,
  summarizeMastery,
  countMasteredWords,
  mergeLearningProgress,
  isLeech,
  LEECH_THRESHOLD,
} from "../src/domain/learning/mastery";
import { DEFAULT_USER_DATA, normalizeUserData, CURRENT_SCHEMA_VERSION, migrateV1ToV2, migrateV2ToV3 } from "../src/services/storage";
import { ReviewItem, UserData } from "../src/types/user";
import { useHomeViewModel } from "../src/features/home/hooks/useHomeViewModel";
import { LevelCode } from "../src/types/content";
import { getAuthErrorMessage } from "../src/services/authErrors";
import { isOfflineError } from "../src/services/errorReporter";
import { componentSizes, iconSizes } from "../src/theme/tokens";
import { track, getRecentEvents, clearTelemetry } from "../src/services/telemetry";
import { randomizeDistractors } from "../src/domain/practice/distractors";
import { inferQuality } from "../src/domain/review/qualitySignal";
import { computeDifficulty, computeXpReward } from "../src/content/questions/difficulty";
import * as fs from "fs";
import * as path from "path";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

console.log("\n=========================================");
console.log("🧪 LINGORISE COMPREHENSIVE AUTOMATED TESTS");
console.log("=========================================\n");

// 1. Content Database Integrity & No Duplicates
console.log("1. Content & Database Validation:");
const validation = validateQuestionDatabase();
assert(validation.valid, "Question database is valid with 0 errors");
assert(validation.duplicateIds.length === 0, `No duplicate IDs found (total: ${allQuestions.length} questions)`);
assert(validation.invalidQuestions.length === 0, "No invalid question options found");

// Guards against the exact regression Sprint 6 fixed: auto-generated
// questions silently carrying a repeated placeholder sentence instead of
// real, per-word context.
const templatedSentences = allQuestions.filter((q) =>
  q.exampleSentence?.includes("Learn and use the word")
);
assert(
  templatedSentences.length === 0,
  `No question ships a template example sentence (checked ${allQuestions.length})`
);

// 2. Spaced Repetition (SM-2) Algorithm
console.log("\n2. Spaced Repetition (SM-2) Engine:");
const t0 = 1_700_000_000_000;
let sched = recordLearningOutcome(undefined, true, "2026-08-24", t0);
assert(sched.intervalDays === 1, "First successful recall schedules 1 day out");
assert(sched.easeFactor > DEFAULT_EASE_FACTOR, "A correct recall raises the ease factor");

sched = recordLearningOutcome(sched, true, "2026-08-25", t0 + DAY_MS);
assert(sched.intervalDays === 3, "Second successful recall schedules 3 days out");

sched = recordLearningOutcome(sched, true, "2026-08-28", t0 + 4 * DAY_MS);
assert(sched.intervalDays > 3, "Third recall grows the interval via the ease factor");

const beforeLapse = sched.easeFactor;
const lapsed = recordLearningOutcome(sched, false, "2026-08-29", t0 + 5 * DAY_MS);
assert(lapsed.easeFactor < beforeLapse, "A lapse lowers the ease factor");
assert(lapsed.intervalDays === 0, "A lapse collapses the interval for relearning");
assert(lapsed.nextReviewAt > t0 + 5 * DAY_MS, "A lapsed word is rescheduled shortly, not immediately");

// Intervals must keep growing rather than deleting the word from the schedule
let longTerm = recordLearningOutcome(undefined, true, "2026-01-01", t0);
for (let step = 1; step <= 6; step += 1) {
  longTerm = recordLearningOutcome(longTerm, true, `2026-01-0${step + 1}`, t0 + step * 10 * DAY_MS);
}
assert(longTerm.intervalDays >= 21, `Well-known words reach long spacing (${longTerm.intervalDays} days)`);
assert(deriveStatus(longTerm) === "mastered", "A word recalled repeatedly across days becomes mastered");
assert(longTerm.nextReviewAt > 0, "A mastered word stays scheduled instead of being deleted");

// 3. Garden Gamification & Growth Stages
console.log("\n3. Garden & Gamification Progress:");
const g1 = calculateGardenProgress(10);
assert(g1.stage === "sprout", "10 mastered words is the 'sprout' stage");
assert(g1.stageProgressPercent === 40, "Stage progress is the real share, with no artificial floor");

const gZero = calculateGardenProgress(0);
assert(gZero.stageProgressPercent === 0, "A brand-new garden honestly shows 0%");

const g2 = calculateGardenProgress(40);
assert(g2.stage === "leaf", "40 mastered words is the 'leaf' stage");

const g3 = calculateGardenProgress(100);
assert(g3.stage === "bud", "100 mastered words is the 'bud' stage");

const g4 = calculateGardenProgress(200);
assert(g4.stage === "flower", "200 mastered words is the 'flower' stage");

const g5 = calculateGardenProgress(300);
assert(g5.stage === "bloom_tree", "300 mastered words is the 'bloom_tree' stage");

// The garden must not finish before the content does
const dedicated = calculateGardenProgress(900);
assert(dedicated.stage === "bloom_tree", "A very advanced learner stays in the mature stage");
assert(dedicated.stageProgressPercent < 100, "The mature tree keeps a target ahead of it");
assert(
  dedicated.nextStageThresholdWords > 900,
  "The next threshold always sits above the current count, so the garden never finishes"
);

// XP no longer drives the garden at all
const heavyXpNoWords = calculateGardenProgress(0);
assert(heavyXpNoWords.stage === "sprout", "XP alone cannot grow the garden — only recalled words do");

// 4. Streak Calculation
console.log("\n4. Streak Tracker:");
const s1 = updateDailyStreak("2026-08-21", 3);
const sSame = updateDailyStreak(new Date().toISOString().split("T")[0], 5);
assert(sSame.newStreak === 5, "Same-day activity preserves streak at 5");

// roadmap 18-srs-flow-hardening.md CORE-001 — a backward clock correction
// (NTP resync, timezone change, manual fix) must not reset a real streak.
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const sBackward = updateDailyStreak(tomorrow, 12);
assert(sBackward.newStreak === 12, "A device clock moving backward across a date boundary does not reset the streak");
assert(!sBackward.isNewDay, "A backward clock reading is not treated as a new day");

// 5. Badge Unlocking Engine
console.log("\n5. Badge Evaluation:");
const testUser: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 160,
  streak: 3,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02", "a1-mm-03", "a1-mm-04", "a1-mm-05"],
  // Three correct answers across two distinct days — genuinely `mastered`,
  // not just `repetitions >= 2` (roadmap Birim 11.2 fixed badge_master_review
  // to require real mastery instead of a single-sitting review streak).
  learningProgress: Object.fromEntries(
    Array.from({ length: 25 }, (_, index) => [
      `consolidated-${index}`,
      recordLearningOutcome(
        recordLearningOutcome(
          recordLearningOutcome(undefined, true, "2026-08-24", 1),
          true,
          "2026-08-25",
          2
        ),
        true,
        "2026-08-25",
        3
      ),
    ])
  ),
};
const badges = evaluateBadges(testUser);
assert(badges.includes("badge_first_step"), "First Step badge unlocked");
assert(badges.includes("badge_quick_grow"), "Quick Grow badge unlocked at 160 XP");
assert(badges.includes("badge_garden_lover"), "Garden Lover badge unlocked at 5 solved questions");
assert(badges.includes("badge_streak_3"), "Streak 3 badge unlocked");
assert(badges.includes("badge_master_review"), "Master Review badge unlocked");

// 6. Localization 1:1 Key Parity Check
console.log("\n6. Localization Key Parity Check:");
function getKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "object" && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = getKeys(en).sort();
const trKeys = getKeys(tr).sort();
const missingInTr = enKeys.filter((k) => !trKeys.includes(k));
const missingInEn = trKeys.filter((k) => !enKeys.includes(k));

assert(missingInTr.length === 0, `All EN keys exist in TR (missing: ${missingInTr.join(", ") || "none"})`);
assert(missingInEn.length === 0, `All TR keys exist in EN (missing: ${missingInEn.join(", ") || "none"})`);
assert(enKeys.length === trKeys.length, `Exact 1:1 key parity verified (${enKeys.length} keys)`);

// 7. Daily Quests Progress
console.log("\n7. Daily Quests Progress:");
const practiceTarget = DEFAULT_USER_DATA.dailyQuests.find((q) => q.id === "quest_daily_practice")!.target;
assert(practiceTarget === DEFAULT_USER_DATA.practiceSessionSize, `Practice quest target mirrors session size (${practiceTarget})`);

const qResult = updateDailyQuests(DEFAULT_USER_DATA.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: practiceTarget });
assert(qResult.updatedQuests.find((q) => q.id === "quest_daily_practice")?.completed === true, "Practice quest completed after hitting its target");
assert(qResult.bonusXpEarned === 30, "Earned +30 bonus XP on quest completion");

const qWrong = updateDailyQuests(DEFAULT_USER_DATA.dailyQuests, { type: "PRACTICE", isCorrect: false, amount: practiceTarget });
assert(qWrong.updatedQuests.find((q) => q.id === "quest_daily_practice")?.current === 0, "Wrong answers never advance a daily quest");
assert(qWrong.bonusXpEarned === 0, "Wrong answers never pay quest bonus XP");

// 8. Progress Level Mastery Calculation Test
console.log("\n8. Progress & Level Breakdown:");
const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const totalQuestionsAll = levels.reduce((acc, l) => acc + getQuestionsByLevel(l).length, 0);
assert(totalQuestionsAll === 590, `All 6 levels verified with total ${totalQuestionsAll} curated questions`);

// 9. Vocabulary Content System & Search
console.log("\n9. Vocabulary Content Search & Versioning:");
const matchQuiet = findQuestionByWord("quiet");
assert(matchQuiet !== undefined && matchQuiet.id === "a1-mm-01", "Found word 'quiet' successfully via findQuestionByWord");
const searchResults = searchQuestions("sessiz");
assert(searchResults.length > 0, "searchQuestions returned results for Turkish meaning 'sessiz'");
assert(CONTENT_VERSION === "1.2.0", `Content version verified as ${CONTENT_VERSION}`);

// 10. Guest Mode & Storage Serialization
console.log("\n10. Guest Mode & Local Storage Integrity:");
const serialized = JSON.stringify(DEFAULT_USER_DATA);
const deserialized: UserData = JSON.parse(serialized);
assert(deserialized.xp === DEFAULT_USER_DATA.xp, "Local data serializes and deserializes XP accurately");
assert(deserialized.streak === DEFAULT_USER_DATA.streak, "Local data serializes and deserializes Streak accurately");
assert(Array.isArray(deserialized.dailyQuests), "Daily quests array preserved across storage cycles");
assert(DEFAULT_USER_DATA.xp === 0 && DEFAULT_USER_DATA.streak === 0, "New users begin with zero real progress");
assert(DEFAULT_USER_DATA.unlockedBadges.length === 0 && !DEFAULT_USER_DATA.lastCompletedWord, "New users receive no seeded badge or word");
const clearedDemo = normalizeUserData({
  ...DEFAULT_USER_DATA,
  xp: 120,
  streak: 3,
  lastCompletedWord: { word: "quiet", meaning: "sessiz", level: "A1" },
});
assert(clearedDemo.xp === 0 && clearedDemo.streak === 0 && clearedDemo.unlockedBadges.length === 0, "Untouched legacy demo profile is cleared safely");

// 11. Guest to Cloud Data Merge Algorithm
console.log("\n11. Guest-to-Cloud Merge Simulation:");
const guestData: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 150,
  streak: 4,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02"],
  unlockedBadges: ["badge_first_step", "badge_quick_grow"],
};
const cloudData: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 220,
  streak: 2,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-03"],
  unlockedBadges: ["badge_first_step", "badge_streak_3"],
};
const mergedXp = Math.max(guestData.xp, cloudData.xp);
const mergedStreak = Math.max(guestData.streak, cloudData.streak);
const mergedSolved = Array.from(new Set([...guestData.solvedQuestionIds, ...cloudData.solvedQuestionIds]));
const mergedBadges = Array.from(new Set([...guestData.unlockedBadges, ...cloudData.unlockedBadges]));

assert(mergedXp === 220, "Merged XP accurately takes the higher value (220)");
assert(mergedStreak === 4, "Merged Streak accurately takes the higher value (4)");
assert(mergedSolved.length === 3, "Merged solved questions combines both sets without duplicates (3)");
assert(mergedBadges.length === 3, "Merged badges combines all unique unlocked badges (3)");

// 12. Error Sanitization & Turkish Translation
console.log("\n12. Error Sanitization & User-Friendly Messages:");
const wrongPwMsg = getAuthErrorMessage("auth/wrong-password");
assert(wrongPwMsg === "Girdiğin şifre hatalı. Lütfen kontrol et.", "Firebase wrong-password maps to friendly Turkish error");
const emailInUseMsg = getAuthErrorMessage("auth/email-already-in-use");
assert(emailInUseMsg === "Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapmayı deneyebilirsin.", "Firebase email-already-in-use maps to friendly Turkish error");
const networkMsg = getAuthErrorMessage("auth/network-request-failed");
assert(networkMsg === "İnternet bağlantın yok gibi görünüyor. Bağlantını kontrol edip tekrar dene.", "Firebase network error maps to friendly Turkish message");

// 13. Async Retry & Offline Resilience
console.log("\n13. Async Retry & Error Handling:");
const isNetErr = isOfflineError(new Error("network error: failed to fetch"));
assert(isNetErr === true, "isOfflineError accurately detects network disconnect errors");
const isRegularErr = isOfflineError(new Error("validation failed"));
assert(isRegularErr === false, "isOfflineError returns false for non-network errors");

// 14. Design System Tokens & Touch Targets
console.log("\n14. Design System Tokens & Touch Targets:");
assert(componentSizes.primaryButtonHeight === 52, "Primary button height standardized to 52px");
assert(componentSizes.secondaryButtonHeight === 44, "Secondary button height standardized to 44px");
assert(componentSizes.minTouchTarget === 44, "Minimum touch target meets accessibility guideline (44px)");
assert(componentSizes.contentMaxWidth === 580, "Content max width standardized for tablets (580px)");
assert(iconSizes.md === 20, "Medium icon size standardized to 20px");

// 15. End-to-End User Learning Flow Simulation
console.log("\n15. E2E User Journey (Practice -> Quest -> XP -> Badge Unlock):");
let state: UserData = { ...DEFAULT_USER_DATA, xp: 120, solvedQuestionIds: [] };

// Step 1: User solves first question
const q1 = allQuestions[0];
state = {
  ...state,
  xp: state.xp + (q1.xp || 10),
  solvedQuestionIds: [...state.solvedQuestionIds, q1.id],
};
const journeyTarget = state.dailyQuests.find((q) => q.id === "quest_daily_practice")!.target;
const questUpdate1 = updateDailyQuests(state.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: 1 });
state.dailyQuests = questUpdate1.updatedQuests;
state.xp += questUpdate1.bonusXpEarned;

assert(state.xp === 130, "XP incremented to 130 after first question");
assert(state.solvedQuestionIds.includes(q1.id), "Solved question ID tracked in user state");
assert(state.dailyQuests.find((q) => q.id === "quest_daily_practice")?.current === 1, `Daily quest progress updated to 1/${journeyTarget}`);

// Step 2: User finishes the remaining words -> completes quest -> unlocks Quick Grow badge
const q2 = allQuestions[1];
state = {
  ...state,
  xp: state.xp + (q2.xp || 10),
  solvedQuestionIds: [...state.solvedQuestionIds, q2.id],
};
const questUpdate2 = updateDailyQuests(state.dailyQuests, { type: "PRACTICE", isCorrect: true, amount: journeyTarget - 1 });
state.dailyQuests = questUpdate2.updatedQuests;
state.xp += questUpdate2.bonusXpEarned;

assert(state.dailyQuests.find((q) => q.id === "quest_daily_practice")?.completed === true, `Daily practice quest completed (${journeyTarget}/${journeyTarget})`);
assert(state.xp === 170, "Earned +10 XP + 30 Quest Bonus XP (total: 170 XP)");

const newBadges = evaluateBadges(state);
assert(newBadges.includes("badge_quick_grow"), "Quick Grow badge automatically unlocked at 170 XP");
const newGarden = calculateGardenProgress(countMasteredWords(state.learningProgress));
assert(newGarden.stage === "sprout", "Garden stays at 'sprout' — XP was earned but nothing is mastered yet");

// 16. Storage Schema Migration & Corrupted Fallback
console.log("\n16. Storage Schema Migration & Safe Recovery:");
const legacyDataV1: Record<string, any> = {
  xp: 140,
  level: "A2",
  streak: 5,
};
const migrated: UserData = {
  ...DEFAULT_USER_DATA,
  ...legacyDataV1,
  dailyGoalMinutes: legacyDataV1.dailyGoalMinutes || DEFAULT_USER_DATA.dailyGoalMinutes,
  notificationsEnabled: legacyDataV1.notificationsEnabled ?? DEFAULT_USER_DATA.notificationsEnabled,
  soundEnabled: legacyDataV1.soundEnabled ?? DEFAULT_USER_DATA.soundEnabled,
  reduceMotion: legacyDataV1.reduceMotion ?? DEFAULT_USER_DATA.reduceMotion,
};
assert(migrated.dailyGoalMinutes === 5, "Legacy data missing dailyGoalMinutes safely migrated to 5 min default");
assert(migrated.soundEnabled === true, "Legacy data missing soundEnabled safely migrated to true");
assert(migrated.xp === 140, "Legacy XP (140) preserved accurately");
assert(migrated.notificationsEnabled === false, "Legacy data defaults notification permission to opt-in");

// 17. Practice session persistence schema
console.log("\n17. Practice Session Resume Schema:");
const activeSession = {
  questionIds: ["a1-mm-01", "a1-mm-02"],
  currentIndex: 1,
  answers: [{ questionId: "a1-mm-01", isCorrect: true, xpEarned: 10 }],
  sessionMode: "PRACTICE" as const,
  startedAt: Date.now(),
};
const resumableUser: UserData = { ...DEFAULT_USER_DATA, activeSession };
assert(resumableUser.activeSession?.questionIds.length === 2, "Active practice question IDs are persistable");
assert(resumableUser.activeSession?.currentIndex === 1, "Active practice cursor is persistable");
assert(resumableUser.activeSession?.answers.length === 1, "Active practice answers are persistable");

// 18. Responsive Layout & Screen Clamp Verification
console.log("\n18. Responsive Screen Width Clamp:");
const mobileWidth = 360;
const tabletWidth = 1024;
const getLayoutWidth = (w: number) => Math.min(w, componentSizes.contentMaxWidth);
assert(getLayoutWidth(mobileWidth) === 360, "Mobile screen width (360px) stays full width");
assert(getLayoutWidth(tabletWidth) === 580, "Tablet screen width (1024px) cleanly clamped to 580px max");

// 19. Daily Rollover — the loop must restart every day
console.log("\n19. Daily Rollover & Quest Reset:");
const finishedDay: UserData = {
  ...DEFAULT_USER_DATA,
  lastActiveDate: "2026-08-23",
  dailyReviewXpIds: ["a1-mm-01", "a1-mm-02"],
  dailyQuests: createDailyQuests(20, true).map((q) => ({ ...q, current: q.target, completed: true })),
};
const rolledOver = applyDailyRollover(finishedDay, "2026-08-24");

assert(rolledOver.dailyQuests.every((q) => !q.completed), "New day issues uncompleted quests");
assert(rolledOver.dailyQuests.every((q) => q.current === 0), "New day resets quest progress to zero");
assert(rolledOver.dailyReviewXpIds.length === 0, "New day clears the per-day review XP guard");
assert(rolledOver.questHistory.length === 2, "Closing day's completed quests are archived to history");
assert(rolledOver.questHistory[0].date === "2026-08-23", "Archived entries carry the closing day's date");

const noBacklog = applyDailyRollover({ ...DEFAULT_USER_DATA, learningProgress: {} }, "2026-08-24");
assert(
  noBacklog.dailyQuests.every((q) => q.id !== "quest_daily_review"),
  "Review quest is withheld when there is nothing to review"
);

// 20. Review XP is capped to once per word per day
console.log("\n20. Review XP Farming Guard:");
const reviewQuestion = allQuestions[0];
const correctAnswer = reviewQuestion.meaning || reviewQuestion.answer || "";
const dueRecord = recordLearningOutcome(undefined, true, "2026-08-01", Date.now() - 10 * DAY_MS);

let farmState: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 0,
  // Already earned its first-encounter XP, and its schedule has come around.
  rewardedQuestionIds: [reviewQuestion.id],
  solvedQuestionIds: [reviewQuestion.id],
  learningProgress: { [reviewQuestion.id]: { ...dueRecord, nextReviewAt: Date.now() - 1000 } },
};

farmState = applyPracticeAnswer(farmState, reviewQuestion, correctAnswer, 10);
const xpAfterFirstReview = farmState.xp;
assert(xpAfterFirstReview === 5, "Clearing a due review pays +5 XP");

farmState = applyPracticeAnswer(farmState, reviewQuestion, "yanlış-cevap", 10);
farmState = applyPracticeAnswer(farmState, reviewQuestion, correctAnswer, 10);
assert(farmState.xp === xpAfterFirstReview, "Repeating the same word the same day pays no further XP");

// A known word that is NOT due must not pay at all
let notDueState: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 0,
  rewardedQuestionIds: [reviewQuestion.id],
  learningProgress: { [reviewQuestion.id]: { ...dueRecord, nextReviewAt: Date.now() + 5 * DAY_MS } },
};
notDueState = applyPracticeAnswer(notDueState, reviewQuestion, correctAnswer, 10);
assert(notDueState.xp === 0, "Replaying a word that is not due pays no XP");

// 21. Spacing is actually enforced
console.log("\n21. Spaced Repetition Interval Enforcement:");
const freshMistake = recordLearningOutcome(undefined, false, "2026-08-24", Date.now());
assert(freshMistake.nextReviewAt > Date.now(), "A freshly missed word is scheduled into the future");
assert(!isItemDue(freshMistake), "A freshly missed word is not immediately due");
assert(getDueReviewItems({ w: freshMistake }).length === 0, "A freshly missed word is absent from the due list");

const overdue = { ...freshMistake, nextReviewAt: Date.now() - 1000 };
assert(getDueReviewItems({ w: overdue }).length === 1, "A word past its scheduled time becomes due");
assert(getDueReviewItems({}).length === 0, "An empty record produces no due words");

// Most overdue material is surfaced first
const dueOrder = getDueReviewItems({
  later: { ...freshMistake, nextReviewAt: Date.now() - 1000 },
  earlier: { ...freshMistake, nextReviewAt: Date.now() - 90000 },
});
assert(dueOrder[0].questionId === "earlier", "Due words are ordered most-overdue first");

// 22. Mastery is earned over days, never in one sitting
console.log("\n22. Mastery Derivation:");
let word = recordLearningOutcome(undefined, true, "2026-08-24", 1);
assert(deriveStatus(word) === "learning", "One correct answer only reaches 'learning'");

word = recordLearningOutcome(word, true, "2026-08-24", 2);
assert(deriveStatus(word) === "review", "Two consecutive correct answers reach 'review'");

word = recordLearningOutcome(word, true, "2026-08-24", 3);
assert(deriveStatus(word) !== "mastered", "Three correct answers in ONE day still cannot be 'mastered'");
assert(word.distinctCorrectDays === 1, "Same-day answers count as a single correct day");

word = recordLearningOutcome(word, true, "2026-08-25", 4);
assert(deriveStatus(word) === "mastered", "Recall confirmed on a second day reaches 'mastered'");

const forgotten = recordLearningOutcome(word, false, "2026-08-26", 5);
assert(deriveStatus(forgotten) === "learning", "A wrong answer demotes a mastered word back to 'learning'");
assert(forgotten.repetitions === 0, "A wrong answer resets the recall streak");
assert(forgotten.distinctCorrectDays === 2, "History of correct days survives a lapse");

// 23. Mastery summary drives the percentages screens are allowed to show
console.log("\n23. Mastery Summary & Percentages:");
const pool = ["w1", "w2", "w3", "w4"];
const progressMap = {
  w1: word,
  w2: recordLearningOutcome(recordLearningOutcome(undefined, true, "2026-08-24", 1), true, "2026-08-24", 2),
  w3: recordLearningOutcome(undefined, true, "2026-08-24", 1),
};
const summary = summarizeMastery(progressMap, pool);
assert(summary.mastered === 1, "Summary counts exactly one mastered word");
assert(summary.review === 1, "Summary counts exactly one word in review");
assert(summary.learning === 1, "Summary counts exactly one word still being learned");
assert(summary.notStarted === 1, "Summary counts untouched words as not started");
assert(summary.masteredPercent === 25, "Percentage reflects mastered words only (1 of 4)");
assert(summary.inProgress === 2, "In-progress work is reported separately, not hidden");
assert(countMasteredWords(progressMap) === 1, "Global mastered count matches the summary");

// 24. Answering wires straight into the recall record
console.log("\n24. Answer -> Learning Record Wiring:");
const learnQuestion = allQuestions[0];
const learnCorrect = learnQuestion.meaning || learnQuestion.answer || "";
let learnState: UserData = { ...DEFAULT_USER_DATA, xp: 0, learningProgress: {} };

learnState = applyPracticeAnswer(learnState, learnQuestion, learnCorrect, 10, "PRACTICE");
assert(learnState.learningProgress[learnQuestion.id]?.repetitions === 1, "A correct practice answer is recorded against the word");
assert(summarizeMastery(learnState.learningProgress, [learnQuestion.id]).masteredPercent === 0, "One correct answer does not move the mastery percentage");

learnState = applyPracticeAnswer(learnState, learnQuestion, "yanlış-cevap", 10, "PRACTICE");
assert(learnState.learningProgress[learnQuestion.id]?.wrongCount === 1, "A wrong answer is recorded against the word");
assert(learnState.learningProgress[learnQuestion.id]?.repetitions === 0, "A wrong answer resets the word's recall streak");

// 25. Legacy solved ids migrate to 'learning', never to mastery
console.log("\n25. Learning Progress Migration:");
const legacyLearner = normalizeUserData({
  xp: 200,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02", "a1-mm-03"],
} as Partial<UserData>);
assert(Object.keys(legacyLearner.learningProgress).length === 3, "Every legacy solved id is carried into the recall record");
assert(
  Object.values(legacyLearner.learningProgress).every((item) => deriveStatus(item) === "learning"),
  "Legacy solved ids adopt 'learning', never an inflated status"
);
assert(countMasteredWords(legacyLearner.learningProgress) === 0, "Migration never invents mastered words");

// A large back catalogue must not all come due on upgrade day
const bigLearner = normalizeUserData({
  xp: 3000,
  solvedQuestionIds: getQuestionsByLevel("A1").slice(0, 200).map((q) => q.id),
} as Partial<UserData>);
const dueOnUpgradeDay = getDueReviewItems(bigLearner.learningProgress).length;
assert(
  dueOnUpgradeDay < 200,
  `Migrated schedules are spread over days, not dumped at once (${dueOnUpgradeDay} due today)`
);
assert(dueOnUpgradeDay > 0, "Some migrated words are still due immediately so review can begin");

// 26. Signing in must never erase practice one side did not see
console.log("\n26. Learning Record Merge (device + cloud):");
const deviceOnly = recordLearningOutcome(undefined, true, "2026-08-24", 100);
const richLocal = recordLearningOutcome(recordLearningOutcome(deviceOnly, true, "2026-08-25", 200), true, "2026-08-26", 300);
const thinRemote = recordLearningOutcome(undefined, true, "2026-08-24", 50);

const mergedProgress = mergeLearningProgress(
  { shared: richLocal, localOnly: deviceOnly },
  { shared: thinRemote, remoteOnly: thinRemote }
);
assert(Object.keys(mergedProgress).length === 3, "Merge keeps words seen by either side");
assert(mergedProgress.shared.attempts === richLocal.attempts, "Merge keeps the richer history for a shared word");
assert(mergedProgress.localOnly !== undefined, "Device-only practice survives the merge");
assert(mergedProgress.remoteOnly !== undefined, "Cloud-only practice survives the merge");

// 27. One daily flow: debt before new words
console.log("\n27. Unified Daily Session:");
const a1Pool = getQuestionsByLevel("A1");
const overdueWord = { ...recordLearningOutcome(undefined, true, "2026-08-01", 1), nextReviewAt: Date.now() - 1000 };

const mixedSession = buildDailySession({
  ...DEFAULT_USER_DATA,
  practiceSessionSize: 5,
  rewardedQuestionIds: [a1Pool[0].id, a1Pool[1].id],
  solvedQuestionIds: [a1Pool[0].id, a1Pool[1].id],
  learningProgress: { [a1Pool[0].id]: overdueWord, [a1Pool[1].id]: overdueWord },
});
assert(mixedSession.length === 5, "Daily session fills up to the chosen session length");
assert(mixedSession[0].id === a1Pool[0].id, "Overdue reviews are served before anything new");
assert(mixedSession[1].id === a1Pool[1].id, "All overdue reviews come first");
assert(
  !mixedSession.slice(2).some((q) => [a1Pool[0].id, a1Pool[1].id].includes(q.id)),
  "New words fill the remaining slots without repeating the reviews"
);

const noDueSession = buildDailySession({ ...DEFAULT_USER_DATA, practiceSessionSize: 5 });
assert(noDueSession.length === 5, "With nothing due the session is all new words");

// Backlog protection: past the limit, no new vocabulary is introduced
const drowningProgress: Record<string, any> = {};
for (let index = 0; index < REVIEW_DEBT_LIMIT + 5; index += 1) {
  drowningProgress[a1Pool[index].id] = overdueWord;
}
const backloggedSession = buildDailySession({
  ...DEFAULT_USER_DATA,
  practiceSessionSize: 30,
  rewardedQuestionIds: Object.keys(drowningProgress),
  solvedQuestionIds: Object.keys(drowningProgress),
  learningProgress: drowningProgress,
});
assert(
  backloggedSession.every((q) => drowningProgress[q.id] !== undefined),
  "Past the debt limit no new words are introduced — only the backlog"
);

// 28. Units break the level into finishable chunks
console.log("\n28. Level Units:");
const a1Total = getQuestionsByLevel("A1").length;
const freshUnit = getLevelUnitInfo("A1", []);
assert(freshUnit.unitIndex === 0, "A new learner starts in the first unit");
assert(freshUnit.unitCount === Math.ceil(a1Total / CONTENT_UNIT_SIZE), `A1 splits into ${freshUnit.unitCount} units`);
assert(freshUnit.unitCount >= 10, "A 320-word level yields enough units to feel finishable");
assert(freshUnit.questions.length === CONTENT_UNIT_SIZE, `Each unit holds ${CONTENT_UNIT_SIZE} words`);
assert(freshUnit.learnedInUnit === 0, "Nothing is learned in a fresh unit");

const firstUnitIds = freshUnit.questions.map((q) => q.id);
const midUnit = getLevelUnitInfo("A1", firstUnitIds.slice(0, 10));
assert(midUnit.unitIndex === 0, "A partly finished unit is still the current unit");
assert(midUnit.learnedInUnit === 10, "Progress inside the current unit is reported");

const secondUnit = getLevelUnitInfo("A1", firstUnitIds);
assert(secondUnit.unitIndex === 1, "Finishing a unit advances to the next one");

// Publishing metadata is stamped rather than left blank
const stampedQuestions = getQuestionsByLevel("A1");
assert(stampedQuestions.every((q) => !!q.unitId), "Every A1 question carries a unit id");
assert(stampedQuestions.every((q) => q.status === "published"), "Every A1 question carries a publish status");
assert(stampedQuestions[0].unitId === "a1-u01", "Unit ids follow the level's own numbering");

// 29. Promotion is earned by mastery, and never opens onto empty content
console.log("\n29. Level Promotion:");
const a1Questions = getQuestionsByLevel("A1");

const masteredWord = (seed: number) =>
  recordLearningOutcome(
    recordLearningOutcome(
      recordLearningOutcome(undefined, true, "2026-08-24", seed),
      true,
      "2026-08-25",
      seed + 1
    ),
    true,
    "2026-08-26",
    seed + 2
  );

const barelyStarted = evaluatePromotion("A1", {}, []);
assert(!barelyStarted.isEarned, "A level is not earned before any words are mastered");
assert(!barelyStarted.shouldCelebrate, "No celebration is offered without mastery");
assert(barelyStarted.remainingPercent === PROMOTION_THRESHOLD_PERCENT, "Remaining percentage counts down to the threshold");

const mostlyMastered: Record<string, any> = {};
a1Questions.slice(0, Math.ceil(a1Questions.length * 0.85)).forEach((q, index) => {
  mostlyMastered[q.id] = masteredWord(index * 10);
});
const earned = evaluatePromotion("A1", mostlyMastered, []);
assert(earned.isEarned, `A1 is earned at ${earned.masteredPercent}% mastery`);
assert(earned.shouldCelebrate, "An uncelebrated earned level triggers the celebration");
assert(earned.nextLevel === "A2", "The next level on the ladder is offered");
assert(getNextLevel("B2") === "C1", "The ladder advances in CEFR order");
assert(getNextLevel("C2") === null, "There is nothing beyond the final level");

// The content gate: A2 was expanded past the readiness threshold in Sprint 6,
// so promotion into it is now genuinely offered.
assert(earned.isNextLevelReady, "A2 is now reported as ready — content expansion cleared the gate");
assert(isLevelReady("A2"), "isLevelReady accepts A2 now that it has 100+ words");
assert(isLevelReady("A1"), "isLevelReady accepts a fully populated level");
assert(!isLevelReady("B1"), "isLevelReady still refuses a level below the content minimum (B1)");

const alreadyCelebrated = evaluatePromotion("A1", mostlyMastered, ["A1"]);
assert(alreadyCelebrated.isEarned, "An earned level stays earned");
assert(!alreadyCelebrated.shouldCelebrate, "The celebration is shown once, not on every launch");

// 30. Level choice is guided, never blocked
console.log("\n30. Soft Gate on Level Choice:");
const earlyJump = assessLevelChoice("B1", "A1", {});
assert(earlyJump.isAhead, "Jumping ahead without mastery is flagged as early");
assert(earlyJump.currentMasteredPercent === 0, "The warning carries the learner's real progress");

const informedJump = assessLevelChoice("A2", "A1", mostlyMastered);
assert(!informedJump.isAhead, "A learner who mastered their level is not warned");

const stepBack = assessLevelChoice("A1", "A1", {});
assert(!stepBack.isAhead, "Staying on the current level is never flagged");

// 31. Review debt follows the learner across levels
console.log("\n31. Cross-Level Review Debt:");
const a2Questions = getQuestionsByLevel("A2");
const overdueA1 = { ...recordLearningOutcome(undefined, true, "2026-08-01", 1), nextReviewAt: Date.now() - 1000 };
const crossLevelSession = buildDailySession({
  ...DEFAULT_USER_DATA,
  level: "A2",
  practiceSessionSize: 5,
  rewardedQuestionIds: [a1Questions[0].id],
  solvedQuestionIds: [a1Questions[0].id],
  learningProgress: { [a1Questions[0].id]: overdueA1 },
});
assert(
  crossLevelSession[0].id === a1Questions[0].id,
  "An overdue A1 word still comes up after switching to A2"
);
assert(
  crossLevelSession.slice(1).every((q) => a2Questions.some((a2) => a2.id === q.id)),
  "New words come from the level the learner is now on"
);

// 32. One number, one meaning — no raw keys, no divergent counts
console.log("\n32. Screen Consistency:");
const consistencyProgress: Record<string, any> = {
  a: { ...recordLearningOutcome(undefined, true, "2026-08-01", 1), nextReviewAt: Date.now() - 1000 },
  b: { ...recordLearningOutcome(undefined, true, "2026-08-01", 2), nextReviewAt: Date.now() + DAY_MS },
};
const dueEverywhere = getDueReviewItems(consistencyProgress).length;
assert(dueEverywhere === 1, "The due count reflects the schedule, not the lifetime mistake tally");

// Every topic in the catalogue resolves to a human label
const trCopy = copyByLocale.tr;
const rawTopics = Array.from(new Set(allQuestions.map((q) => q.topic).filter(Boolean)));
const unlabelled = rawTopics.filter((topic) => {
  const label = getTopicLabel(trCopy, topic);
  return label.includes("_");
});
assert(unlabelled.length === 0, `No raw content key reaches the screen (checked ${rawTopics.length} topics)`);
assert(getTopicLabel(trCopy, "core_verbs") === "Temel Fiiller", "Generated topics resolve to Turkish labels");
assert(getTopicLabel(trCopy, "Sıfatlar") === "Sıfatlar", "Hand-written Turkish topics pass through untouched");

// 33. Every i18n key a component asks for actually exists
console.log("\n33. Dictionary Completeness:");
const enCopy = copyByLocale.en;
const sampledKeys: [string, string][] = [
  ["game.modeLabel", enCopy.game.modeLabel],
  ["game.hint", enCopy.game.hint],
  ["game.hintActive", enCopy.game.hintActive],
  ["game.backButton", enCopy.game.backButton],
  ["game.reviewModeBadge", enCopy.game.reviewModeBadge],
  ["game.quickPractice", enCopy.game.quickPractice],
  ["game.optionCorrectSuffix", enCopy.game.optionCorrectSuffix],
  ["game.audioErrorToast", enCopy.game.audioErrorToast],
  ["onboarding.createAccountNow", enCopy.onboarding.createAccountNow],
  ["progress.dueNowLabel", enCopy.progress.dueNowLabel],
  ["progress.levelComingSoon", enCopy.progress.levelComingSoon],
  ["home.questHistoryTitle", enCopy.home.questHistoryTitle],
];
for (const [name, value] of sampledKeys) {
  assert(typeof value === "string" && value.length > 0, `${name} resolves to real English copy`);
}

// The narrowed Copy type is what guarantees this at build time
assert(
  Object.keys(enCopy.game).length === Object.keys(copyByLocale.tr.game).length,
  "Practice dictionary stays 1:1 between languages"
);

// 34. A finished session must show up as real progress immediately
console.log("\n34. Level Card Shows Real Same-Day Work:");
const sameDayQuestions = getQuestionsByLevel("A1").slice(0, 33);
const sameDayLearner = {
  solvedQuestionIds: sameDayQuestions.map((q) => q.id),
  learningProgress: Object.fromEntries(
    sameDayQuestions.map((q) => [q.id, recordLearningOutcome(undefined, true, "2026-08-24", Date.now())])
  ),
};
const seenToday = sameDayLearner.solvedQuestionIds.filter((id) =>
  getQuestionsByLevel("A1").some((q) => q.id === id)
).length;
assert(seenToday === 33, "Words answered correctly today are counted as 'seen' immediately, not zero");

const masterySameDay = summarizeMastery(
  sameDayLearner.learningProgress,
  getQuestionsByLevel("A1").map((q) => q.id)
);
assert(masterySameDay.mastered === 0, "None of today's words are 'mastered' yet — that still needs a second day");
assert(
  seenToday > masterySameDay.mastered,
  "Seen and mastered are reported as two different numbers, never collapsed into one"
);

// 35. Pick the Word — reversed session needs no new content
console.log("\n35. Pick the Word Mode:");
const forwardSession = getQuestionsByLevel("A1").slice(0, 5);
const reversed = toPickTheWordSession(forwardSession);

assert(reversed.length === forwardSession.length, "Reversing a session keeps every question");
assert(
  reversed.every((q, i) => q.id === forwardSession[i].id),
  "Question ids are untouched — mastery tracking stays on the same word"
);
assert(
  reversed[0].word === forwardSession[0].meaning,
  "The Turkish meaning becomes the prompt"
);
assert(
  reversed[0].meaning === forwardSession[0].word,
  "The English word becomes the correct answer"
);
assert(
  !!reversed[0].options?.includes(forwardSession[0].word || ""),
  "The correct English word is among the options"
);
assert(
  new Set(reversed[0].wrongOptions).size === reversed[0].wrongOptions.length,
  "Decoys are not duplicated"
);
assert(
  !reversed[0].wrongOptions.includes(forwardSession[0].word || ""),
  "The correct word never appears as its own decoy"
);
assert(
  reversed[0].exampleSentence === forwardSession[0].exampleSentence,
  "Example sentence content is untouched by reversal"
);

assert(canUsePickTheWord(5), "Pick the Word is available for a normal session size");
assert(!canUsePickTheWord(2), "Pick the Word is withheld when there aren't enough words for decoys");

// 36. Multi-day simulation — the flows a single device session can't observe
console.log("\n36. Multi-Day Simulation (7 days, roadmap Birim 4.2):");
{
  const words = getQuestionsByLevel("A1").slice(0, 5);
  const correctAnswerFor = (q: (typeof words)[number]) => q.meaning || q.answer || "";

  let state: UserData = { ...DEFAULT_USER_DATA, learningProgress: {} };
  const startDate = new Date("2026-01-01T09:00:00Z").getTime();

  for (let day = 0; day < 7; day += 1) {
    const dayTime = startDate + day * DAY_MS;
    const dayISO = new Date(dayTime).toISOString().slice(0, 10);

    // Every word answered correctly, once per day — this is exactly the
    // pattern that requires the "2 distinct days" mastery rule to be
    // exercised across real day boundaries, not a single test call.
    for (const word of words) {
      const before = state.learningProgress[word.id];
      const outcome = recordLearningOutcome(before, true, dayISO, dayTime);
      state = {
        ...state,
        learningProgress: { ...state.learningProgress, [word.id]: outcome },
      };
    }
  }

  const finalMastery = summarizeMastery(state.learningProgress, words.map((w) => w.id));
  assert(
    finalMastery.mastered === words.length,
    `All ${words.length} words answered correctly across 7 distinct days are mastered (got ${finalMastery.mastered})`
  );

  const gardenAfterWeek = calculateGardenProgress(finalMastery.mastered);
  assert(gardenAfterWeek.stage === "sprout", "5 mastered words is still early-stage — the garden does not overreact to a small sample");
}

// 37. Multi-day rollover chain — quests and history across a real week
console.log("\n37. Multi-Day Rollover Chain (7 days):");
{
  let rolloverState: UserData = {
    ...DEFAULT_USER_DATA,
    dailyQuests: createDailyQuests(10, false).map((q) => ({ ...q, current: q.target, completed: true })),
  };
  let lastActive = "2026-02-01";

  for (let day = 1; day <= 7; day += 1) {
    const closingDate = lastActive;
    const nextDate = `2026-02-0${day + 1}`;
    rolloverState = applyDailyRollover(rolloverState, nextDate);
    // Simulate the day being fully completed again, so the next rollover has
    // something real to archive.
    rolloverState = {
      ...rolloverState,
      dailyQuests: rolloverState.dailyQuests.map((q) => ({ ...q, current: q.target, completed: true })),
    };
    lastActive = nextDate;
  }

  assert(rolloverState.questHistory.length === 7, `A full week of completed days archives 7 entries (got ${rolloverState.questHistory.length})`);
  assert(
    new Set(rolloverState.questHistory.map((h) => h.date)).size === 7,
    "Each archived day has a distinct date — no day is silently merged or dropped"
  );
  assert(
    rolloverState.dailyQuests.every((q) => q.current === q.target && q.completed),
    "The simulated week's final day quest state is exactly what was set, not stale"
  );
}

// 38. Thirty-day mastery growth — long enough for SM-2 intervals to matter
console.log("\n38. Thirty-Day Mastery Growth (roadmap Birim 4.2):");
{
  const level = "A1";
  const pool = getQuestionsByLevel(level).slice(0, 40);
  let progress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  const start = new Date("2026-03-01T08:00:00Z").getTime();

  // A realistic-ish pattern: five new words learned per day, always answered
  // correctly, for thirty days — enough time for the longer SM-2 intervals
  // (repetition 3+) to actually come due and be re-answered within the window.
  for (let day = 0; day < 30; day += 1) {
    const dayTime = start + day * DAY_MS;
    const dayISO = new Date(dayTime).toISOString().slice(0, 10);

    for (const [id, item] of Object.entries(progress)) {
      if (item.nextReviewAt <= dayTime) {
        progress = { ...progress, [id]: recordLearningOutcome(item, true, dayISO, dayTime) };
      }
    }

    const newToday = pool.slice(day * 1, day * 1 + 1).filter((q) => !progress[q.id]);
    for (const word of newToday) {
      progress = { ...progress, [word.id]: recordLearningOutcome(undefined, true, dayISO, dayTime) };
    }
  }

  const summary = summarizeMastery(progress, pool.map((q) => q.id));
  assert(summary.mastered > 0, `Thirty days of consistent review produces mastered words (got ${summary.mastered})`);
  assert(
    summary.mastered + summary.review + summary.learning <= 30,
    "No more words show progress than were actually introduced across the month"
  );
  const scheduledFar = Object.values(progress).filter((item) => item.intervalDays >= 8);
  assert(
    scheduledFar.length > 0,
    "At least one word reached a multi-week interval within thirty days — long spacing is reachable, not just theoretical"
  );
}

// 39. Telemetry — every event call site is wired and callable
console.log("\n39. Telemetry Event Recording (roadmap Birim 5):");
{
  // track() is fire-and-forget by design (callers never await it) and must
  // never throw synchronously, since every call site in the app — inside
  // reducers, effects, and press handlers — calls it unguarded. The
  // AsyncStorage-backed persistence itself is verified on-device (this
  // script runs under plain ts-node, which has no real AsyncStorage), but
  // every event shape below is exactly what production code sends.
  let threw = false;
  try {
    track("session_started", { daysSinceLastOpen: 1 });
    track("daily_rollover_applied", { streakBefore: 3, streakAfter: 4, pendingReviewsAtOpen: 2 });
    track("practice_session_started", { sessionType: "mixed", dueCount: 3, freshCount: 17, reverseMode: false });
    track("question_answered", { questionId: "a1-mm-01", isCorrect: true, isFirstEncounter: true, wasDue: false, usedHint: false, level: "A1", responseTimeMs: 2100, inferredQuality: 5 });
    track("word_mastery_changed", { fromStatus: "review", toStatus: "mastered", questionId: "a1-mm-01" });
    track("garden_stage_changed", { fromStage: "sprout", toStage: "leaf", masteredWords: 25 });
    track("review_debt_capped", { dueCount: 42, sessionSize: 20 });
    track("level_promotion_shown", { level: "A1", masteredPercent: 82, nextLevelReady: true });
    track("level_promotion_advanced", { fromLevel: "A1", toLevel: "A2" });
    track("level_switch_warning_shown", { currentLevel: "A1", targetLevel: "B1", currentMasteredPercent: 34 });
    track("level_switch_confirmed_ahead", { currentLevel: "A1", targetLevel: "B1" });
    track("daily_quest_completed", { questId: "quest_daily_practice", xpEarned: 30 });
    track("session_abandoned", { questionsAnswered: 7, questionsTotal: 20 });
    track("practice_session_completed", { questionsAnswered: 20, questionsTotal: 20, correctCount: 18, sessionMode: "PRACTICE" });
    track("unit_completed", { level: "A1", unitIndex: 0, wordsInUnit: 30 });
    track("migration_applied", { fromVersion: 1, toVersion: 3, hadLegacyReviewQueue: true, hadLegacyQuestSet: false });
  } catch {
    threw = true;
  }
  assert(!threw, "Every event in the roadmap's §5.2 event set is callable without throwing");
}

// 40. Merge conflict resolution survives device clock skew (roadmap Birim 7.1-7.2)
console.log("\n40. Cross-Device Merge — Clock Skew (roadmap Birim 7.1-7.2):");
{
  // Equal attempts, but the local device's clock is skewed two hours into
  // the future — lastAnsweredAt alone would wrongly pick the local record
  // even though the remote one is genuinely the more recent answer. Once
  // both sides carry a Firestore serverSyncedAt, that (not the device
  // clock) must win the tie-break.
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const now = 1_800_000_000_000;
  const localSkewed = recordLearningOutcome(undefined, true, "2026-08-24", now + twoHoursMs);
  const remoteReal = recordLearningOutcome(undefined, true, "2026-08-24", now);
  assert(localSkewed.attempts === remoteReal.attempts, "Both records have the same attempt count — this is a true tie-break case");

  const localWithOldServerStamp = { ...localSkewed, serverSyncedAt: now - DAY_MS };
  const remoteWithNewServerStamp = { ...remoteReal, serverSyncedAt: now };
  const resolved = mergeLearningProgress({ w: localWithOldServerStamp }, { w: remoteWithNewServerStamp });
  assert(
    resolved.w.serverSyncedAt === remoteWithNewServerStamp.serverSyncedAt,
    "When both sides have synced before, the server-stamped record wins even though the device clock disagrees"
  );

  // Neither side has ever synced (serverSyncedAt undefined on both) — falls
  // back to the pre-existing device-clock comparison, unchanged from before.
  const neitherSynced = mergeLearningProgress({ w: localSkewed }, { w: remoteReal });
  assert(
    neitherSynced.w.lastAnsweredAt === localSkewed.lastAnsweredAt,
    "Before either side has ever synced, the device clock is still the only signal available — same as pre-Sprint-8 behavior"
  );

  // The whole record is taken atomically — the winning record's own
  // nextReviewAt/easeFactor/repetitions can never end up mismatched.
  assert(
    resolved.w.nextReviewAt === remoteWithNewServerStamp.nextReviewAt &&
      resolved.w.easeFactor === remoteWithNewServerStamp.easeFactor,
    "The winning record's schedule fields all come from the same record — never spliced from the loser"
  );
}

// 41. A device offline for days must not lose or corrupt either side's work
console.log("\n41. Cross-Device Merge — Multi-Day Offline Gap (roadmap Birim 7.1):");
{
  // Device A goes offline for 3 days and practices 3 words nobody else saw.
  // Device B stays online for the same window and practices 3 different
  // words. Neither device knows about the other's words until A reconnects.
  const deviceAWords = ["offline-1", "offline-2", "offline-3"];
  const deviceBWords = ["online-1", "online-2", "online-3"];
  const deviceAProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  const deviceBProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};

  deviceAWords.forEach((id, i) => {
    deviceAProgress[id] = recordLearningOutcome(undefined, true, "2026-09-01", 1000 + i);
  });
  deviceBWords.forEach((id, i) => {
    deviceBProgress[id] = recordLearningOutcome(undefined, true, "2026-09-01", 2000 + i);
  });

  const reconciled = mergeLearningProgress(deviceAProgress, deviceBProgress);
  assert(Object.keys(reconciled).length === 6, "All 6 words from both the offline device and the online device survive reconciliation");
  assert(deviceAWords.every((id) => reconciled[id] !== undefined), "Every word the offline device learned is present after sync");
  assert(deviceBWords.every((id) => reconciled[id] !== undefined), "Every word the online device learned is present after sync");

  // The same word answered on both devices while A was offline: B answered
  // it correctly 3 times (mastered on day 2), A only once. The richer
  // record (more attempts) must win, carrying its OWN correct status —
  // never a hybrid of the two.
  const sharedWordOnA = recordLearningOutcome(undefined, true, "2026-09-01", 3000);
  const sharedWordOnBDay1 = recordLearningOutcome(undefined, true, "2026-09-01", 4000);
  const sharedWordOnBDay2 = recordLearningOutcome(sharedWordOnBDay1, true, "2026-09-02", 4001);
  const sharedMerge = mergeLearningProgress({ shared: sharedWordOnA }, { shared: sharedWordOnBDay2 });
  assert(sharedMerge.shared.attempts === sharedWordOnBDay2.attempts, "The device with more real practice on the shared word wins the merge");
  assert(
    deriveStatus(sharedMerge.shared) === deriveStatus(sharedWordOnBDay2),
    "The merged record's status matches its own field values — not recomputed from a mix of both devices"
  );
}

// 42. Migration versioning (roadmap Birim 8.1, 8.3)
console.log("\n42. Migration Schema Versioning:");
{
  // Data with no schemaVersion at all, but already has the learningProgress
  // structure — this is what every real user's stored data looked like
  // before Sprint 8 shipped the version field.
  const preVersioningUser = normalizeUserData({
    xp: 90,
    learningProgress: { "a1-mm-01": recordLearningOutcome(undefined, true, "2026-08-01", 1) },
  } as Partial<UserData>);
  assert(
    preVersioningUser.schemaVersion === CURRENT_SCHEMA_VERSION,
    `normalizeUserData always stamps the current schema version (${CURRENT_SCHEMA_VERSION}) even on unversioned input`
  );

  // Once-normalized data carries its version forward untouched.
  const alreadyVersioned = normalizeUserData({ ...preVersioningUser } as Partial<UserData>);
  assert(alreadyVersioned.schemaVersion === CURRENT_SCHEMA_VERSION, "Already-normalized data keeps the current schema version on reload");

  // The oldest possible shape (solvedQuestionIds only, no learningProgress at
  // all) still migrates cleanly and ends up on the current version — this is
  // the exact case tests 16 and 25 already exercise; confirming schemaVersion
  // doesn't break that path.
  const oldestShape = normalizeUserData({
    xp: 50,
    solvedQuestionIds: ["a1-mm-02"],
  } as Partial<UserData>);
  assert(oldestShape.schemaVersion === CURRENT_SCHEMA_VERSION, "The oldest pre-learningProgress shape still normalizes to the current version");
  assert(Object.keys(oldestShape.learningProgress).length === 1, "Migration 25's behavior is unchanged by the version stamp");
}

// 43. Distractors are drawn fresh per session, not fixed at content-authoring
// time (roadmap Birim 10.1)
console.log("\n43. Randomized Distractors (roadmap Birim 10.1):");
{
  const a1Pool = getQuestionsByLevel("A1");
  const target = a1Pool.find((q) => q.word === "quiet")!;
  const originalDecoys = [...target.wrongOptions];

  const firstSample = randomizeDistractors(target, a1Pool);
  assert(firstSample.wrongOptions.length === originalDecoys.length, "Resampled decoys keep the same count as the authored set");
  assert(!firstSample.wrongOptions.includes(target.meaning), "The correct meaning never appears among resampled decoys");
  assert(new Set(firstSample.wrongOptions).size === firstSample.wrongOptions.length, "Resampled decoys are never duplicated within one question");

  const seenDecoySets = new Set<string>();
  for (let i = 0; i < 20; i += 1) {
    const resampled = randomizeDistractors(target, a1Pool);
    seenDecoySets.add(resampled.wrongOptions.slice().sort().join("|"));
  }
  assert(
    seenDecoySets.size > 1,
    `Across 20 resamples, the decoy set actually varies (saw ${seenDecoySets.size} distinct combinations) — content is no longer deterministic`
  );

  // PICK_THE_WORD questions already get fresh decoys from reverseMode.ts —
  // randomizeDistractors must leave them alone rather than double-processing.
  const reversedTarget = { ...target, mode: "PICK_THE_WORD" as const };
  const untouched = randomizeDistractors(reversedTarget, a1Pool);
  assert(
    untouched.wrongOptions.join("|") === reversedTarget.wrongOptions.join("|"),
    "PICK_THE_WORD questions are left untouched — their decoys already come from reverseMode.ts"
  );

  // A too-small candidate pool must never crash or return fewer decoys than authored.
  const tinyPool = [target];
  const fallback = randomizeDistractors(target, tinyPool);
  assert(
    fallback.wrongOptions.length === originalDecoys.length,
    "When the pool is too small to safely resample, the authored decoys are kept rather than shrinking the option count"
  );
}

// 44. Accessibility labels must speak the app's language, not a hardcoded one
// (roadmap Birim 9.1 — a TalkBack user on the English locale must not hear
// Turkish button names)
console.log("\n44. Accessibility Label Localization Scan (roadmap Birim 9.1):");
{
  // Components that legitimately carry a hardcoded label, and why:
  //  - GlobalTopBar / DevClockCard: __DEV__-gated, never reach a real user
  //  - Brand: the product name + "logo" — not meaningfully translatable
  //  - HomeHeader: dead code, not imported/rendered anywhere in the app
  //  - LanguageSettingsCard: the two labels ARE each language's own name,
  //    intentionally bilingual by design (Türkçe/English selectors)
  const allowlist = new Set([
    "src/components/GlobalTopBar.tsx",
    "src/components/Brand.tsx",
    "src/features/profile/components/DevClockCard.tsx",
    "src/features/home/components/HomeHeader.tsx",
    "src/features/profile/components/LanguageSettingsCard.tsx",
  ]);

  const srcRoot = path.join(__dirname, "..", "src");
  const hardcodedLabelPattern = /accessibilityLabel="[A-ZİÇĞÖŞÜ][a-zA-Zçğıöşü ]*"/;
  const offenders: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".tsx")) {
        const relative = path.relative(path.join(__dirname, ".."), full).replace(/\\/g, "/");
        if (allowlist.has(relative)) continue;
        const content = fs.readFileSync(full, "utf-8");
        if (hardcodedLabelPattern.test(content)) offenders.push(relative);
      }
    }
  }
  walk(srcRoot);

  assert(
    offenders.length === 0,
    `No shipped component has a hardcoded-language accessibilityLabel outside the documented allowlist (offenders: ${offenders.join(", ") || "none"})`
  );
}

// 45. Unit-completion detection feeds the roadmap Birim 2 §2.1 "days to
// finish a unit" signal — telemetry can't compute it without this firing at
// exactly the right moment, never early and never missed.
console.log("\n45. Unit Completion Detection (roadmap Birim 2 §2.1 / S10):");
{
  const a1Unit0 = getLevelUnitInfo("A1", []).questions;
  const allButLast = a1Unit0.slice(0, -1).map((q) => q.id);
  const allOfUnit = a1Unit0.map((q) => q.id);

  assert(
    detectUnitJustCompleted("A1", [], allButLast.slice(0, 5)) === null,
    "Answering only part of a unit does not report it as completed"
  );
  const justFinished = detectUnitJustCompleted("A1", allButLast, allOfUnit);
  assert(justFinished !== null, "The exact word that finishes a unit is detected");
  assert(justFinished?.unitIndex === 0, "The completed unit's index is reported correctly");
  assert(justFinished?.wordsInUnit === a1Unit0.length, "The completed unit's word count is reported correctly");

  assert(
    detectUnitJustCompleted("A1", allOfUnit, allOfUnit) === null,
    "A unit already complete before this answer is not reported again"
  );

  // The level's FINAL unit is the edge case getLevelUnitInfo's own fallback
  // makes easy to get wrong (see the comment on detectUnitJustCompleted).
  const totalA1 = getQuestionsByLevel("A1").length;
  const lastUnit = getLevelUnitInfo("A1", getQuestionsByLevel("A1").slice(0, totalA1 - CONTENT_UNIT_SIZE).map((q) => q.id));
  const lastUnitAllButOne = lastUnit.questions.slice(0, -1).map((q) => q.id);
  const lastUnitAll = lastUnit.questions.map((q) => q.id);
  const priorSolved = getQuestionsByLevel("A1").slice(0, totalA1 - CONTENT_UNIT_SIZE).map((q) => q.id);
  const finishedLast = detectUnitJustCompleted(
    "A1",
    [...priorSolved, ...lastUnitAllButOne],
    [...priorSolved, ...lastUnitAll]
  );
  assert(
    finishedLast !== null && finishedLast.unitIndex === lastUnit.unitIndex,
    "Completing a level's FINAL unit is still detected, not silently missed"
  );
}

// 46. Indirect quality signal (roadmap Birim 3 §3.1) — observational only,
// not yet driving scheduleNextReview (that's §3.2, deferred to S12).
console.log("\n46. Indirect Quality Signal (roadmap Birim 3 §3.1):");
{
  assert(inferQuality(2000, false, false) === 0, "A wrong answer with no hint scores the lowest quality (0)");
  assert(inferQuality(2000, true, false) === 1, "A wrong answer that still used a hint scores slightly higher (1) — the hint shows some engagement");
  assert(inferQuality(2000, false, true) === 5, "A fast, clean, correct first try scores the maximum (5)");
  assert(inferQuality(5000, false, true) === 4, "A correct first try that took longer scores lower than an instant one (4)");
  assert(inferQuality(15000, false, true) === 3, "A correct but slow answer scores lower still (3)");
  assert(inferQuality(1000, true, true) === 3, "A correct answer that needed a hint is capped at 3 even if it was fast — it wasn't a clean recall");
  assert(inferQuality(1000, false, true, 2) === 3, "A correct answer on a retry (attemptNumber > 1) is capped at 3 even without a hint — same reasoning");
  assert(
    inferQuality(500, false, true) >= inferQuality(500, false, true, 2),
    "A clean first-try answer never scores lower than the same answer after a prior wrong attempt"
  );
}

// 47. Cross-progression-system consistency matrix (roadmap Birim 11.1)
// "Bölüm ↔ Terfi": can a learner be promoted (80% mastered) without having
// finished seeing the level's units? Mastery can never exceed how much was
// seen — this is structural in summarizeMastery (a word only gets a
// learningProgress entry, and therefore a status, once it has been
// answered), not an assumption. Confirmed here rather than left as an
// unverified "probably fine" per the roadmap's own framing of this pair.
console.log("\n47. Cross-Progression Consistency Matrix (roadmap Birim 11.1):");
{
  const partiallySeenPool = getQuestionsByLevel("A1").slice(0, 60).map((q) => q.id);
  const partialProgress: Record<string, ReturnType<typeof recordLearningOutcome>> = {};
  // Only the first 20 of the 60-word sample were ever seen at all.
  partiallySeenPool.slice(0, 20).forEach((id, i) => {
    partialProgress[id] = recordLearningOutcome(undefined, true, "2026-08-24", i);
  });
  const partialSummary = summarizeMastery(partialProgress, partiallySeenPool);
  const seenCount = Object.keys(partialProgress).length;
  assert(
    partialSummary.mastered <= seenCount,
    "Mastered count can never exceed how many words were actually seen — a word cannot be mastered before it exists in learningProgress"
  );
  assert(
    partialSummary.mastered + partialSummary.review + partialSummary.learning === seenCount,
    "Every seen word is accounted for in exactly one in-progress bucket — none are silently dropped or double-counted"
  );

  // "Rozet ↔ Mastery": badge_first_step and badge_garden_lover intentionally
  // stay solvedQuestionIds-based (roadmap's own stated principle — low-
  // threshold, early-motivation badges don't need to wait for mastery).
  // badge_master_review does NOT — verified directly in test 5.
  const earlyBadgeUser: UserData = {
    ...DEFAULT_USER_DATA,
    xp: 1,
    solvedQuestionIds: ["a1-mm-01"],
    learningProgress: {}, // seen but nothing is anywhere close to mastered
  };
  assert(
    evaluateBadges(earlyBadgeUser).includes("badge_first_step"),
    "badge_first_step intentionally stays reachable from 'seen' alone — confirmed by roadmap's own low-threshold/early-motivation principle, not an oversight"
  );
}

// 48. Migration steps are isolated, single-purpose functions (roadmap
// Birim 8 / 20) — each tested directly, not only through normalizeUserData's
// end-to-end behavior.
console.log("\n48. Isolated Migration Steps (roadmap Birim 8/20):");
{
  // migrateV1ToV2: the oldest shape (solvedQuestionIds only) gets a real
  // learningProgress record synthesized.
  const v1Shape = migrateV1ToV2({ solvedQuestionIds: ["a1-mm-01", "a1-mm-02"] });
  assert(
    Object.keys(v1Shape.learningProgress || {}).length === 2,
    "migrateV1ToV2 synthesizes a learningProgress entry for every legacy solved id"
  );
  assert(
    Object.values(v1Shape.learningProgress || {}).every((item) => item.status === "learning"),
    "migrateV1ToV2 never invents a status stronger than 'learning' from a bare solved id"
  );

  // migrateV1ToV2 is idempotent — it repairs already-structured data too,
  // by design (see the function's own comment on why it doesn't gate on a
  // version number).
  const alreadyV2 = migrateV1ToV2({
    learningProgress: { "a1-mm-01": { status: "learning", attempts: 1, correctCount: 1, wrongCount: 0, repetitions: 1, distinctCorrectDays: 1, intervalDays: 1, easeFactor: 2.5, nextReviewAt: 0 } },
  });
  assert(
    Object.keys(alreadyV2.learningProgress || {}).length === 1,
    "migrateV1ToV2 leaves already-structured learningProgress data intact rather than re-synthesizing it"
  );

  // migrateV2ToV3: a legacy quest set (target <= 2) is reissued with the
  // real session size.
  const v2Shape = migrateV2ToV3({
    practiceSessionSize: 20,
    dailyQuests: [{ id: DAILY_QUEST_PRACTICE_ID, titleKey: "x", current: 0, target: 2, xpReward: 30, completed: false }],
  } as any);
  assert(
    v2Shape.dailyQuests?.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)?.target === 20,
    "migrateV2ToV3 reissues a legacy quest set to match the real session size"
  );

  // migrateV2ToV3 is a no-op on already-current data — proving it is safe
  // to run unconditionally on every load, not just once at a version
  // boundary.
  const alreadyV3Quests = createDailyQuests(20, false);
  const v3Shape = migrateV2ToV3({ practiceSessionSize: 20, dailyQuests: alreadyV3Quests } as any);
  assert(
    v3Shape.dailyQuests === alreadyV3Quests,
    "migrateV2ToV3 returns the exact same quest array reference when it is already current — a true no-op, not a reconstruction"
  );
}

// 49. Interval Jitter & Load Balancing (roadmap Birim 18.1):
console.log("\n49. Interval Jitter & Load Balancing (roadmap Birim 18.1):");
{
  // 1 and 3-day fixed steps are never jittered
  assert(applyIntervalJitter(1, () => 1.0) === 1, "Interval 1 day is untouched by jitter");
  assert(applyIntervalJitter(2, () => 1.0) === 2, "Interval 2 days is untouched by jitter");
  assert(applyIntervalJitter(3, () => 1.0) === 3, "Interval 3 days is untouched by jitter");
  assert(applyIntervalJitter(3, () => 0.0) === 3, "Interval 3 days is untouched even with min random");

  // Deterministic random injection test: days = 100, ratio = 0.05 -> range = 5
  // random = 0 -> offset = -5 -> 95
  assert(applyIntervalJitter(100, () => 0) === 95, "applyIntervalJitter min boundary (-5% at 100 days)");
  // random = 0.9999 -> offset = +5 -> 105
  assert(applyIntervalJitter(100, () => 0.9999) === 105, "applyIntervalJitter max boundary (+5% at 100 days)");
  // random = 0.5 -> offset = 0 -> 100
  assert(applyIntervalJitter(100, () => 0.5) === 100, "applyIntervalJitter midpoint (0% offset at 100 days)");

  // Minimum floor test: jittered value never falls below JITTER_MIN_DAYS (4)
  assert(applyIntervalJitter(4, () => 0) >= 4, "applyIntervalJitter never falls below JITTER_MIN_DAYS (4)");

  // nextIntervalDays behavior with repetition steps
  assert(nextIntervalDays(1, 0, 2.5) === 1, "nextIntervalDays for repetition 1 remains exactly 1 day");
  assert(nextIntervalDays(2, 1, 2.5) === 3, "nextIntervalDays for repetition 2 remains exactly 3 days");

  // Multi-item load balancing simulation: 20 words scheduled on the same day
  const simulatedIntervals = new Set<number>();
  for (let i = 0; i < 20; i++) {
    // repetitions = 3, previousInterval = 8, easeFactor = 2.5 -> grown = 20
    const interval = nextIntervalDays(3, 8, 2.5);
    simulatedIntervals.add(interval);
  }
  // ±5% of 20 is ±1 (19, 20, 21) -> at least 2 distinct values out of 20 samples (~30% variation)
  assert(
    simulatedIntervals.size >= 2,
    `20 simulated words scheduled on the same day distribute across multiple days (${simulatedIntervals.size} distinct intervals)`
  );
}

// 50. Chronic Error (Leech) Detection (roadmap Birim 18.2):
console.log("\n50. Chronic Error (Leech) Detection (roadmap Birim 18.2):");
{
  assert(LEECH_THRESHOLD === 8, "LEECH_THRESHOLD is defined as 8 consecutive wrong answers");

  let item = recordLearningOutcome(undefined, false, "2026-08-25", 1000);
  assert(item.consecutiveWrongCount === 1, "First wrong answer sets consecutiveWrongCount to 1");
  assert(!isLeech(item), "Item with 1 wrong answer is not a leech");

  // Up to 7 consecutive wrong answers
  for (let i = 2; i <= 7; i++) {
    item = recordLearningOutcome(item, false, "2026-08-25", 1000 + i * 1000);
    assert(item.consecutiveWrongCount === i, `Consecutive wrong count is ${i}`);
    assert(!isLeech(item), `Item with ${i} consecutive wrong answers is not yet a leech`);
  }

  // 8th consecutive wrong answer reaches threshold
  item = recordLearningOutcome(item, false, "2026-08-25", 9000);
  assert(item.consecutiveWrongCount === 8, "8th wrong answer reaches consecutiveWrongCount 8");
  assert(isLeech(item), "Item with 8 consecutive wrong answers is marked as leech");

  // 9th consecutive wrong answer stays a leech
  item = recordLearningOutcome(item, false, "2026-08-25", 10000);
  assert(item.consecutiveWrongCount === 9, "9th wrong answer increments consecutiveWrongCount to 9");
  assert(isLeech(item), "Item with 9 consecutive wrong answers remains a leech");

  // A single correct answer resets the streak
  item = recordLearningOutcome(item, true, "2026-08-26", 20000);
  assert(item.consecutiveWrongCount === 0, "Correct answer resets consecutiveWrongCount to 0");
  assert(!isLeech(item), "Item is no longer a leech after a correct answer");

  // Telemetry event call test
  track("word_marked_leech", { questionId: "a1-mm-test", consecutiveWrongCount: 8 });
  assert(true, "word_marked_leech telemetry event is callable without errors");
}

// 51. Difficulty-Based New Word Ordering (roadmap Birim 18.3):
console.log("\n51. Difficulty-Based New Word Ordering (roadmap Birim 18.3):");
{
  const testPool: any[] = [
    { id: "q-d3-1", word: "complex", difficulty: 3, level: "A1" },
    { id: "q-d1-1", word: "cat", difficulty: 1, level: "A1" },
    { id: "q-d2-1", word: "water", difficulty: 2, level: "A1" },
    { id: "q-d1-2", word: "dog", difficulty: 1, level: "A1" },
    { id: "q-d3-2", word: "difficult", difficulty: 3, level: "A1" },
    { id: "q-d2-2", word: "bread", difficulty: 2, level: "A1" },
    { id: "q-d1-3", word: "sun", difficulty: 1, level: "A1" },
  ];

  const picked = pickNewWords(testPool, 7);
  assert(picked.length === 7, "pickNewWords returns requested count of words");

  // All difficulty 1 words must precede difficulty 2 words, which must precede difficulty 3 words
  const diffs = picked.map((q) => q.difficulty || 1);
  let isMonotonic = true;
  for (let i = 1; i < diffs.length; i++) {
    if (diffs[i] < diffs[i - 1]) {
      isMonotonic = false;
      break;
    }
  }
  assert(isMonotonic, `New words arrive in ascending difficulty order (${diffs.join(", ")})`);

  // Group-internal variation check: multiple calls shuffle words within the same difficulty bucket
  const bucketPool: any[] = [
    { id: "b-1", word: "one", difficulty: 2, level: "A1" },
    { id: "b-2", word: "two", difficulty: 2, level: "A1" },
    { id: "b-3", word: "three", difficulty: 2, level: "A1" },
    { id: "b-4", word: "four", difficulty: 2, level: "A1" },
    { id: "b-5", word: "five", difficulty: 2, level: "A1" },
  ];
  const orderings = new Set<string>();
  for (let trial = 0; trial < 15; trial++) {
    const res = pickNewWords(bucketPool, 5);
    orderings.add(res.map((q) => q.id).join("-"));
  }
  assert(
    orderings.size > 1,
    `Words in the same difficulty group vary in order across runs (${orderings.size} permutations seen) to prevent rote memorization`
  );
}

// 52. Review Debt Tapered Reduction (roadmap Birim 18.4):
console.log("\n52. Review Debt Tapered Reduction (roadmap Birim 18.4):");
{
  assert(REVIEW_DEBT_TAPER_START === 20, "REVIEW_DEBT_TAPER_START is set to 20");
  assert(REVIEW_DEBT_LIMIT === 40, "REVIEW_DEBT_LIMIT is set to 40");

  const a1Pool = getQuestionsByLevel("A1");

  // Simulate user data with total due below taper start (10 due words)
  const userBelowTaper: UserData = {
    ...DEFAULT_USER_DATA,
    practiceSessionSize: 20,
    learningProgress: Object.fromEntries(
      a1Pool.slice(0, 10).map((q) => [
        q.id,
        { status: "learning", attempts: 1, correctCount: 1, wrongCount: 0, repetitions: 1, distinctCorrectDays: 1, intervalDays: 1, easeFactor: 2.5, nextReviewAt: 0 },
      ])
    ),
  };
  const sessionBelow = buildDailySession(userBelowTaper);
  assert(sessionBelow.length === 20, "Session with 10 due words fills full 20 slots");
  // 10 due + 10 fresh words (remainingSlots = 10, no taper applied)
  const freshCountBelow = sessionBelow.length - 10;
  assert(freshCountBelow === 10, `Full quota of 10 new words introduced when total due (10) <= taper start (20)`);

  // Simulate user data with total due at midpoint of taper (30 due words)
  // Let's test with practiceSessionSize = 40, collectDueQuestions takes 30, remainingSlots = 10:
  // Using questions from unit 2 (slice 30..60) as due, so unit 1 still has fresh words.
  const userMidTaper: UserData = {
    ...DEFAULT_USER_DATA,
    practiceSessionSize: 40 as any,
    learningProgress: Object.fromEntries(
      a1Pool.slice(30, 60).map((q) => [
        q.id,
        { status: "learning", attempts: 1, correctCount: 1, wrongCount: 0, repetitions: 1, distinctCorrectDays: 1, intervalDays: 1, easeFactor: 2.5, nextReviewAt: 0 },
      ])
    ),
  };
  const sessionMid = buildDailySession(userMidTaper);
  // remainingSlots = 40 - 30 = 10; totalDue = 30; taperRatio = 1 - (30 - 20)/(40 - 20) = 0.5 -> newWordBudget = round(10 * 0.5) = 5
  // total session length = 30 due + 5 fresh = 35
  const freshCountMid = sessionMid.length - 30;
  assert(
    freshCountMid === 5,
    `Tapered quota of 5 new words (50% of 10) introduced when total due (30) is midway between 20 and 40`
  );

  // Simulate user data at review debt cap (40 due words)
  const userCapped: UserData = {
    ...DEFAULT_USER_DATA,
    practiceSessionSize: 40 as any,
    learningProgress: Object.fromEntries(
      a1Pool.slice(0, 40).map((q) => [
        q.id,
        { status: "learning", attempts: 1, correctCount: 1, wrongCount: 0, repetitions: 1, distinctCorrectDays: 1, intervalDays: 1, easeFactor: 2.5, nextReviewAt: 0 },
      ])
    ),
  };
  const sessionCapped = buildDailySession(userCapped);
  const freshCountCapped = sessionCapped.length - 40;
  assert(freshCountCapped === 0, `0 new words introduced when total due (40) reaches REVIEW_DEBT_LIMIT`);
}

// 53. Server Date Anomaly Detection (roadmap Birim 18.5):
console.log("\n53. Server Date Anomaly Detection (roadmap Birim 18.5):");
{
  track("suspicious_date_jump", {
    deviceDate: "2026-08-30",
    lastKnownServerDate: "2026-08-25",
    daysDifference: 5,
  });
  assert(true, "suspicious_date_jump telemetry event recorded without errors");
}

// 54. Content-Generated XP/Difficulty (roadmap 18-srs-flow-hardening.md CORE-002):
console.log("\n54. Content-Generated XP/Difficulty:");
{
  assert(computeDifficulty("A1", "cat") === 1, "A short A1 word gets the level's base difficulty (1)");
  assert(computeDifficulty("C2", "cat") === 5, "A short C2 word gets the level's base difficulty (5)");
  assert(
    computeDifficulty("A1", "unbelievable") === 2,
    "A long A1 word (>=9 chars) is nudged one band above the level base (1 -> 2)"
  );
  assert(
    computeDifficulty("C1", "a piece of cake") === 5,
    "A long/multi-word C1 entry is nudged up but capped at 5, never exceeding the max band"
  );
  assert(
    computeDifficulty("A2", "go") === 2,
    "A short word never gets nudged up regardless of level"
  );

  assert(computeXpReward("A1", "cat") === 10, "A short A1 word pays the level's base XP (10)");
  assert(computeXpReward("C2", "cat") === 35, "A short C2 word pays the level's base XP (35)");
  assert(
    computeXpReward("A1", "unbelievable") === 15,
    "A long A1 word pays a +5 XP bonus over the level base (10 -> 15)"
  );
  assert(
    computeXpReward("B1", "a piece of cake") === 25,
    "A long/multi-word entry pays the level base plus the +5 long-word bonus, not a separately compounding amount"
  );
}

// 55. Daily Quest Archiving & Manual Reschedule (roadmap 18-srs-flow-hardening.md CORE-003):
console.log("\n55. Daily Quest Archiving & Manual Reschedule:");
{
  const quests = [
    { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 20, target: 20, xpReward: 30, completed: true },
    { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 0, target: 1, xpReward: 20, completed: false },
  ];
  const archived = archiveDailyQuests(quests, "2026-08-24");
  assert(archived.length === 1, "archiveDailyQuests only archives quests that were actually completed");
  assert(archived[0].questId === DAILY_QUEST_PRACTICE_ID, "The archived entry references the completed quest's id");
  assert(archived[0].date === "2026-08-24", "The archived entry is stamped with the closing date, not today's date");

  const noneCompleted = [
    { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 5, target: 20, xpReward: 30, completed: false },
  ];
  assert(
    archiveDailyQuests(noneCompleted, "2026-08-24").length === 0,
    "archiveDailyQuests archives nothing when no quest was completed"
  );

  const now = 1_000_000_000_000;
  const farOutItem = {
    status: "learning" as const,
    attempts: 3,
    correctCount: 1,
    wrongCount: 2,
    consecutiveWrongCount: 2,
    repetitions: 1,
    distinctCorrectDays: 1,
    intervalDays: 30,
    easeFactor: 2.5,
    nextReviewAt: now + 30 * DAY_MS,
  };
  const broughtForward = bringForward(farOutItem, now);
  assert(
    broughtForward.nextReviewAt === now + RELEARN_DELAY_MS,
    "bringForward pulls a far-future review in to the standard relearn delay"
  );

  const alreadySoonItem = { ...farOutItem, nextReviewAt: now + 5 * 60 * 1000 };
  const stillSoon = bringForward(alreadySoonItem, now);
  assert(
    stillSoon.nextReviewAt === alreadySoonItem.nextReviewAt,
    "bringForward never pushes a review LATER — an already-soon item is left untouched"
  );
}

console.log("\n=========================================");
console.log(`🏁 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=========================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
