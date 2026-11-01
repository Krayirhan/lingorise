import { detectClockAnomaly } from "../domain/sync/clockAnomaly";
import { MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
import { PracticeSessionMode } from "../domain/practice/answer";
import { AnswerQualityMeta } from "../domain/review/qualitySignal";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { createAnswerTransition } from "./answerTransition";
import { QuestionCatalogue } from "./catalogue";
import { ApplicationDependencies } from "./ports";
import { createProgressLearningActions } from "./progressLearningActions";
import { createProgressPreferenceActions } from "./progressPreferenceActions";
import { createProgressHydration } from "./progressHydration";
import { createProgressNotices } from "./progressNotices";
import { createProfileGate } from "./progressProfiles";
import { createProgressPersistence } from "./progressPersistence";

/** Records a suspicious jump between the device date and the last server date (signed-in users only). */
function reportClockAnomaly(deps: ApplicationDependencies, lastKnownServerDate?: string, todayFormatted?: string) {
  if (!deps.account.current()) return;
  const { isAnomalous, daysDifference } = detectClockAnomaly(lastKnownServerDate, todayFormatted);
  if (isAnomalous && lastKnownServerDate && todayFormatted && daysDifference !== null) {
    deps.telemetry.track("suspicious_date_jump", { deviceDate: todayFormatted, lastKnownServerDate, daysDifference });
  }
}

async function fetchRemoteUserData(deps: ApplicationDependencies, uid: string) {
  const result = await deps.remote.fetch(uid);
  return result.status === "found" ? result.data : null;
}

export function createProgressController(deps: ApplicationDependencies, catalogue: QuestionCatalogue) {
  const loadUserData = deps.local.load;
  const saveUserData = deps.local.save;
  const track = deps.telemetry.track;
  const syncLearningItemProgress = deps.remote.saveLearningItem;
  const listeners = new Set<() => void>();
  function emit() { snapshot = buildSnapshot(); listeners.forEach(listener => listener()); }
  function collectBadges() {
    if (isHydrated) {
      const newlyUnlocked = userData.unlockedBadges.filter(id => !knownBadges.includes(id));
      if (newlyUnlocked.length) badgeUnlockQueue = [...badgeUnlockQueue, ...newlyUnlocked];
    }
    knownBadges = userData.unlockedBadges;
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
  let knownBadges = DEFAULT_USER_DATA.unlockedBadges;
  const notices = createProgressNotices(track, emit);

  const profiles = createProfileGate(deps, {
    getUserData: () => userData,
    load(data) {
      userData = data;
      knownBadges = data.unlockedBadges;
      badgeUnlockQueue = [];
      isHydrated = true;
      emit();
    },
    emit,
    notices,
  });
  const canWriteProfile = profiles.canWrite;

  /** Lets a caller outside the controller sync paths (e.g. AppBootstrap's sign-in merge) report a cloud-sync failure through the same user-visible channel. */
  const reportCloudSyncFailure = () => notices.noteCloudSyncOutcome(false);

  const updateAndPersist = createProgressPersistence(deps, profiles, notices, { get: () => userData, set: setUserData });
  async function replaceManagedProfile(data: UserData): Promise<boolean> {
    if (!profiles.isManaged() || !canWriteProfile()) return false;
    updateAndPersist(() => data);
    return profiles.settle();
  }

  const { initialize, refresh, reloadLocalOnly } = createProgressHydration(deps, {
    loadUserData, saveUserData, setUserData, setIsHydrated,
    fetchUserData: (uid: string) => fetchRemoteUserData(deps, uid),
    checkServerDateAnomaly: (lastKnown?: string, today?: string) => reportClockAnomaly(deps, lastKnown, today),
    noteCloudSyncOutcome: notices.noteCloudSyncOutcome,
  });
  const refreshActiveProfile = () => profiles.refresh(refresh);
  const reloadActiveProfile = async () => {
    if (!profiles.isManaged()) return reloadLocalOnly();
    return refreshActiveProfile();
  };

  const answerTransition = createAnswerTransition(catalogue, deps.clock, deps.random);
  const recordAnswer = (question: MeaningMatchQuestion, picked: string, xpReward: number, sessionMode: PracticeSessionMode, quality?: AnswerQualityMeta) => {
    if (!canWriteProfile()) return;
    const transition = answerTransition(userData, question, picked, xpReward, sessionMode, quality);
    transition.events.forEach(event => track(event.name, event.params));
    const user = deps.account.current();
    if (user && !profiles.isManaged()) void syncLearningItemProgress(user.uid, question, transition.data, transition.isCorrect);
    updateAndPersist(() => transition.data);
    if (user && profiles.isManaged()) profiles.enqueueWrite(() => syncLearningItemProgress(user.uid, question, transition.data, transition.isCorrect));
  };

  const dismissBadgeUnlock = () => { badgeUnlockQueue = badgeUnlockQueue.slice(1); emit(); };

  const learningActions = createProgressLearningActions(updateAndPersist, deps);
  const preferenceActions = createProgressPreferenceActions(updateAndPersist, deps, () => userData);

  function buildSnapshot() {
    return {
      isHydrated,
      profileTransition: profiles.isInTransition(),
      userData,
      refresh: refreshActiveProfile,
      reloadLocalOnly: reloadActiveProfile,
      reportCloudSyncFailure,
      ...learningActions,
      ...preferenceActions,
      recordAnswer,
      badgeUnlockQueue,
      dismissBadgeUnlock,
      saveFailureNotice: notices.saveFailureNotice,
      clearSaveFailureNotice: notices.clearSaveFailureNotice,
      cloudSyncFailureNotice: notices.cloudSyncFailureNotice,
      clearCloudSyncFailureNotice: notices.clearCloudSyncFailureNotice,
    };
  }

  let hydration: Promise<void> | null = null;
  let snapshot = buildSnapshot();
  return {
    hydrate() {
      hydration ||= initialize();
      return hydration;
    },
    beginProfileTransition: profiles.beginTransition,
    activateProfile: profiles.activate,
    getManagedProfile: profiles.getManagedProfile,
    getWritableProfile: profiles.getWritableProfile,
    clearManagedProfile: profiles.clear,
    replaceManagedProfile,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
export type ProgressController = ReturnType<typeof createProgressController>;

