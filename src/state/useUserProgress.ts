import { useEffect, useRef, useState, useCallback } from "react";
import { ActiveSessionState, UserData } from "../types/user";
import { LevelCode, MeaningMatchQuestion } from "../types/content";
import { Locale } from "../i18n/en";
import { DEFAULT_USER_DATA, loadUserData, saveUserData } from "../services/storage";
import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { bringForward, getDueReviewItems } from "../domain/review/spacedRepetition";
import { applyPracticeAnswer, PracticeSessionMode } from "../domain/practice/answer";
import { auth } from "../services/firebase";
import { fetchUserData, syncLearningItemProgress, syncUserData, syncUserProgress } from "../services/firestore";
import { cancelDailyReminder, scheduleDailyReminder } from "../services/notificationService";
import { track } from "../services/telemetry";
import { deriveStatus, isLeech } from "../domain/learning/mastery";
import { calculateGardenProgress } from "../domain/gamification/xp";
import { detectUnitJustCompleted } from "../content/questions";
import { inferQuality, AnswerQualityMeta } from "../domain/review/qualitySignal";
import { daysBetween, detectClockAnomaly } from "../domain/sync/clockAnomaly";

function checkServerDateAnomaly(lastKnownServerDate?: string, todayFormatted?: string) {
  const user = auth.currentUser;
  if (!user) return;
  const { isAnomalous, daysDifference } = detectClockAnomaly(lastKnownServerDate, todayFormatted);
  if (isAnomalous && lastKnownServerDate && todayFormatted && daysDifference !== null) {
    track("suspicious_date_jump", {
      deviceDate: todayFormatted,
      lastKnownServerDate,
      daysDifference,
    });
  }
}

