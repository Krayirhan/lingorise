import { DailyQuest, PracticeHistoryEntry, QuestHistoryEntry, UserData } from "../../types/user";
import { LevelCode } from "../../types/content";
import { mergeLearningProgress } from "../learning/mastery";
import { updateDailyStreak } from "../gamification/streak";

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
  | "MERGE_DAILY_QUESTS"
  | "MERGE_QUEST_HISTORY"
  | "MERGE_PRACTICE_HISTORY"
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
  celebratedLevels: "UNION_STRING_ARRAY",
  passedLevelExams: "UNION_STRING_ARRAY",
  practiceHistory: "MERGE_PRACTICE_HISTORY",
  questHistory: "MERGE_QUEST_HISTORY",
  activeSession: "DEVICE_LOCAL",
  lastSyncSuccessAt: "LATEST_TIMESTAMP_NUMBER",
  lastKnownServerDate: "REMOTE_AUTHORITATIVE",
  schemaVersion: "REMOTE_AUTHORITATIVE",
  hasSeenGardenExplainer: "OR_TRUE_BOOLEAN",
  lastCompletedWord: "DEVICE_LOCAL",
};

const LEVEL_ORDER: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function higherLevel(a: LevelCode, b: LevelCode): LevelCode {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

/**
 * `level` is a free content-selection preference, not an achievement
 * (DATA-QA-005) — whichever side set it more recently wins, even if that
 * means moving to a numerically lower level (an intentional "review an
 * earlier level" choice must survive a merge, not be silently overridden by
 * a stale-but-higher value). Only when neither side has ever stamped
 * `levelSetAt` (data from before this field existed) does this fall back to
 * the old higher-level heuristic, which is a safe, non-regressing default
 * for that transitional case.
 */
function pickLevelByRecency(
  localLevel: LevelCode,
  remoteLevel: LevelCode,
  localSetAt: number | undefined,
  remoteSetAt: number | undefined
): LevelCode {
  if (localSetAt !== undefined && remoteSetAt !== undefined) {
    return localSetAt >= remoteSetAt ? localLevel : remoteLevel;
  }
  if (localSetAt !== undefined) return localLevel;
  if (remoteSetAt !== undefined) return remoteLevel;
  return higherLevel(localLevel, remoteLevel);
}

function laterDateString(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}

function unionValues<T>(a: T[] = [], b: T[] = []): T[] {
  return Array.from(new Set([...a, ...b]));
}

/**
 * Returns what a side's `streak` WOULD actually be if that side were opened
 * right now — i.e. its own gap since `lastActiveDate` applied against the
 * real current date, without changing `lastActiveDate` itself. Merging raw
 * `streak` values with `Math.max` is only safe once each side's OWN
 * staleness has been accounted for — otherwise a long-unopened device's
 * frozen-high streak can survive a merge against a correctly-decayed side
 * (DATA-QA-006). The caller (`AppBootstrap`) already rolls the LOCAL side
 * over to today before merging (which also correctly refreshes local's
 * daily-scoped fields via `applyDailyRollover`); this normalizes the
 * REMOTE side too, so the fix holds even when the fetched remote document
 * itself is the stale one — the case a real device pairing can produce that
 * a local-only rollover cannot fix by itself.
 */
function normalizedStreak(streak: number, lastActiveDate: string): number {
  return updateDailyStreak(lastActiveDate, streak).newStreak;
}

/**
 * A quest-id-keyed richer-progress merge, valid ONLY when both sides
 * genuinely represent the same calendar day. `DailyQuest` carries no date of
 * its own — `applyDailyRollover()` regenerates the list from scratch every
 * day under the same fixed ids (`DAILY_QUEST_PRACTICE_ID`/`DAILY_QUEST_REVIEW_ID`).
 * Applying this merge across a day boundary would let yesterday's remote
 * `completed: true` silently mark today's freshly-rolled-over quest complete
 * by id, blocking the learner from ever earning that day's quest XP again.
 * `mergeDailyScopedValue` (below) is what actually decides which side to use.
 */
function mergeDailyQuestsSameDay(local: DailyQuest[] = [], remote: DailyQuest[] = []): DailyQuest[] {
  const byId = new Map<string, DailyQuest>();
  for (const quest of remote) byId.set(quest.id, quest);
  for (const quest of local) {
    const existing = byId.get(quest.id);
    byId.set(
      quest.id,
      existing
        ? { ...existing, current: Math.max(existing.current, quest.current), completed: existing.completed || quest.completed }
        : quest
    );
  }
  return Array.from(byId.values());
}

/**
 * Applies `sameDayMerge` only when `local`/`remote` are dated to the same
 * calendar day (via `localDate`/`remoteDate`, both `lastActiveDate` values).
 * Otherwise, whichever side owns the later (more current) date wins outright
 * — the other side's daily-scoped value belongs to an already-rolled-over
 * day and must not be merged into today's, only replaced by it.
 */
function mergeDailyScopedValue<T>(
  localDate: string,
  remoteDate: string,
  localValue: T,
  remoteValue: T,
  sameDayMerge: (local: T, remote: T) => T
): T {
  if (localDate === remoteDate) {
    return sameDayMerge(localValue, remoteValue);
  }
  return laterDateString(localDate, remoteDate) === localDate ? localValue : remoteValue;
}

/** Unions quest-history entries by (date, questId) identity — an append-only log, never overwritten. */
function mergeQuestHistory(local: QuestHistoryEntry[] = [], remote: QuestHistoryEntry[] = []): QuestHistoryEntry[] {
  const identity = (entry: QuestHistoryEntry) => `${entry.date}::${entry.questId}`;
  const seen = new Map<string, QuestHistoryEntry>();
  for (const entry of [...remote, ...local]) {
    if (!seen.has(identity(entry))) seen.set(identity(entry), entry);
  }
  return Array.from(seen.values());
}

/** Merges per-day practice-history summaries: same-day entries take the richer counts, distinct days are unioned. */
function mergePracticeHistory(local: PracticeHistoryEntry[] = [], remote: PracticeHistoryEntry[] = []): PracticeHistoryEntry[] {
  const byDate = new Map<string, PracticeHistoryEntry>();
  for (const entry of remote) byDate.set(entry.date, entry);
  for (const entry of local) {
    const existing = byDate.get(entry.date);
    byDate.set(
      entry.date,
      existing
        ? {
            date: entry.date,
            answers: Math.max(existing.answers, entry.answers),
            correct: Math.max(existing.correct, entry.correct),
            xp: Math.max(existing.xp, entry.xp),
          }
        : entry
    );
  }
  return Array.from(byDate.values());
}

/**
 * The single production merge function for signed-in cold-start/login
 * synchronization. Both `mergeAndSyncUserData` (production) and the merge
 * regression suite (tests) call this exact function — there is no second,
 * hand-copied implementation anywhere (see VERIFY-QA-001 / GLOBAL-QA-002).
 *
 * Applies every field's strategy from `PROGRESS_FIELD_STRATEGY` above.
 */
export function mergeUserData(local: UserData, remote: UserData): UserData {
  return {
    ...remote, // REMOTE_AUTHORITATIVE baseline for account-setting fields
    xp: Math.max(local.xp || 0, remote.xp || 0),
    streak: Math.max(
      normalizedStreak(local.streak || 0, local.lastActiveDate),
      normalizedStreak(remote.streak || 0, remote.lastActiveDate)
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
    dailyQuests: mergeDailyScopedValue(
      local.lastActiveDate,
      remote.lastActiveDate,
      local.dailyQuests,
      remote.dailyQuests,
      mergeDailyQuestsSameDay
    ),
    questHistory: mergeQuestHistory(local.questHistory, remote.questHistory),
    practiceHistory: mergePracticeHistory(local.practiceHistory, remote.practiceHistory),
    onboardingCompleted: Boolean(local.onboardingCompleted) || Boolean(remote.onboardingCompleted),
    hasSeenGardenExplainer: Boolean(local.hasSeenGardenExplainer) || Boolean(remote.hasSeenGardenExplainer),
    lastSyncSuccessAt: Math.max(local.lastSyncSuccessAt || 0, remote.lastSyncSuccessAt || 0) || undefined,
    activeSession: local.activeSession ?? null,
    lastCompletedWord: local.lastCompletedWord,
  };
}
