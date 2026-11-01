import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { UserData } from "../domain/models/user";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { ApplicationDependencies } from "./ports";
import { createProgressNotices } from "./progressNotices";

export interface ProfileGateHost {
  getUserData(): UserData;
  /** Makes `data` the in-memory profile, resets badge bookkeeping, marks hydration done and emits. */
  load(data: UserData): void;
  emit(): void;
  notices: ReturnType<typeof createProgressNotices>;
}

/**
 * Managed guest/account profiles. Once enabled, only the active profile may
 * accept writes. Auth can change before its listener runs, so identity is
 * checked against the active profile at every write as well as during
 * transitions. Writes are queued so a transition can wait for them.
 */
export function createProfileGate(deps: ApplicationDependencies, host: ProfileGateHost) {
  let managed = false;
  let activeProfile: string | null = null;
  let inTransition = false;
  let pendingWrites: Promise<void> = Promise.resolve();
  let queuedWriteError: unknown = null;

  const canWrite = () => !inTransition && (!managed ||
    (activeProfile === "guest" ? !deps.account.current() : activeProfile === `account:${deps.account.current()?.uid}`));

  const enqueueWrite = (write: () => Promise<void>) => {
    pendingWrites = pendingWrites.then(async () => {
      if (queuedWriteError) return;
      await write();
    }).catch(error => {
      queuedWriteError = error;
      host.notices.noteSaveOutcome(false);
      host.notices.setSaveFailureNotice("İlerlemen henüz kaydedilemedi. Bağlantını ve cihaz alanını kontrol edip tekrar dene.");
    });
  };

  async function beginTransition() {
    managed = true;
    inTransition = true;
    host.emit();
    await pendingWrites;
    await deps.local.flushWritingAttempts?.();
    if (queuedWriteError) {
      // Save the newest in-memory snapshot, including changes queued after the
      // failed write. Never report a completed transition while it is unsaved.
      const owner = activeProfile;
      if (!owner || !deps.local.saveProfile) throw queuedWriteError;
      const userData = host.getUserData();
      await deps.local.saveProfile(owner, userData);
      if (owner.startsWith("account:")) {
        const uid = owner.slice("account:".length);
        if (deps.account.current()?.uid !== uid) throw new Error("Cannot sync a previous account while another account is active");
        await Promise.all([deps.remote.saveProfile(uid, userData), deps.remote.saveProgress(uid, userData)]);
      }
      queuedWriteError = null;
      host.notices.clearSaveFailureNotice();
    }
  }

  function activate(profile: string, data: UserData) {
    activeProfile = profile;
    inTransition = false;
    host.load(rolloverToToday(data, deps.clock.nowDate()).data);
  }

  async function clear(): Promise<{ success: boolean; data: UserData }> {
    const owner = activeProfile;
    const original = host.getUserData();
    if (!managed || !owner || !canWrite() || !deps.local.saveProfile) return { success: false, data: original };
    try {
      await beginTransition();
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
      activate(owner, replacement);
      return { success: true, data: replacement };
    } catch {
      if ((owner === "guest" && !deps.account.current()) || owner === `account:${deps.account.current()?.uid}`) activate(owner, original);
      return { success: false, data: original };
    }
  }

  /** Waits for queued writes; true when all of them succeeded. */
  async function settle(): Promise<boolean> {
    await pendingWrites;
    return queuedWriteError === null;
  }

  async function refresh(refreshUnmanaged: () => Promise<void>) {
    if (!managed) return refreshUnmanaged();
    if (!canWrite() || !activeProfile || !deps.local.loadProfile) return;
    await pendingWrites;
    if (queuedWriteError) throw queuedWriteError;
    const owner = activeProfile;
    const data = await deps.local.loadProfile(owner);
    if (!canWrite() || activeProfile !== owner) return;
    activate(owner, rolloverToToday(data ?? DEFAULT_USER_DATA, deps.clock.nowDate()).data);
  }

  return {
    isManaged: () => managed,
    getActiveProfile: () => activeProfile,
    isInTransition: () => inTransition,
    canWrite,
    enqueueWrite,
    beginTransition,
    activate,
    clear,
    settle,
    refresh,
    getManagedProfile: () => managed ? activeProfile : null,
    getWritableProfile: () => managed && canWrite() ? activeProfile : null,
  };
}
