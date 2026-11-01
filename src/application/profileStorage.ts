import { UserData } from "../domain/models/user";
import { normalizeUserData } from "../domain/user/normalization";
import { mergeUserData } from "../domain/sync/progressMerge";

interface Storage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown>; removeItem(key: string): Promise<unknown> }
export const PROFILE_LEGACY_KEYS = ["@lingterra_user_data_v2", "@lingorise_user_data_v2", "@lingorise_user_data_v1"];
export const PROFILE_BACKUP_KEY = "@lingterra_profile_legacy_backup_v1";
export const PROFILE_DECISION_KEY = "@lingterra_profile_legacy_decision_v1";
const profileKey = (profile: string) => `@lingterra_profile_v1:${encodeURIComponent(profile)}`;

export function createProfileStorage(storage: Storage, now: () => number) {
  const pendingKey = (uid: string) => `@lingterra_profile_pending_v1:${encodeURIComponent(uid)}`;
  const loadProfile = async (profile: string): Promise<UserData | null> => {
    const raw = await storage.getItem(profileKey(profile));
    return raw === null ? null : normalizeUserData(JSON.parse(raw), now);
  };
  const saveProfile = async (profile: string, data: UserData): Promise<void> => {
    await storage.setItem(profileKey(profile), JSON.stringify(data));
  };
  const backupLegacyProfile = async (): Promise<boolean> => {
    if (await storage.getItem(PROFILE_BACKUP_KEY) !== null) return true;
    for (const key of PROFILE_LEGACY_KEYS) {
      const raw = await storage.getItem(key);
      if (raw !== null) { await storage.setItem(PROFILE_BACKUP_KEY, raw); return true; }
    }
    return false;
  };
  const readUnassignedLegacyProfile = async (): Promise<UserData | null> => {
    if (await storage.getItem(PROFILE_DECISION_KEY)) return null;
    if (!await backupLegacyProfile()) return null;
    const raw = await storage.getItem(PROFILE_BACKUP_KEY);
    return raw === null ? null : normalizeUserData(JSON.parse(raw), now);
  };
  return {
    loadProfile, saveProfile, backupLegacyProfile, readUnassignedLegacyProfile,
    async loadPending(uid: string): Promise<{ uid: string; data: UserData; choice: "merge" | "account" } | null> {
      const raw = await storage.getItem(pendingKey(uid));
      if (raw === null) return null;
      const value = JSON.parse(raw);
      if (value.uid !== uid || (value.choice !== "merge" && value.choice !== "account") || !value.data || typeof value.data !== "object") throw new Error("Invalid pending profile transition");
      return { uid, data: normalizeUserData(value.data, now), choice: value.choice };
    },
    async savePending(pending: { uid: string; data: UserData; choice: "merge" | "account" }) { await storage.setItem(pendingKey(pending.uid), JSON.stringify(pending)); },
    async clearPending(uid: string) { await storage.removeItem(pendingKey(uid)); },
    async removeProfile(profile: string) { await storage.removeItem(profileKey(profile)); },
    async resolveLegacyProfile(importAsGuest: boolean) {
      const legacy = await readUnassignedLegacyProfile();
      if (importAsGuest && legacy) {
        const current = await loadProfile("guest");
        await saveProfile("guest", current
          ? { ...mergeUserData(legacy, current, new Date(now())), activeSession: current.activeSession ?? null }
          : legacy);
      }
      await storage.setItem(PROFILE_DECISION_KEY, importAsGuest ? "guest" : "preserved");
    },
  };
}