export function useUserProgress() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [badgeUnlockQueue, setBadgeUnlockQueue] = useState<string[]>([]);
  const knownBadgesRef = useRef<string[]>(DEFAULT_USER_DATA.unlockedBadges);
  const [saveFailureNotice, setSaveFailureNotice] = useState<string | null>(null);
  const consecutiveSaveFailuresRef = useRef(0);
  const saveFailureAlertedRef = useRef(false);
  const [cloudSyncFailureNotice, setCloudSyncFailureNotice] = useState<string | null>(null);
  const consecutiveCloudSyncFailuresRef = useRef(0);
  const cloudSyncFailureAlertedRef = useRef(false);

  // A single failed write is often transient (a momentary AsyncStorage
  // hiccup); only surface it once progress has actually failed to persist
  // more than once in a row, so the learner isn't told anything is wrong
  // while continuing to play with data that never made it to disk.
  const noteSaveOutcome = useCallback((succeeded: boolean) => {
    if (succeeded) {
      consecutiveSaveFailuresRef.current = 0;
      saveFailureAlertedRef.current = false;
      return;
    }
    consecutiveSaveFailuresRef.current += 1;
    if (consecutiveSaveFailuresRef.current >= 2 && !saveFailureAlertedRef.current) {
      saveFailureAlertedRef.current = true;
      setSaveFailureNotice("İlerlemen kaydedilemiyor. Lütfen cihazında yeterli depolama alanı olduğundan emin ol.");
    }
  }, []);

  const clearSaveFailureNotice = useCallback(() => setSaveFailureNotice(null), []);

  // Cloud-sync failures were previously console-only (REL-QA-004 /
  // GLOBAL-QA-004) — the learner had no way to know their progress hadn't
  // reached the cloud. Same consecutive-failure gate as local save failures,
  // for the same reason: one transient network blip shouldn't alarm anyone.
  const noteCloudSyncOutcome = useCallback((succeeded: boolean) => {
    if (succeeded) {
      consecutiveCloudSyncFailuresRef.current = 0;
      cloudSyncFailureAlertedRef.current = false;
      return;
    }
    consecutiveCloudSyncFailuresRef.current += 1;
    if (consecutiveCloudSyncFailuresRef.current >= 2 && !cloudSyncFailureAlertedRef.current) {
      cloudSyncFailureAlertedRef.current = true;
      setCloudSyncFailureNotice("İlerlemen buluta yüklenemiyor. İnternet bağlantını kontrol et; yerel ilerlemen güvende.");
    }
  }, []);

  const clearCloudSyncFailureNotice = useCallback(() => setCloudSyncFailureNotice(null), []);

  /** Lets a caller outside this hook's own sync paths (e.g. AppBootstrap's sign-in merge) report a cloud-sync failure through the same user-visible channel. */
  const reportCloudSyncFailure = useCallback(() => {
    noteCloudSyncOutcome(false);
  }, [noteCloudSyncOutcome]);

  // Hydrate on mount and calculate daily streak
  useEffect(() => {
    async function init() {
      const loaded = await loadUserData();
      const { data: updated, isNewDay, todayFormatted } = rolloverToToday(loaded);

      checkServerDateAnomaly(loaded.lastKnownServerDate, todayFormatted);

      track("session_started", {
        daysSinceLastOpen: loaded.lastActiveDate
          ? daysBetween(loaded.lastActiveDate, todayFormatted)
          : null,
      });

      if (isNewDay) {
        track("daily_rollover_applied", {
          streakBefore: loaded.streak,
          streakAfter: updated.streak,
          pendingReviewsAtOpen: getDueReviewItems(loaded.learningProgress || {}).length,
        });
      }

      setUserData(updated);
      // A signed-in cold start also runs AppBootstrap's onAuthStateChanged
      // merge (local + remote, then a single authoritative save), which
      // finishes by calling refresh() to re-sync this hook's state. If this
      // local-only rollover write also persisted here, whichever of the two
      // writes lands second would silently clobber the other — observed as
      // remote-only progress disappearing after a merge (roadmap
      // 18-srs-flow-hardening.md DATA-001). Skipping the write when a user is
      // already signed in leaves the merge as the sole writer for that cold
      // start; the guest path (no signed-in user) is unaffected and persists
      // exactly as before.
      if (!auth.currentUser) {
        await saveUserData(updated);
      }
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
      saveUserData(next).then(noteSaveOutcome);
      const user = auth.currentUser;
      if (user) {
        Promise.all([syncUserData(user.uid, next), syncUserProgress(user.uid, next)])
          .then(() => noteCloudSyncOutcome(true))
          .catch((error) => {
            console.warn("LingoRise: Firebase sync failed; local data is safe", error);
            noteCloudSyncOutcome(false);
          });
      }
      return next;
    });
  }, [noteCloudSyncOutcome]);

  const refresh = useCallback(async () => {
    const loaded = await loadUserData();
    const { data: rolledUpdate, isNewDay, todayFormatted } = rolloverToToday(loaded);

    // The locally cached lastKnownServerDate is only ever written at sign-in
    // (AppBootstrap's onAuthStateChanged flow) or here. A long session between
    // sign-ins would otherwise check clock-manipulation against an
    // increasingly stale reference, so every refresh() re-anchors it against
    // Firestore's actual clock for signed-in users — cheap because refresh()
    // is already a deliberate, infrequent action (pull-to-refresh, sign-in).
    const user = auth.currentUser;
    let lastKnownServerDate = loaded.lastKnownServerDate;
    if (user) {
      const remote = await fetchUserData(user.uid);
      if (remote?.lastKnownServerDate) {
        lastKnownServerDate = remote.lastKnownServerDate;
      }
    }

    checkServerDateAnomaly(lastKnownServerDate, todayFormatted);
    if (isNewDay) {
      track("daily_rollover_applied", {
        streakBefore: loaded.streak,
        streakAfter: rolledUpdate.streak,
        pendingReviewsAtOpen: getDueReviewItems(loaded.learningProgress || {}).length,
      });
    }
    const updated: UserData = { ...rolledUpdate, lastKnownServerDate };
    setUserData(updated);
    await saveUserData(updated);
    if (user) {
      try {
        await Promise.all([syncUserData(user.uid, updated), syncUserProgress(user.uid, updated)]);
        noteCloudSyncOutcome(true);
      } catch (error) {
        console.warn("LingoRise: Firebase sync failed during refresh; local data is safe", error);
        noteCloudSyncOutcome(false);
      }
    }
  }, [noteCloudSyncOutcome]);

  /**
   * Reloads state from local storage only — never syncs it to the cloud.
   * Used after a local-only data reset (DataManagementCard's "Yerel Verileri
   * Sıfırla"): the previous implementation reused `refresh()`, which pushes
   * whatever it loads straight to Firestore via `syncUserData`/`syncUserProgress`
   * — for a signed-in user, that meant a "reset LOCAL data" action was
   * silently overwriting the account's cloud progress with the wiped
   * defaults (DATA-QA-003 / GLOBAL-QA-005). A local-only reset must only
   * ever touch local storage.
   */
  const reloadLocalOnly = useCallback(async () => {
    const loaded = await loadUserData();
    const { data: updated } = rolloverToToday(loaded);
    setUserData(updated);
    await saveUserData(updated);
  }, []);

  const completeOnboarding = useCallback(() => {
    updateAndPersist((prev) => ({ ...prev, onboardingCompleted: true }));
  }, [updateAndPersist]);

  /** Records a passed level-completion exam (domain/learning/levelExam.ts) — idempotent, so it's safe to call more than once for the same level. */
  const markLevelExamPassed = useCallback((level: LevelCode) => {
    updateAndPersist((prev) =>
      prev.passedLevelExams.includes(level)
        ? prev
        : { ...prev, passedLevelExams: [...prev.passedLevelExams, level] }
    );
  }, [updateAndPersist]);

  const recordAnswer = useCallback(
    (
      question: MeaningMatchQuestion,
      picked: string,
      xpReward: number,
      sessionMode: PracticeSessionMode,
      quality?: AnswerQualityMeta
    ) => {
      updateAndPersist((prev) => {
        const next = applyPracticeAnswer(prev, question, picked, xpReward, sessionMode);
        const correctAnswer = question.meaning || question.answer;
        const isCorrect = picked === correctAnswer;

        const wasDue = Boolean(prev.learningProgress?.[question.id]?.attempts);
        const usedHint = xpReward < (question.xp || 10);
        track("question_answered", {
          questionId: question.id,
          isCorrect,
          isFirstEncounter: !prev.rewardedQuestionIds.includes(question.id),
          wasDue,
          usedHint,
          level: question.level,
          // roadmap Birim 3 §3.1 — observational only; not yet consumed by
          // scheduleNextReview (that's §3.2, deferred to S12).
          responseTimeMs: quality?.responseTimeMs ?? null,
          inferredQuality: quality
            ? inferQuality(quality.responseTimeMs, usedHint, isCorrect, quality.attemptNumber)
            : null,
        });

        const completedUnit = detectUnitJustCompleted(
          question.level,
          prev.solvedQuestionIds || [],
          next.solvedQuestionIds || []
        );
        if (completedUnit) {
          track("unit_completed", { level: question.level, ...completedUnit });
        }

        const prevItem = prev.learningProgress?.[question.id];
        const nextItem = next.learningProgress?.[question.id];
        if (nextItem) {
          const fromStatus = prevItem ? deriveStatus(prevItem) : "new";
          const toStatus = deriveStatus(nextItem);
          if (fromStatus !== toStatus) {
            track("word_mastery_changed", { fromStatus, toStatus, questionId: question.id });
          }

          const wasLeech = isLeech(prevItem);
          const nowLeech = isLeech(nextItem);
          if (!wasLeech && nowLeech) {
            track("word_marked_leech", {
              questionId: question.id,
              consecutiveWrongCount: nextItem.consecutiveWrongCount || 0,
            });
          }
        }

        // The garden grows with words genuinely learned (answered correctly
        // at least once), matching the exact metric useHomeViewModel.ts
        // renders — not a repetition-based mastery count, which would no
        // longer track real progress once daily practice never repeats a
        // word (roadmap 18-srs-flow-hardening.md "sınav" redesign).
        const fromStage = calculateGardenProgress((prev.rewardedQuestionIds || []).length).stage;
        const toStage = calculateGardenProgress((next.rewardedQuestionIds || []).length).stage;
        if (fromStage !== toStage) {
          track("garden_stage_changed", {
            fromStage,
            toStage,
            masteredWords: (next.rewardedQuestionIds || []).length,
          });
        }

        for (const quest of next.dailyQuests) {
          const prevQuest = prev.dailyQuests.find((q) => q.id === quest.id);
          if (quest.completed && prevQuest && !prevQuest.completed) {
            track("daily_quest_completed", { questId: quest.id, xpEarned: quest.xpReward });
          }
        }

        const user = auth.currentUser;
        if (user) {
          void syncLearningItemProgress(user.uid, question, next, isCorrect);
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
      // Stamped so a cross-device merge can tell this was a deliberate,
      // recent choice and prefer it over a stale-but-higher remote value
      // (DATA-QA-005) — see levelSetAt's own doc comment in types/user.ts.
      updateAndPersist((prev) => ({ ...prev, level: newLevel, levelSetAt: Date.now() }));
    },
    [updateAndPersist]
  );

  /**
   * Records that a level's completion has been celebrated, so it happens
   * once. Also unlocks a permanent badge for it (roadmap Birim 11.3) — until
   * now a promotion was only a modal that appeared once and vanished; it
   * never left a trace in the badge collection the way every other
   * achievement in the app does.
   */
  const markLevelCelebrated = useCallback(
    (level: LevelCode) => {
      updateAndPersist((prev) => {
        if (prev.celebratedLevels?.includes(level)) return prev;
        const badgeId = `badge_level_${level.toLowerCase()}_complete`;
        return {
          ...prev,
          celebratedLevels: [...(prev.celebratedLevels || []), level],
          unlockedBadges: prev.unlockedBadges.includes(badgeId)
            ? prev.unlockedBadges
            : [...prev.unlockedBadges, badgeId],
        };
      });
    },
    [updateAndPersist]
  );

  /** Marks the garden/level explainer tooltip (roadmap Birim 11.4) as seen, so it shows once and never again. */
  const markGardenExplainerSeen = useCallback(() => {
    updateAndPersist((prev) =>
      prev.hasSeenGardenExplainer ? prev : { ...prev, hasSeenGardenExplainer: true }
    );
  }, [updateAndPersist]);

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
    reloadLocalOnly,
    reportCloudSyncFailure,
    completeOnboarding,
    markLevelExamPassed,
    recordAnswer,
    bookmarkQuestion,
    setLocale,
    setLevel,
    markLevelCelebrated,
    markGardenExplainerSeen,
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
    saveFailureNotice,
    clearSaveFailureNotice,
    cloudSyncFailureNotice,
    clearCloudSyncFailureNotice,
  };
}
