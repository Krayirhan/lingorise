import { UserData } from "../domain/models/user";
import { ApplicationDependencies } from "./ports";
import { createProgressNotices } from "./progressNotices";
import { createProfileGate } from "./progressProfiles";

/**
 * Applies a progress update in memory and persists it: through the managed
 * profile's write queue when profiles are managed, otherwise straight to local
 * storage with a best-effort cloud sync for a signed-in user.
 */
export function createProgressPersistence(
  deps: ApplicationDependencies,
  profiles: ReturnType<typeof createProfileGate>,
  notices: ReturnType<typeof createProgressNotices>,
  state: { get(): UserData; set(next: UserData): void },
) {
  return (updater: (previous: UserData) => UserData) => {
    if (!profiles.canWrite()) return;
    const next = updater(state.get());
    const managedProfiles = profiles.isManaged();
    const activeProfile = profiles.getActiveProfile();
    if (managedProfiles && (!activeProfile || !deps.local.saveProfile)) {
      throw new Error("Managed profile storage is unavailable");
    }
    if (managedProfiles && activeProfile && deps.local.saveProfile) {
      const owner = activeProfile;
      const uid = owner.startsWith("account:") ? owner.slice("account:".length) : null;
      profiles.enqueueWrite(async () => {
        await deps.local.saveProfile!(owner, next);
        notices.noteSaveOutcome(true);
        if (uid) {
          await Promise.all([deps.remote.saveProfile(uid, next), deps.remote.saveProgress(uid, next)]);
          notices.noteCloudSyncOutcome(true);
        }
      });
      state.set(next);
      return;
    }
    deps.local.save(next).then(notices.noteSaveOutcome);
    const user = deps.account.current();
    if (user) {
      Promise.all([deps.remote.saveProfile(user.uid, next), deps.remote.saveProgress(user.uid, next)])
        .then(() => notices.noteCloudSyncOutcome(true))
        .catch(error => {
          console.warn("Lingterra: Firebase sync failed; local data is safe", error);
          notices.noteCloudSyncOutcome(false);
        });
    }
    state.set(next);
  };
}
