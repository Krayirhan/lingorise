import { createProfileCoordinator } from "../../src/application/profileCoordinator";
import { RemoteProgressRepository } from "../../src/application/ports";
import { UserData } from "../../src/domain/models/user";
import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

export async function runProfileCoordinatorTests() {
  const guest = { ...DEFAULT_USER_DATA, xp: 10, solvedQuestionIds: ["guest"] };
  const account = { ...DEFAULT_USER_DATA, xp: 70, solvedQuestionIds: ["account"] };
  const profiles = new Map<string, UserData>([["guest", guest]]);
  const writes: string[] = [];
  let uid: string | null = "a";
  let failStorage = false;
  const store = {
    async loadProfile(key: string) { return profiles.get(key) ?? null; },
    async saveProfile(key: string, data: UserData) { if (failStorage) throw new Error("disk"); profiles.set(key, data); },
    async backupLegacyProfile() { return true; },
  };
  const remote: RemoteProgressRepository = {
    async fetch() { return { status: "found", data: account }; },
    async saveProfile(id) { writes.push(`profile:${id}`); },
    async saveProgress(id) { writes.push(`progress:${id}`); },
    async saveLearningItem() {}, async delete() {},
  };
  const coordinator = createProfileCoordinator(store, remote, () => new Date("2026-11-01T12:00:00Z"));
  const prepared = await coordinator.prepareAccount("a", "account", () => uid);
  assert(writes.length === 0 && prepared.data.solvedQuestionIds.join() === "account", "Preparing account-only selection performs no cloud writes or guest import");
  failStorage = true;
  try { await coordinator.commitAccount(prepared, () => uid); } catch { /* expected */ }
  assert(writes.length === 0, "A local profile failure blocks all cloud writes");
  failStorage = false;
  uid = "b";
  try { await coordinator.commitAccount(prepared, () => uid); } catch { /* expected */ }
  assert(writes.length === 0 && !profiles.has("account:a"), "Changed identity blocks committing another account");
  uid = "a";
  const merged = await coordinator.prepareAccount("a", "merge", () => uid);
  await coordinator.commitAccount(merged, () => uid);
  assert(writes.join() === "profile:a,progress:a" && profiles.get("guest") === guest, "Explicit merge commits to the selected account and leaves guest intact");
  const restoredGuest = await coordinator.loadGuest();
  assert(restoredGuest.solvedQuestionIds.join() === "guest", "Signing out can restore the unchanged guest profile");
  uid = "b";
  const otherAccount = await coordinator.prepareAccount("b", "account", () => uid);
  assert(!otherAccount.data.solvedQuestionIds.includes("guest") && !otherAccount.data.solvedQuestionIds.includes("account:a"), "A second account does not consume guest or first-account cache");
  const offlineRemote: RemoteProgressRepository = { ...remote, async fetch() { return { status: "failed", error: new Error("offline") }; } };
  const offline = createProfileCoordinator(store, offlineRemote, () => new Date("2026-11-01T12:00:00Z"));
  const before = writes.length;
  let failed = false;
  try { await offline.prepareAccount("b", "merge", () => uid); } catch { failed = true; }
  assert(failed && writes.length === before && !profiles.has("account:b"), "Failed remote read leaves both profiles untouched");
  uid = "a";
  const restarted = createProfileCoordinator(store, remote, () => new Date("2026-11-02T12:00:00Z"));
  assert(await restarted.hasAccountCache("a"), "Account cache remains identifiable after coordinator restart");
  const restored = await restarted.prepareAccount("a", "account", () => uid);
  assert(restored.data.solvedQuestionIds.includes("guest") && profiles.get("guest") === guest, "Restart restores explicitly merged account while retaining the guest copy");
  const switchingRemote: RemoteProgressRepository = { ...remote, async fetch() { uid = "b"; return { status: "found", data: account }; } };
  const switching = createProfileCoordinator(store, switchingRemote, () => new Date());
  uid = "a";
  let changed = false;
  try { await switching.prepareAccount("a", "merge", () => uid); } catch { changed = true; }
  assert(changed && writes.length === before, "Identity changes during a remote read prevent the prepared transition");
  uid = "a";
  let pending: { uid: string; data: UserData; choice: "merge" | "account" } | null = null;
  let failProgress = true;
  const journalStore = {
    ...store,
    async loadPending(id: string) { return pending?.uid === id ? pending : null; },
    async savePending(value: { uid: string; data: UserData; choice: "merge" | "account" }) { pending = value; },
    async clearPending() { pending = null; },
  };
  const changingCloud = { ...account, solvedQuestionIds: ["account", "other-device"] };
  const interruptedRemote: RemoteProgressRepository = {
    ...remote,
    async fetch() { return { status: "found", data: changingCloud }; },
    async saveProgress() { if (failProgress) throw new Error("offline"); },
  };
  const interrupted = createProfileCoordinator(journalStore, interruptedRemote, () => new Date("2026-11-01T12:00:00Z"));
  const beforeFailure = await interrupted.prepareAccount("a", "merge", () => uid);
  try { await interrupted.commitAccount(beforeFailure, () => uid); } catch { /* expected */ }
  assert(pending !== null, "An interrupted commit keeps the user's choice in a durable journal");
  failProgress = false;
  const recovered = await interrupted.resumePending("a", () => uid);
  assert(recovered !== null && recovered.choice === "merge" && recovered.data.solvedQuestionIds.includes("guest") && recovered.data.solvedQuestionIds.includes("other-device"), "Restart resumes the chosen merge without discarding newer cloud data");
  if (recovered) await interrupted.commitAccount(recovered, () => uid);
  assert(pending === null, "Successful retry clears the pending transition");
}
