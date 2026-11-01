import { detectClockAnomaly } from "../domain/sync/clockAnomaly";
import { MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
import { PracticeSessionMode } from "../domain/practice/answer";
import { AnswerQualityMeta } from "../domain/review/qualitySignal";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { createAnswerTransition } from "./answerTransition";
import { QuestionCatalogue } from "./catalogue";
import { ApplicationDependencies } from "./ports";
import { createProgressLearningActions } from "./progressLearningActions";
import { createProgressPreferenceActions } from "./progressPreferenceActions";
import { createProgressHydration } from "./progressHydration";
import { createConsecutiveFailureReporter } from "./consecutiveFailureReporter";

export function createProgressController(deps: ApplicationDependencies, catalogue: QuestionCatalogue) {
  const loadUserData = deps.local.load;
  const saveUserData = deps.local.save;
  const track = deps.telemetry.track;
  const syncUserData = deps.remote.saveProfile;
  const syncUserProgress = deps.remote.saveProgress;
  const syncLearningItemProgress = deps.remote.saveLearningItem;
  async function fetchUserData(uid: string) {
    const result = await deps.remote.fetch(uid);
    return result.status === "found" ? result.data : null;
  }
  const listeners = new Set<() => void>();
  function emit() { snapshot = buildSnapshot(); listeners.forEach(listener => listener()); }
  function collectBadges() {
    if (isHydrated) {
      const newlyUnlocked = userData.unlockedBadges.filter(id => !knownBadges.includes(id));
      if (newlyUnlocked.length) badgeUnlockQueue = [...badgeUnlockQueue, ...newlyUnlocked];
    }
    knownBadges = userData.unlockedBadges;
  }
  function checkServerDateAnomaly(lastKnownServerDate?: string, todayFormatted?: string) {
    const user = deps.account.current();
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


  let isHydrated = false;
  function setIsHydrated(value: boolean | ((previous: boolean) => boolean)) {
    isHydrated = typeof value === 'function' ? value(isHydrated) : value;

    emit();
  }
  let userData: UserData = DEFAULT_USER_DATA;
  function setUserData(value: UserData | ((previous: UserData) => UserData)) {
    userData = typeof value === 'function' ? value(userData) : value;
    collectBadges();
    emit();
  }
  let badgeUnlockQueue: string[] = [];
  function setBadgeUnlockQueue(value: string[] | ((previous: string[]) => string[])) {
    badgeUnlockQueue = typeof value === 'function' ? value(badgeUnlockQueue) : value;

    emit();
  }
  let knownBadges = DEFAULT_USER_DATA.unlockedBadges;
  let saveFailureNotice: string | null = null;
  function setSaveFailureNotice(value: string | null | ((previous: string | null) => string | null)) {
    saveFailureNotice = typeof value === 'function' ? value(saveFailureNotice) : value;

    emit();
  }
  let cloudSyncFailureNotice: string | null = null;
  function setCloudSyncFailureNotice(value: string | null | ((previous: string | null) => string | null)) {
    cloudSyncFailureNotice = typeof value === 'function' ? value(cloudSyncFailureNotice) : value;

    emit();
  }

  // A single failed write is often transient (a momentary AsyncStorage
  // hiccup); only surface it once progress has actually failed to persist
  // more than once in a row, so the learner isn't told anything is wrong
  // while continuing to play with data that never made it to disk.
  const noteSaveOutcome = createConsecutiveFailureReporter({
    eventName: "local_save_failed",
    notice: "İlerlemen kaydedilemiyor. Lütfen cihazında yeterli depolama alanı olduğundan emin ol.",
    track,
    reportNotice: setSaveFailureNotice,
  });

  const clearSaveFailureNotice = () => setSaveFailureNotice(null);

  // Cloud-sync failures were previously console-only (REL-QA-004 /
  // GLOBAL-QA-004) — the learner had no way to know their progress hadn't
  // reached the cloud. Same consecutive-failure gate as local save failures,
  // for the same reason: one transient network blip shouldn't alarm anyone.
  const noteCloudSyncOutcome = createConsecutiveFailureReporter({
    eventName: "cloud_sync_failed",
    notice: "İlerlemen buluta yüklenemiyor. İnternet bağlantını kontrol et; yerel ilerlemen güvende.",
    track,
    reportNotice: setCloudSyncFailureNotice,
  });

  const clearCloudSyncFailureNotice = () => setCloudSyncFailureNotice(null);

  // Once managed profiles are enabled, only the active profile may accept
  // writes. Auth can change before its listener runs, so identity is checked
  // against the active profile at every write as well as during transitions.
  let managedProfiles = false;
  let activeProfile: string | null = null;
  let profileTransition = false;
  let pendingWrites: Promise<void> = Promise.resolve();
  let queuedWriteError: unknown = null;
  const canWriteProfile = () => !profileTransition && (!managedProfiles ||
    (activeProfile === "guest" ? !deps.account.current() : activeProfile === `account:${deps.account.current()?.uid}`));
  const enqueueWrite = (write: () => Promise<void>) => {
    pendingWrites = pendingWrites.then(async () => {
      if (queuedWriteError) return;
      await write();
    }).catch(error => {
      queuedWriteError = error;
      noteSaveOutcome(false);
      setSaveFailureNotice("İlerlemen henüz kaydedilemedi. Bağlantını ve cihaz alanını kontrol edip tekrar dene.");
    });
  };
  async function beginProfileTransition() {
    managedProfiles = true;
    profileTransition = true;
    emit();
    await pendingWrites;
    await deps.local.flushWritingAttempts?.();
    if (queuedWriteError) {
      // Save the newest in-memory snapshot, including changes queued after the
      // failed write. Never report a completed transition while it is unsaved.
      const owner = activeProfile;
      if (!owner || !deps.local.saveProfile) throw queuedWriteError;
      await deps.local.saveProfile(owner, userData);
      if (owner.startsWith("account:")) {
        const uid = owner.slice("account:".length);
        if (deps.account.current()?.uid !== uid) throw new Error("Cannot sync a previous account while another account is active");
        await Promise.all([syncUserData(uid, userData), syncUserProgress(uid, userData)]);
      }
      queuedWriteError = null;
      clearSaveFailureNotice();
    }
  }
  function activateProfile(profile: string, data: UserData) {
    const current = rolloverToToday(data, deps.clock.nowDate()).data;
    activeProfile = profile;
    userData = current;
    knownBadges = current.unlockedBadges;
    badgeUnlockQueue = [];
    profileTransition = false;
    isHydrated = true;
    emit();
  }
  const getManagedProfile = () => managedProfiles ? activeProfile : null;
  const getWritableProfile = () => managedProfiles && canWriteProfile() ? activeProfile : null;
  async function clearManagedProfile(): Promise<{ success: boolean; data: UserData }> {
    const owner = activeProfile;
    const original = userData;
    if (!managedProfiles || !owner || !canWriteProfile() || !deps.local.saveProfile) return { success: false, data: original };
    try {
      await beginProfileTransition();
      let replacement = DEFAULT_USER_DATA;
      if (owner.startsWith("account:")) {
        const uid = owner.slice("account:".length);
        if (deps.account.current()?.uid !== uid) throw new Error("Account changed");
        const remote = await deps.remote.fetch(uid);
        if (remote.status === "failed") throw remote.error;
        if (remote.status === "found") replacement = { ...remote.data, activeSession: null };
        if (deps.account.current()?.uid !== uid) throw new Error("Account changed");
      }
      await deps.local.clearWritingAttempts?.(owner);
      await deps.local.saveProfile(owner, replacement);
      if ((owner === "guest" && deps.account.current()) || (owner.startsWith("account:") && owner !== `account:${deps.account.current()?.uid}`)) throw new Error("Account changed");
      activateProfile(owner, replacement);
      return { success: true, data: replacement };
    } catch {
      if ((owner === "guest" && !deps.account.current()) || owner === `account:${deps.account.current()?.uid}`) activateProfile(owner, original);
      return { success: false, data: original };
    }
  }

  /** Lets a caller outside the controller sync paths (e.g. AppBootstrap's sign-in merge) report a cloud-sync failure through the same user-visible channel. */
  const reportCloudSyncFailure = () => {
    noteCloudSyncOutcome(false);
  };

  const updateAndPersist = (updater: (previous: UserData) => UserData) => {
    if (!canWriteProfile()) return;
    const next = updater(userData);
    if (managedProfiles && (!activeProfile || !deps.local.saveProfile)) {
      throw new Error("Managed profile storage is unavailable");
    }
    if (managedProfiles && activeProfile && deps.local.saveProfile) {
      const owner = activeProfile;
      const uid = owner.startsWith("account:") ? owner.slice("account:".length) : null;
      enqueueWrite(async () => {
        await deps.local.saveProfile!(owner, next);
        noteSaveOutcome(true);
        if (uid) {
          await Promise.all([syncUserData(uid, next), syncUserProgress(uid, next)]);
          noteCloudSyncOutcome(true);
        }
      });
      setUserData(next);
      return;
    }
    saveUserData(next).then(noteSaveOutcome);
    const user = deps.account.current();
    if (user) {
      Promise.all([syncUserData(user.uid, next), syncUserProgress(user.uid, next)])
        .then(() => noteCloudSyncOutcome(true))
        .catch(error => {
          console.warn("Lingterra: Firebase sync failed; local data is safe", error);
          noteCloudSyncOutcome(false);
        });
    }
    setUserData(next);
  };
  async function replaceManagedProfile(data: UserData): Promise<boolean> {
    if (!managedProfiles || !canWriteProfile()) return false;
    updateAndPersist(() => data);
    await pendingWrites;
    return queuedWriteError === null;
  }

  const { initialize, refresh, reloadLocalOnly } = createProgressHydration(deps, {
    loadUserData, saveUserData, fetchUserData, setUserData, setIsHydrated,
    checkServerDateAnomaly, noteCloudSyncOutcome,
  });
  const refreshActiveProfile = async () => {
    if (!managedProfiles) return refresh();
    if (!canWriteProfile() || !activeProfile || !deps.local.loadProfile) return;
    await pendingWrites;
    if (queuedWriteError) throw queuedWriteError;
    const owner = activeProfile;
    const data = await deps.local.loadProfile(owner);
    if (!canWriteProfile() || activeProfile !== owner) return;
    const rolled = rolloverToToday(data ?? DEFAULT_USER_DATA, deps.clock.nowDate()).data;
    activateProfile(owner, rolled);
  };
  const reloadActiveProfile = async () => {
    if (!managedProfiles) return reloadLocalOnly();
    return refreshActiveProfile();
  };

  const answerTransition = createAnswerTransition(catalogue, deps.clock, deps.random);
  const recordAnswer = (question: MeaningMatchQuestion, picked: string, xpReward: number, sessionMode: PracticeSessionMode, quality?: AnswerQualityMeta) => {
    if (!canWriteProfile()) return;
    const transition = answerTransition(userData, question, picked, xpReward, sessionMode, quality);
    transition.events.forEach(event => track(event.name, event.params));
    const user = deps.account.current();
    if (user && !managedProfiles) void syncLearningItemProgress(user.uid, question, transition.data, transition.isCorrect);
    updateAndPersist(() => transition.data);
    if (user && managedProfiles) enqueueWrite(() => syncLearningItemProgress(user.uid, question, transition.data, transition.isCorrect));
  };

  const dismissBadgeUnlock = () => {
    setBadgeUnlockQueue((current) => current.slice(1));
  };

  const learningActions = createProgressLearningActions(updateAndPersist, deps);
  const preferenceActions = createProgressPreferenceActions(updateAndPersist, deps, () => userData);
  const {
    recordProductionResponse,
    completeOnboarding,
    markLevelExamPassed,
    recordTopicAssessment,
    recordProductionAttempt,
    bookmarkQuestion,
  } = learningActions;
  const {
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
  } = preferenceActions;

  function buildSnapshot() {
    return {
      isHydrated,
      profileTransition,
      userData,
      refresh: refreshActiveProfile,
      reloadLocalOnly: reloadActiveProfile,
      reportCloudSyncFailure,
      completeOnboarding,
      markLevelExamPassed,
      recordTopicAssessment,
      recordProductionAttempt,
      recordProductionResponse,
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

  let hydration: Promise<void> | null = null;
  let snapshot = buildSnapshot();
  return {
    hydrate() {
      hydration ||= initialize();
      return hydration;
    },
    beginProfileTransition,
    activateProfile,
    getManagedProfile,
    getWritableProfile,
    clearManagedProfile,
    replaceManagedProfile,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
export type ProgressController = ReturnType<typeof createProgressController>;

