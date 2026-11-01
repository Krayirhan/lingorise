import { mergeLearningProgress } from "../learning/mastery";
import { UserData } from "../models/user";
import {
  laterDateString, mergeDailyQuestsSameDay, mergeDailyScopedValue, mergePracticeHistory,
  mergeProductionAttempts, mergeQuestHistory, mergeTopicAssessments, normalizedStreak,
  pickLevelByRecency, unionValues,
} from "./progressMergeFields";
export { mergeTopicAssessments } from "./progressMergeFields";

/**
 * Every merge strategy this app's persisted progress fields actually need.
 * Not every field is progress that must never regress — some are per-device
 * settings, some are derived/transient UI state — so this is not a single
 * blanket rule, per field, matching its real product meaning.
 */
export type FieldStrategy =
  | "MONOTONIC_MAX_NUMBER"
  | "LATER_DATE_STRING"
  | "MOST_RECENTLY_SET_LEVEL"
  | "UNION_STRING_ARRAY"
  | "DAILY_SCOPED_UNION_STRING_ARRAY"
  | "RICHER_LEARNING_PROGRESS"
  | "MERGE_TOPIC_ASSESSMENTS"
  | "MERGE_DAILY_QUESTS"
  | "MERGE_QUEST_HISTORY"
  | "MERGE_PRACTICE_HISTORY"
  | "MERGE_PRODUCTION_ATTEMPTS"
  | "OR_TRUE_BOOLEAN"
  | "LATEST_TIMESTAMP_NUMBER"
  | "DEVICE_LOCAL"
  | "REMOTE_AUTHORITATIVE";

/**
 * The canonical, single declaration of what every persisted UserData field
 * means for cross-device merge. `Record<keyof UserData, FieldStrategy>` means
 * this object fails to type-check the moment a new field is added to
 * `UserData` without a corresponding entry here — that compiler failure is
 * what prevents a repeat of the historical defect (DATA-QA-002 /
 * RELEASE-QA-001): a progress field silently absent from every merge path.
 *
 * A field's category is chosen from its real product meaning, not a default:
 * - MONOTONIC_MAX_NUMBER / LATER_DATE_STRING: an achievement that must never
 *   regress once reached on either device. `streak` additionally normalizes
 *   each side against the real clock before comparing (`normalizedStreak`,
 *   below) — a raw `Math.max` alone let a long-unopened, frozen-stale
 *   streak survive against a correctly-decayed side (DATA-QA-006).
 * - MOST_RECENTLY_SET_LEVEL: `level` is NOT an achievement — per
 *   `LevelSwitcherModal`'s own doc comment, "every level is selectable,
 *   access is never locked," including switching to an EARLIER level to
 *   review it. Treating it as monotonic-max (DATA-QA-005) let a stale,
 *   higher remote value silently override a deliberate recent downgrade.
 *   The correct semantic is latest-write-wins, keyed by `levelSetAt`
 *   (stamped whenever `setLevel()` runs, whether from a manual switch,
 *   onboarding, or automatic promotion) — falling back to the old
 *   higher-value heuristic only when neither side has a timestamp yet
 *   (pre-migration data).
 * - UNION_STRING_ARRAY: a set of facts (ids, unlocked levels) where "once
 *   true on either device" should stay true everywhere.
 * - DAILY_SCOPED_UNION_STRING_ARRAY: a set of facts that resets every
 *   calendar day (see `dailyReviewXpIds`'s own field comment in types/user.ts)
 *   — unioned only when both sides share the same `lastActiveDate`; across a
 *   day boundary, the more current side wins outright instead, or yesterday's
 *   ids would wrongly suppress today's rewards.
 * - RICHER_LEARNING_PROGRESS / MERGE_DAILY_QUESTS / MERGE_QUEST_HISTORY /
 *   MERGE_PRACTICE_HISTORY: structured records where a naive last-write-wins
 *   or blanket union would either lose real progress or double-count it —
 *   each gets its own per-key richer-record merge. MERGE_DAILY_QUESTS is
 *   additionally day-scoped for the same reason as DAILY_SCOPED_UNION_STRING_ARRAY
 *   — `DailyQuest` carries no date of its own, so merging across a day
 *   boundary by quest id would let yesterday's `completed: true` silently
 *   mark today's freshly-rolled-over quest complete, blocking that day's XP.
 * - OR_TRUE_BOOLEAN: a one-way flag (has this ever happened) that should
 *   stay true once true anywhere.
 * - LATEST_TIMESTAMP_NUMBER: an informational "most recent event" marker.
 * - DEVICE_LOCAL: transient, on-device-only UI state that must never be
 *   resurrected from, or overwritten onto, another device.
 * - REMOTE_AUTHORITATIVE: an account-level setting where the most recently
 *   cloud-synced value is treated as canonical — this matches the app's
 *   existing, unflagged behavior for these fields; nothing here changes it.
 */
