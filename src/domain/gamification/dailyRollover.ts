import { UserData } from "../../types/user";
import { archiveDailyQuests, createDailyQuests } from "./badges";
import { getDueReviewItems } from "../review/spacedRepetition";
import { now } from "../../utils/clock";
import { updateDailyStreak } from "./streak";

/** Keeps quest history bounded while still covering several months of days. */
const QUEST_HISTORY_LIMIT = 120;

/**
 * Turns the page on a new day: files the closing day's completed quests into
 * history, issues fresh quests sized to the user's own session length, and
 * clears the per-day review XP guard.
 *
 * Without this the quest list stays permanently completed after day one and
 * the whole daily loop — home screen included — freezes.
 */
export function applyDailyRollover(previous: UserData, todayFormatted: string): UserData {
  const closingDate = previous.lastActiveDate || todayFormatted;
  const archived = archiveDailyQuests(previous.dailyQuests || [], closingDate);
  // Only issue a review quest when the learner will actually have something
  // due today; an impossible quest would keep the day from ever completing.
  const hasReviewBacklog = getDueReviewItems(previous.learningProgress || {}, now()).length > 0;

  return {
    ...previous,
    dailyQuests: createDailyQuests(previous.practiceSessionSize || 20, hasReviewBacklog),
    dailyReviewXpIds: [],
    questHistory: [...(previous.questHistory || []), ...archived].slice(-QUEST_HISTORY_LIMIT),
  };
}

export interface RolloverResult {
  data: UserData;
  isNewDay: boolean;
  todayFormatted: string;
}

/**
 * Recomputes `streak`/`lastActiveDate` against the device's actual current
 * date and applies `applyDailyRollover` if a day genuinely passed — the one
 * normalization step that must run on any `UserData` BEFORE it can
 * participate in a cross-device merge (DATA-QA-006). Without this, a
 * long-unopened device's frozen-stale `streak` can be merged (via
 * `MONOTONIC_MAX_NUMBER`) against a correctly-decayed remote value, and the
 * merge's own `lastActiveDate` update then masks the gap from ever being
 * detected afterwards — the stale streak is resurrected and persists.
 *
 * Used by every entry point that reads persisted `UserData` before it can
 * influence canonical state: `useUserProgress`'s `init()`/`refresh()`, and
 * `AppBootstrap`'s sign-in merge.
 */
export function rolloverToToday(data: UserData): RolloverResult {
  const streakResult = updateDailyStreak(data.lastActiveDate, data.streak);
  const rolled = streakResult.isNewDay ? applyDailyRollover(data, streakResult.todayFormatted) : data;
  return {
    data: {
      ...rolled,
      streak: streakResult.newStreak,
      lastActiveDate: streakResult.todayFormatted,
    },
    isNewDay: streakResult.isNewDay,
    todayFormatted: streakResult.todayFormatted,
  };
}
