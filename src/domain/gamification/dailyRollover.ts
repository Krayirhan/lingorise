import { UserData } from "../../types/user";
import { archiveDailyQuests, createDailyQuests } from "./badges";
import { getDueReviewItems } from "../review/spacedRepetition";

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
  const hasReviewBacklog = getDueReviewItems(previous.learningProgress || {}, Date.now()).length > 0;

  return {
    ...previous,
    dailyQuests: createDailyQuests(previous.practiceSessionSize || 20, hasReviewBacklog),
    dailyReviewXpIds: [],
    questHistory: [...(previous.questHistory || []), ...archived].slice(-QUEST_HISTORY_LIMIT),
  };
}
