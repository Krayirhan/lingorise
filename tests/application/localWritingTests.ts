import { createLocalWritingRepository, LOCAL_WRITING_KEY, writingKeyForProfile } from "../../src/application/localWritingRepository";
import { assert } from "../support/assertions";

export async function runLocalWritingTests() {
  const storage = new Map<string, string>();
  const repository = createLocalWritingRepository({
    async getItem(key) { return storage.get(key) ?? null; },
    async setItem(key, value) { storage.set(key, value); },
  });
  const results = await Promise.all([
    repository.save({ questionId: "q1", response: "I write a sentence here.", createdAt: 1 }),
    repository.save({ questionId: "q2", response: "We write another sentence here.", createdAt: 2 }),
  ]);
  await repository.flush();
  const saved = JSON.parse(storage.get(LOCAL_WRITING_KEY) || "[]");
  assert(results.every(Boolean) && saved.length === 2, "Concurrent local writing saves do not overwrite each other");
  assert(storage.size === 1 && !storage.has("@lingterra_user_data_v2"), "Writing text is stored separately from synchronized user data");
  await Promise.all([
    repository.save({ questionId: "q3", response: "Guest text", createdAt: 3 }, "guest"),
    repository.save({ questionId: "q4", response: "Account text", createdAt: 4 }, "account:a"),
  ]);
  const guest = JSON.parse(storage.get(writingKeyForProfile("guest")) || "[]");
  const account = JSON.parse(storage.get(writingKeyForProfile("account:a")) || "[]");
  assert(guest.length === 1 && guest[0].response === "Guest text" && account.length === 1 && account[0].response === "Account text", "Writing attempts are isolated by profile without changing legacy attempts");
  const failing = createLocalWritingRepository({ async getItem() { return null; }, async setItem() { throw new Error("storage unavailable"); } });
  assert(await failing.save({ questionId: "q", response: "Text", createdAt: 3 }) === false, "Storage failures are reported without crashing");
}
