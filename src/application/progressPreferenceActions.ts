import { DAILY_QUEST_PRACTICE_ID } from "../domain/gamification/badges";
import { LevelCode } from "../domain/models/content";
import { ActiveSessionState, UserData } from "../domain/models/user";
import { Locale } from "../domain/models/locale";
import { ApplicationDependencies } from "./ports";
import { UpdateAndPersist } from "./progressActionTypes";

const GOAL_MINUTES_TO_SESSION_SIZE: Record<2 | 5 | 10 | 15, 5 | 10 | 20 | 30> = {
  2: 5,
  5: 10,
  10: 20,
  15: 30,
};

const SESSION_SIZE_TO_GOAL_MINUTES: Record<5 | 10 | 20 | 30, 2 | 5 | 10 | 15> = {
  5: 2,
  10: 5,
  20: 10,
  30: 15,
};

function syncPracticeQuestTarget(quests: UserData["dailyQuests"], target: 5 | 10 | 20 | 30): UserData["dailyQuests"] {
  return (quests || []).map(quest => {
    if (quest.id !== DAILY_QUEST_PRACTICE_ID) return quest;
    const current = Math.min(quest.current, target);
    return {
      ...quest,
      target,
      current,
      completed: current >= target,
    };
  });
}

export function createProgressPreferenceActions(updateAndPersist: UpdateAndPersist, deps: Pick<ApplicationDependencies, "clock" | "notifications">, getUserData: () => UserData) {
  const setLocale = (locale: Locale) => {
    const enabled = getUserData().notificationsEnabled;
    updateAndPersist(previous => ({ ...previous, locale }));
    if (enabled) void deps.notifications.scheduleDailyReminder(locale, false).catch(() => {});
  };

  const setLevel = (level: LevelCode) => updateAndPersist(previous => ({
    ...previous,
    level,
    levelSetAt: deps.clock.wallNow(),
  }));

  const markLevelCelebrated = (level: LevelCode) => {
    updateAndPersist(previous => {
      if (previous.celebratedLevels?.includes(level)) return previous;
      const badgeId = `badge_level_${level.toLowerCase()}_complete`;
      return {
        ...previous,
        celebratedLevels: [...(previous.celebratedLevels || []), level],
        unlockedBadges: previous.unlockedBadges.includes(badgeId)
          ? previous.unlockedBadges
          : [...previous.unlockedBadges, badgeId],
      };
    });
  };

  const markGardenExplainerSeen = () => updateAndPersist(previous =>
    previous.hasSeenGardenExplainer ? previous : { ...previous, hasSeenGardenExplainer: true }
  );

  const setDailyGoalMinutes = (minutes: 2 | 5 | 10 | 15) => updateAndPersist(previous => {
    const practiceSessionSize = GOAL_MINUTES_TO_SESSION_SIZE[minutes] || previous.practiceSessionSize;
    return {
      ...previous,
      dailyGoalMinutes: minutes,
      practiceSessionSize,
      dailyQuests: syncPracticeQuestTarget(previous.dailyQuests, practiceSessionSize),
    };
  });
  const setPracticeSessionSize = (practiceSessionSize: 5 | 10 | 20 | 30) => updateAndPersist(previous => ({
    ...previous,
    practiceSessionSize,
    dailyGoalMinutes: SESSION_SIZE_TO_GOAL_MINUTES[practiceSessionSize] || previous.dailyGoalMinutes,
    dailyQuests: syncPracticeQuestTarget(previous.dailyQuests, practiceSessionSize),
  }));

  const setNotificationsEnabled = async (enabled: boolean) => {
    if (!enabled) {
      await deps.notifications.cancelDailyReminder();
      updateAndPersist(previous => ({ ...previous, notificationsEnabled: false }));
      return;
    }
    try {
      const granted = await deps.notifications.scheduleDailyReminder(getUserData().locale);
      updateAndPersist(previous => ({ ...previous, notificationsEnabled: granted }));
    } catch (error) {
      console.warn("Notification preference could not be updated", error);
      updateAndPersist(previous => ({ ...previous, notificationsEnabled: false }));
    }
  };

  const setActiveSession = (activeSession: ActiveSessionState | null) => updateAndPersist(previous => ({ ...previous, activeSession }));
  const setSoundEnabled = (soundEnabled: boolean) => updateAndPersist(previous => ({ ...previous, soundEnabled }));
  const setReduceMotion = (reduceMotion: boolean) => updateAndPersist(previous => ({ ...previous, reduceMotion }));
  const setAvatarId = (avatarId: string) => updateAndPersist(previous => ({ ...previous, avatarId }));
  const setDisplayName = (displayName: string) => updateAndPersist(previous => ({ ...previous, displayName }));
  const toggleFavoriteWord = (wordId: string) => updateAndPersist((previous: UserData) => {
    const favorite = previous.favoriteWordIds.includes(wordId);
    const favoriteWordIds = favorite
      ? previous.favoriteWordIds.filter(id => id !== wordId)
      : [...previous.favoriteWordIds, wordId];
    return { ...previous, favoriteWordIds };
  });

  return {
    setLocale, setLevel, markLevelCelebrated, markGardenExplainerSeen,
    setDailyGoalMinutes, setPracticeSessionSize, setNotificationsEnabled,
    setActiveSession, setSoundEnabled, setReduceMotion, setAvatarId,
    setDisplayName, toggleFavoriteWord,
  };
}
