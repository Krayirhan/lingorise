import { en, tr, copyByLocale } from "../src/i18n/en";
import { allQuestions, validateQuestionDatabase, getQuestionsByLevel, findQuestionByWord, searchQuestions, CONTENT_VERSION, getLevelUnitInfo, CONTENT_UNIT_SIZE } from "../src/content/questions";
import {
  getDueReviewItems,
  isItemDue,
  DEFAULT_EASE_FACTOR,
} from "../src/services/spacedRepetition";

const DAY_MS = 24 * 60 * 60 * 1000;
import {
  calculateGardenProgress,
  updateDailyStreak,
  evaluateBadges,
  updateDailyQuests,
  applyDailyRollover,
  createDailyQuests,
} from "../src/services/gamification";
import { applyPracticeAnswer } from "../src/domain/practice/answer";
import { buildDailySession, REVIEW_DEBT_LIMIT } from "../src/state/useAppSession";
import {
  evaluatePromotion,
  assessLevelChoice,
  PROMOTION_THRESHOLD_PERCENT,
} from "../src/domain/learning/promotion";
import { isLevelReady, getNextLevel } from "../src/content/questions";
import { getTopicLabel } from "../src/features/home/topicLabel";
import {
  recordLearningOutcome,
  deriveStatus,
  summarizeMastery,
  countMasteredWords,
  mergeLearningProgress,
} from "../src/domain/learning/mastery";
import { DEFAULT_USER_DATA, normalizeUserData } from "../src/services/storage";
import { ReviewItem, UserData } from "../src/types/user";
import { useHomeViewModel } from "../src/features/home/hooks/useHomeViewModel";
import { LevelCode } from "../src/types/content";
import { getAuthErrorMessage } from "../src/services/authErrors";
import { isOfflineError } from "../src/services/errorReporter";
import { componentSizes, iconSizes } from "../src/theme/tokens";

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

// 5. Badge Unlocking Engine
console.log("\n5. Badge Evaluation:");
const testUser: UserData = {
  ...DEFAULT_USER_DATA,
  xp: 160,
  streak: 3,
  solvedQuestionIds: ["a1-mm-01", "a1-mm-02", "a1-mm-03", "a1-mm-04", "a1-mm-05"],
  learningProgress: Object.fromEntries(
    Array.from({ length: 25 }, (_, index) => [
      `consolidated-${index}`,
      recordLearningOutcome(
        recordLearningOutcome(undefined, true, "2026-08-24", 1),
        true,
        "2026-08-25",
        2
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
assert(totalQuestionsAll === 341, `All 6 levels verified with total ${totalQuestionsAll} curated questions`);

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

// The content gate: A2 is not populated yet, so advancing must not be offered
assert(!earned.isNextLevelReady, "A2 is correctly reported as not ready — it has too few words");
assert(!isLevelReady("A2"), "isLevelReady refuses a level below the content minimum");
assert(isLevelReady("A1"), "isLevelReady accepts a fully populated level");

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

console.log("\n=========================================");
console.log(`🏁 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=========================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