export const PROGRESS_FIELD_STRATEGY: Record<keyof UserData, FieldStrategy> = {
  onboardingCompleted: "OR_TRUE_BOOLEAN",
  xp: "MONOTONIC_MAX_NUMBER",
  level: "MOST_RECENTLY_SET_LEVEL",
  levelSetAt: "LATEST_TIMESTAMP_NUMBER",
  locale: "REMOTE_AUTHORITATIVE",
  streak: "MONOTONIC_MAX_NUMBER",
  lastActiveDate: "LATER_DATE_STRING",
  dailyGoalMinutes: "REMOTE_AUTHORITATIVE",
  practiceSessionSize: "REMOTE_AUTHORITATIVE",
  notificationsEnabled: "REMOTE_AUTHORITATIVE",
  soundEnabled: "REMOTE_AUTHORITATIVE",
  reduceMotion: "REMOTE_AUTHORITATIVE",
  avatarId: "REMOTE_AUTHORITATIVE",
  displayName: "REMOTE_AUTHORITATIVE",
  favoriteWordIds: "UNION_STRING_ARRAY",
  solvedQuestionIds: "UNION_STRING_ARRAY",
  rewardedQuestionIds: "UNION_STRING_ARRAY",
  unlockedBadges: "UNION_STRING_ARRAY",
  dailyQuests: "MERGE_DAILY_QUESTS",
  dailyReviewXpIds: "DAILY_SCOPED_UNION_STRING_ARRAY",
  learningProgress: "RICHER_LEARNING_PROGRESS",
  topicAssessments: "MERGE_TOPIC_ASSESSMENTS",
  celebratedLevels: "UNION_STRING_ARRAY",
  passedLevelExams: "UNION_STRING_ARRAY",
  practiceHistory: "MERGE_PRACTICE_HISTORY",
  productionAttempts: "MERGE_PRODUCTION_ATTEMPTS",
  questHistory: "MERGE_QUEST_HISTORY",
  activeSession: "DEVICE_LOCAL",
  lastSyncSuccessAt: "LATEST_TIMESTAMP_NUMBER",
  lastKnownServerDate: "REMOTE_AUTHORITATIVE",
  schemaVersion: "REMOTE_AUTHORITATIVE",
  hasSeenGardenExplainer: "OR_TRUE_BOOLEAN",
  lastCompletedWord: "DEVICE_LOCAL",
};

/**
 * The single production merge function for signed-in cold-start/login
 * synchronization. Both `mergeAndSyncUserData` (production) and the merge
 * regression suite (tests) call this exact function — there is no second,
 * hand-copied implementation anywhere (see VERIFY-QA-001 / GLOBAL-QA-002).
 *
 * Applies every field's strategy from `PROGRESS_FIELD_STRATEGY` above.
 */
export function mergeUserData(local: UserData, remote: UserData, today: Date = new Date()): UserData {
  return {
    ...remote, // REMOTE_AUTHORITATIVE baseline for account-setting fields
    xp: Math.max(local.xp || 0, remote.xp || 0),
    streak: Math.max(
      normalizedStreak(local.streak || 0, local.lastActiveDate, today),
      normalizedStreak(remote.streak || 0, remote.lastActiveDate, today)
    ),
    lastActiveDate: laterDateString(local.lastActiveDate, remote.lastActiveDate),
    level: pickLevelByRecency(local.level, remote.level, local.levelSetAt, remote.levelSetAt),
    levelSetAt: Math.max(local.levelSetAt || 0, remote.levelSetAt || 0) || undefined,
    solvedQuestionIds: unionValues(local.solvedQuestionIds, remote.solvedQuestionIds),
    rewardedQuestionIds: unionValues(local.rewardedQuestionIds, remote.rewardedQuestionIds),
    unlockedBadges: unionValues(local.unlockedBadges, remote.unlockedBadges),
    favoriteWordIds: unionValues(local.favoriteWordIds, remote.favoriteWordIds),
    dailyReviewXpIds: mergeDailyScopedValue(
      local.lastActiveDate,
      remote.lastActiveDate,
      local.dailyReviewXpIds,
      remote.dailyReviewXpIds,
      unionValues
    ),
    celebratedLevels: unionValues(local.celebratedLevels, remote.celebratedLevels),
    passedLevelExams: unionValues(local.passedLevelExams, remote.passedLevelExams),
    learningProgress: mergeLearningProgress(local.learningProgress || {}, remote.learningProgress || {}),
    topicAssessments: mergeTopicAssessments(local.topicAssessments || {}, remote.topicAssessments || {}),
    dailyQuests: mergeDailyScopedValue(
      local.lastActiveDate,
      remote.lastActiveDate,
      local.dailyQuests,
      remote.dailyQuests,
      mergeDailyQuestsSameDay
    ),
    questHistory: mergeQuestHistory(local.questHistory, remote.questHistory),
    practiceHistory: mergePracticeHistory(local.practiceHistory, remote.practiceHistory),
    productionAttempts: mergeProductionAttempts(local.productionAttempts, remote.productionAttempts),
    onboardingCompleted: Boolean(local.onboardingCompleted) || Boolean(remote.onboardingCompleted),
    hasSeenGardenExplainer: Boolean(local.hasSeenGardenExplainer) || Boolean(remote.hasSeenGardenExplainer),
    lastSyncSuccessAt: Math.max(local.lastSyncSuccessAt || 0, remote.lastSyncSuccessAt || 0) || undefined,
    activeSession: local.activeSession ?? null,
    lastCompletedWord: local.lastCompletedWord,
  };
}
