import { UserData } from "../domain/models/user";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { GuestProgressChoice, selectAccountProgress } from "../domain/sync/profileTransition";
import { RemoteProgressRepository } from "./ports";

/** Profile storage methods reject on failure; callers must not continue a transition after an error. */
export interface ProfileStorage {
  loadProfile(profile: string): Promise<UserData | null>;
  saveProfile(profile: string, data: UserData): Promise<void>;
  backupLegacyProfile(): Promise<boolean>;
  readUnassignedLegacyProfile?(): Promise<UserData | null>;
  resolveLegacyProfile?(importAsGuest: boolean): Promise<void>;
  loadPending?(uid: string): Promise<{ uid: string; data: UserData; choice: GuestProgressChoice } | null>;
  savePending?(pending: { uid: string; data: UserData; choice: GuestProgressChoice }): Promise<void>;
  clearPending?(uid: string): Promise<void>;
}

/**
 * Prepares a transition without writing to the cloud. The owner must hold the
 * UI/write barrier until commit has finished, and verify the account identity
 * after every asynchronous step.
 */
export function createProfileCoordinator(storage: ProfileStorage, remote: RemoteProgressRepository, now: () => Date) {
  const accountKey = (uid: string) => `account:${uid}`;
  function ensureIdentity(uid: string, currentUid: () => string | null) {
    if (currentUid() !== uid) throw new Error("Account changed during profile transition");
  }
  return {
    readUnassignedLegacyProfile: () => storage.readUnassignedLegacyProfile?.() ?? Promise.resolve(null),
    resolveLegacyProfile: (importAsGuest: boolean) => storage.resolveLegacyProfile?.(importAsGuest) ?? Promise.resolve(),
    hasAccountCache: async (uid: string) => (await storage.loadProfile(accountKey(uid))) !== null,
    async resumePending(uid: string, currentUid: () => string | null) {
      ensureIdentity(uid, currentUid);
      const pending = await storage.loadPending?.(uid);
      ensureIdentity(uid, currentUid);
      if (!pending) return null;
      const cloud = await remote.fetch(uid);
      ensureIdentity(uid, currentUid);
      // Merge the recorded account snapshot with fresh server data so progress
      // made on another device since the interruption is not overwritten.
      const data = selectAccountProgress(DEFAULT_USER_DATA, pending.data, cloud, "account", DEFAULT_USER_DATA, now());
      return { uid, data, choice: pending.choice };
    },
    async prepareAccount(uid: string, choice: GuestProgressChoice, currentUid: () => string | null) {
      ensureIdentity(uid, currentUid);
      await storage.backupLegacyProfile();
      ensureIdentity(uid, currentUid);
      const [guest, cache, cloud] = await Promise.all([
        storage.loadProfile("guest"), storage.loadProfile(accountKey(uid)), remote.fetch(uid),
      ]);
      ensureIdentity(uid, currentUid);
      const data = selectAccountProgress(guest ?? DEFAULT_USER_DATA, cache, cloud, choice, DEFAULT_USER_DATA, now());
      return { uid, data, choice };
    },
    async commitAccount(prepared: { uid: string; data: UserData; choice: GuestProgressChoice }, currentUid: () => string | null) {
      ensureIdentity(prepared.uid, currentUid);
      await storage.savePending?.(prepared);
      ensureIdentity(prepared.uid, currentUid);
      await storage.saveProfile(accountKey(prepared.uid), prepared.data);
      ensureIdentity(prepared.uid, currentUid);
      await remote.saveProfile(prepared.uid, prepared.data);
      ensureIdentity(prepared.uid, currentUid);
      await remote.saveProgress(prepared.uid, prepared.data);
      ensureIdentity(prepared.uid, currentUid);
      await storage.clearPending?.(prepared.uid);
      ensureIdentity(prepared.uid, currentUid);
      return prepared.data;
    },
    async loadGuest() {
      return (await storage.loadProfile("guest")) ?? DEFAULT_USER_DATA;
    },
  };
}
