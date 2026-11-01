import { MeaningMatchQuestion } from "../domain/models/content";
import { calculatePracticeAnswerXp } from "../domain/practice/answer";
import { createAccountSession } from "./accountSession";
import { createAccountService } from "./account";
import { createQuestionCatalogue } from "./catalogue";
import { createContentQueries } from "./contentQueries";
import { createDataManagement } from "./dataManagement";
import { createLearningCatalogue } from "./learningCatalogue";
import { ApplicationDependencies } from "./ports";
import { createProgressController } from "./progressController";
import { createSessionBuilder } from "./sessionBuilder";
import { createSessionCommands } from "./sessionCommands";
import { createSessionResultRecorder } from "./sessionResults";
import { createSynchronization } from "./synchronization";
import { createProfileCoordinator } from "./profileCoordinator";
import { normalizeUserData } from "../domain/user/normalization";

export function createApplication(deps: ApplicationDependencies, bundled: MeaningMatchQuestion[], contentVersion: string) {
  const catalogue = createQuestionCatalogue(bundled, contentVersion);
  const account = createAccountService(deps.account, deps.remote, deps.telemetry);
  const synchronization = createSynchronization(deps.local, deps.remote, deps.clock, deps.telemetry);
  const sessions = createSessionBuilder(catalogue, deps.random);
  const learning = createLearningCatalogue(catalogue, deps.random);
  const progress = createProgressController(deps, catalogue);
  const accountSession = createAccountSession(synchronization, progress);
  const profiles = deps.local.loadProfile && deps.local.saveProfile && deps.local.backupLegacyProfile
    ? createProfileCoordinator({ loadProfile: deps.local.loadProfile, saveProfile: deps.local.saveProfile, backupLegacyProfile: deps.local.backupLegacyProfile,
      readUnassignedLegacyProfile: deps.local.readUnassignedLegacyProfile, resolveLegacyProfile: deps.local.resolveLegacyProfile,
      loadPending: deps.local.loadPending, savePending: deps.local.savePending, clearPending: deps.local.clearPending }, deps.remote, deps.clock.nowDate)
    : null;
  const signOutProfile = async () => {
    const current = account.current();
    const previous = progress.getSnapshot().userData;
    const previousOwner = progress.getManagedProfile();
    try { await progress.beginProfileTransition(); await account.logout(); }
    catch (error) {
      if (current && previousOwner === `account:${current.uid}` && account.current()?.uid === current.uid) progress.activateProfile(previousOwner, previous);
      throw error;
    }
  };
  const deleteAccountProfile = async () => {
    const current = account.current();
    const previous = progress.getSnapshot().userData;
    const previousOwner = progress.getManagedProfile();
    try {
      await progress.beginProfileTransition();
      await account.deleteAccount();
      if (current) await deps.local.removeProfile?.(`account:${current.uid}`);
    }
    catch (error) {
      if (current && previousOwner === `account:${current.uid}` && account.current()?.uid === current.uid) progress.activateProfile(previousOwner, previous);
      throw error;
    }
  };
  const profileAwareLocal = {
    ...deps.local,
    load: async () => progress.getManagedProfile() ? progress.getSnapshot().userData : deps.local.load(),
    save: async (data: Parameters<typeof deps.local.save>[0]) => progress.getManagedProfile()
      ? progress.replaceManagedProfile(normalizeUserData(data, deps.clock.wallNow))
      : deps.local.save(data),
  };
  return {
    catalogue,
    writing: { getTask: (questionId: string) => deps.catalogue.getWritingTask?.(questionId) },
    learning,
    sessions,
    sessionCommands: createSessionCommands(sessions, learning, deps.telemetry.track, deps.random),
    content: createContentQueries(catalogue, deps.clock, deps.random),
    progress,
    calculateAnswerXp: (...args: Parameters<typeof calculatePracticeAnswerXp>) => calculatePracticeAnswerXp(args[0], args[1], args[2], args[3], args[4], deps.clock.now()),
    createResultRecorder: () => createSessionResultRecorder(deps.telemetry.track, progress.getSnapshot().markLevelExamPassed, progress.getSnapshot().recordTopicAssessment),
    account,
    synchronization,
    accountSession,
    profiles,
    signOutProfile,
    deleteAccountProfile,
    reminders: deps.notifications,
    clock: deps.clock,
    random: deps.random,
    track: deps.telemetry.track,
    speechService: deps.speech,
    async loadCatalogue(level: Parameters<typeof deps.catalogue.load>[0]) {
      const result = await deps.catalogue.load(level);
      catalogue.setRuntimeQuestions(result.questions);
      return result;
    },
    data: {
      clearAllLocalData: () => progress.getManagedProfile() ? progress.clearManagedProfile() : synchronization.resetLocal(),
      saveWritingAttempt: (attempt: { questionId: string; response: string; createdAt: number }) => {
        const owner = progress.getManagedProfile();
        if (owner && progress.getWritableProfile() !== owner) return Promise.resolve(false);
        return deps.local.saveWritingAttempt?.(attempt, owner ?? undefined) ?? Promise.resolve(false);
      },
      ...createDataManagement(profileAwareLocal, deps.backup, deps.clock),
    },
  };
}
export type Application = ReturnType<typeof createApplication>;
