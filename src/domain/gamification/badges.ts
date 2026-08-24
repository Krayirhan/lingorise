import { UserData, DailyQuest, QuestHistoryEntry } from "../../types/user";
import { countMasteredWords } from "../learning/mastery";

export const DAILY_QUEST_PRACTICE_ID = "quest_daily_practice";
export const DAILY_QUEST_REVIEW_ID = "quest_daily_review";

/**
 * Builds a fresh set of quests for one day. The practice target mirrors the
 * user's own session length so the number shown on the home screen is the
 * number they actually have to answer. The review quest is only issued when
 * there is something to review, otherwise the day could never be completed.
 */
export function createDailyQuests(
  practiceTarget: number,
  includeReviewQuest: boolean
): DailyQuest[] {
  const quests: DailyQuest[] = [
    {
      id: DAILY_QUEST_PRACTICE_ID,
      titleKey: "questDailyPractice",
      current: 0,
      target: Math.max(1, practiceTarget),
      xpReward: 30,
      completed: false,
    },
  ];

  if (includeReviewQuest) {
    quests.push({
      id: DAILY_QUEST_REVIEW_ID,
      titleKey: "questDailyReview",
      current: 0,
      target: 1,
      xpReward: 20,
      completed: false,
    });
  }

  return quests;
}

/** Completed quests of the closing day, ready to append to quest history. */
export function archiveDailyQuests(
  quests: DailyQuest[],
  closingDate: string
): QuestHistoryEntry[] {
  return quests
    .filter((quest) => quest.completed)
    .map((quest) => ({
      date: closingDate,
      questId: quest.id,
      completedAt: closingDate,
    }));
}

export function evaluateBadges(userData: UserData): string[] {
  const currentBadges = new Set(userData.unlockedBadges || []);

  if (userData.xp > 0 || (userData.solvedQuestionIds && userData.solvedQuestionIds.length > 0)) {
    currentBadges.add("badge_first_step");
  }

  if (userData.xp >= 150) {
    currentBadges.add("badge_quick_grow");
  }

  if (userData.solvedQuestionIds && userData.solvedQuestionIds.length >= 5) {
    currentBadges.add("badge_garden_lover");
  }

  if (userData.streak >= 3) {
    currentBadges.add("badge_streak_3");
  }

  // A high-threshold badge must mean something durable, not just "answered
  // right twice in a row this sitting" — that was `repetitions >= 2`
  // (the domain's own REVIEW_THRESHOLD, one step short of `mastered`), which
  // let a single good session flip this badge without any word actually
  // surviving a second day. Roadmap Birim 11.2 flags this exact pattern as
  // badge inflation; mastered is the bar this badge's name implies.
  if (countMasteredWords(userData.learningProgress || {}) >= 25) {
    currentBadges.add("badge_master_review");
  }

  return Array.from(currentBadges);
}

export function updateDailyQuests(
  quests: DailyQuest[],
  action: { type: "PRACTICE" | "REVIEW"; isCorrect: boolean; amount?: number }
): { updatedQuests: DailyQuest[]; bonusXpEarned: number } {
  // A quest measures learning, not taps: a wrong answer must never advance it.
  if (!action.isCorrect) {
    return { updatedQuests: quests, bonusXpEarned: 0 };
  }

  let bonusXpEarned = 0;
  const amount = action.amount ?? 1;

  const updatedQuests = quests.map((quest) => {
    if (quest.completed) return quest;

    let progressIncrement = 0;
    if (action.type === "PRACTICE" && quest.id === DAILY_QUEST_PRACTICE_ID) {
      progressIncrement = amount;
    } else if (action.type === "REVIEW" && quest.id === DAILY_QUEST_REVIEW_ID) {
      progressIncrement = amount;
    }

    if (progressIncrement === 0) return quest;

    const nextCurrent = Math.min(quest.target, quest.current + progressIncrement);
    const completed = nextCurrent >= quest.target;

    if (completed && !quest.completed) {
      bonusXpEarned += quest.xpReward;
    }

    return {
      ...quest,
      current: nextCurrent,
      completed,
    };
  });

  return { updatedQuests, bonusXpEarned };
}
