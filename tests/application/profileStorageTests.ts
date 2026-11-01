import { createProfileStorage, PROFILE_BACKUP_KEY, PROFILE_DECISION_KEY, PROFILE_LEGACY_KEYS } from "../../src/application/profileStorage";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

export async function runProfileStorageTests() {
  const legacy = JSON.stringify({ ...DEFAULT_USER_DATA, xp: 32, solvedQuestionIds: ["legacy"] });
  const map = new Map<string, string>([[PROFILE_LEGACY_KEYS[0], legacy]]);
  let failGuestSave = false;
  const kv = {
    async getItem(key: string) { return map.get(key) ?? null; },
    async setItem(key: string, value: string) { if (failGuestSave && key.includes("profile_v1:guest")) throw new Error("disk"); map.set(key, value); },
    async removeItem(key: string) { map.delete(key); },
  };
  const storage = createProfileStorage(kv, () => Date.parse("2026-11-01T12:00:00Z"));
  assert((await storage.readUnassignedLegacyProfile())?.xp === 32 && map.get(PROFILE_BACKUP_KEY) === legacy, "Legacy record is backed up before asking for ownership");
  assert(await storage.loadProfile("guest") === null && map.get(PROFILE_LEGACY_KEYS[0]) === legacy, "Reading legacy data never assigns or deletes it");
  failGuestSave = true;
  let failed = false;
  try { await storage.resolveLegacyProfile(true); } catch { failed = true; }
  assert(failed && !map.has(PROFILE_DECISION_KEY) && map.get(PROFILE_BACKUP_KEY) === legacy, "Failed import leaves decision pending and backup intact");
  failGuestSave = false;
  await storage.resolveLegacyProfile(true);
  assert(Boolean((await storage.loadProfile("guest"))?.solvedQuestionIds.includes("legacy")) && map.get(PROFILE_LEGACY_KEYS[0]) === legacy, "Explicit import creates guest data without deleting the original");
  assert(await storage.readUnassignedLegacyProfile() === null, "Completed legacy decision is not repeated on restart");
  await storage.saveProfile("account:a", { ...DEFAULT_USER_DATA, xp: 75 });
  assert((await storage.loadProfile("guest"))?.xp === 32 && (await storage.loadProfile("account:a"))?.xp === 75, "Guest and account keys remain separate");
  await storage.savePending({ uid: "a", data: DEFAULT_USER_DATA, choice: "merge" });
  const restarted = createProfileStorage(kv, () => Date.parse("2026-11-01T12:00:00Z"));
  assert((await restarted.loadPending("a"))?.choice === "merge" && await restarted.loadPending("b") === null, "Pending choice survives restart and is scoped to its account");
  await restarted.clearPending("a");
  assert(await restarted.loadPending("a") === null, "Completed pending choice can be cleared");
}
