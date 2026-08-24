import { useEffect, useRef, useState, useCallback } from "react";
import { ActiveSessionState, UserData } from "../types/user";
import { LevelCode, MeaningMatchQuestion } from "../types/content";
import { Locale } from "../i18n/en";
import { DEFAULT_USER_DATA, loadUserData, saveUserData } from "../services/storage";
import { updateDailyStreak } from "../domain/gamification/streak";
import { applyDailyRollover } from "../domain/gamification/dailyRollover";
import { bringForward } from "../domain/review/spacedRepetition";
import { applyPracticeAnswer, PracticeSessionMode } from "../domain/practice/answer";
import { auth } from "../services/firebase";
import { syncLearningItemProgress, syncUserData, syncUserProgress } from "../services/firestore";
import { cancelDailyReminder, scheduleDailyReminder } from "../services/notificationService";

export function useUserProgress() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [badgeUnlockQueue, setBadgeUnlockQueue] = useState<string[]>([]);
  const knownBadgesRef = useRef<string[]>(DEFAULT_USER_DATA.unlockedBadges);

  // Hydrate on mount and calculate daily streak
  useEffect(() => {
    async function init() {
      const loaded = await loadUserData();
      const streakResult = updateDailyStreak(loaded.lastActiveDate, loaded.streak);
      const rolled = streakResult.isNewDay
        ? applyDailyRollover(loaded, streakResult.todayFormatted)
        : loaded;
      const updated: UserData = {
        ...rolled,
        streak: streakResult.newStreak,
        lastActiveDate: streakResult.todayFormatted,
      };
      setUserData(updated);
      await saveUserData(updated);
      setIsHydrated(true);
    }
    init();
  }, []);

  // Only badges earned during this app session are celebrated. Existing badges
  // restored from storage stay in the Progress collection without replaying.
  useEffect(() => {
    if (!isHydrated) {
      knownBadgesRef.current = userData.unlockedBadges;
      return;
    }
    const newlyUnlocked = userData.unlockedBadges.filter(
      (badgeId) => !knownBadgesRef.current.includes(badgeId)
    );
    if (newlyUnlocked.length) {
      setBadgeUnlockQueue((current) => [...current, ...newlyUnlocked]);
    }
    knownBadgesRef.current = userData.unlockedBadges;
  }, [isHydrated, userData.unlockedBadges]);

  const updateAndPersist = useCallback((updater: (prev: UserData) => UserData) => {
    setUserData((prev) => {
      const next = updater(prev);
      saveUserData(next);
      const user = auth.currentUser;
      if (user) {
        Promise.all([syncUserData(user.uid, next), syncUserProgress(user.uid, next)]).catch((error) => {
          console.warn("LingoRise: Firebase sync failed; local data is safe", error);
        });
      }
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    const loaded = await loadUserData();
    const streakResult = updateDailyStreak(loaded.lastActiveDate, loaded.streak);
    const rolled = streakResult.isNewDay
      ? applyDailyRollover(loaded, streakResult.todayFormatted)
      : loaded;
    const updated: UserData = {
      ...rolled,
      streak: streakResult.newStreak,
      lastActiveDate: streakResult.todayFormatted,
    };
    setUserData(updated);
    await saveUserData(updated);
    const user = auth.currentUser;
    if (user) {
      await Promise.all([syncUserData(user.uid, updated), syncUserProgress(user.uid, updated)]);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    updateAndPersist((prev) => ({ ...prev, onboardingCompleted: true }));
  }, [updateAndPersist]);

  const recordAnswer = useCallback(
    (
      question: MeaningMatchQuestion,
      picked: string,
      xpReward: number,
      sessionMode: PracticeSessionMode
    ) => {
      updateAndPersist((prev) => {
        const next = applyPracticeAnswer(prev, question, picked, xpReward, sessionMode);
        const user = auth.currentUser;
        if (user) {
          const correctAnswer = question.meaning || question.answer;
          void syncLearningItemProgress(user.uid, question, next, picked === correctAnswer);
        }
        return next;
      });
    },
    [updateAndPersist]
  );

  const bookmarkQuestion = useCallback(
    (questionId: string) => {
      updateAndPersist((prev) => {
        const existing = prev.learningProgress?.[questionId];
        if (!existing) return prev;
        return {
          ...prev,
          learningProgress: {
            ...prev.learningProgress,
            [questionId]: bringForward(existing),
          },
        };
      });
    },
    [updateAndPersist]
  );

  const setLocale = useCallback(
    (newLocale: Locale) => {
      updateAndPersist((prev) => ({ ...prev, locale: newLocale }));
    },
    [updateAndPersist]
  );

  const setLevel = useCallback(
    (newLevel: LevelCode) => {
      updateAndPersist((prev) => ({ ...prev, level: newLevel }));
    },
    [updateAndPersist]
  );

  /** Records that a level's completion has been celebrated, so it happens once. */
  const markLevelCelebrated = useCallback(
    (level: LevelCode) => {
      updateAndPersist((prev) =>
        prev.celebratedLevels?.includes(level)
          ? prev
          : { ...prev, celebratedLevels: [...(prev.celebratedLevels || []), level] }
      );
    },
    [updateAndPersist]
  );

  const setDailyGoalMinutes = useCallback(
    (minutes: 2 | 5 | 10 | 15) => {
      updateAndPersist((prev) => ({ ...prev, dailyGoalMinutes: minutes }));
    },
    [updateAndPersist]
  );

  const setPracticeSessionSize = useCallback(
    (practiceSessionSize: 5 | 10 | 20 | 30) => {
      updateAndPersist((prev) => ({ ...prev, practiceSessionSize }));
    },
    [updateAndPersist]
  );

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (!enabled) {
      await cancelDailyReminder();
      updateAndPersist((prev) => ({ ...prev, notificationsEnabled: false }));
      return;
    }
    try {
      const granted = await scheduleDailyReminder();
      updateAndPersist((prev) => ({ ...prev, notificationsEnabled: granted }));
    } catch (error) {
      // A native notification implementation must never break onboarding/profile UI.
      console.warn("Notification preference could not be updated", error);
      updateAndPersist((prev) => ({ ...prev, notificationsEnabled: false }));
    }
  }, [updateAndPersist]);

  const setActiveSession = useCallback((activeSession: ActiveSessionState | null) => {
    updateAndPersist((prev) => ({ ...prev, activeSession }));
  }, [updateAndPersist]);

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      updateAndPersist((prev) => ({ ...prev, soundEnabled: enabled }));
    },
    [updateAndPersist]
  );

  const setReduceMotion = useCallback(
    (reduced: boolean) => {
      updateAndPersist((prev) => ({ ...prev, reduceMotion: reduced }));
    },
    [updateAndPersist]
  );

  const setAvatarId = useCallback(
    (avatarId: string) => {
      updateAndPersist((prev) => ({ ...prev, avatarId }));
    },
    [updateAndPersist]
  );

  const setDisplayName = useCallback(
    (displayName: string) => {
      updateAndPersist((prev) => ({ ...prev, displayName }));
    },
    [updateAndPersist]
  );

  const toggleFavoriteWord = useCallback(
    (wordId: string) => {
      updateAndPersist((prev) => {
        const isFav = prev.favoriteWordIds.includes(wordId);
        const nextFavs = isFav
          ? prev.favoriteWordIds.filter((id) => id !== wordId)
          : [...prev.favoriteWordIds, wordId];
        return { ...prev, favoriteWordIds: nextFavs };
      });
    },
    [updateAndPersist]
  );

  const dismissBadgeUnlock = useCallback(() => {
    setBadgeUnlockQueue((current) => current.slice(1));
  }, []);

  return {
    isHydrated,
    userData,
    refresh,
    completeOnboarding,
    recordAnswer,
    bookmarkQuestion,
    setLocale,
    setLevel,
    markLevelCelebrated,
    setDailyGoalMinutes,
    setPracticeSessionSize,
    setNotificationsEnabled,
    setActiveSession,
    setSoundEnabled,
    setReduceMotion,
    setAvatarId,
    setDisplayName,
    toggleFavoriteWord,
    badgeUnlockQueue,
    dismissBadgeUnlock,
  };
}
