export const LOCAL_WRITING_KEY = "@lingterra_writing_local_v1";
export const writingKeyForProfile = (profile?: string) => profile ? `${LOCAL_WRITING_KEY}:${encodeURIComponent(profile)}` : LOCAL_WRITING_KEY;
export interface LocalWritingAttempt { questionId: string; response: string; createdAt: number }
interface KeyValueStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> }

/** Kept separate from UserData, which is synchronized to the account. */
export function createLocalWritingRepository(storage: KeyValueStorage) {
  let queue: Promise<void> = Promise.resolve();
  return {
    save(attempt: LocalWritingAttempt, profile?: string): Promise<boolean> {
      const operation = queue.then(async () => {
        try {
          const key = writingKeyForProfile(profile);
          const raw = await storage.getItem(key);
          const parsed: unknown = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(parsed)) return false;
          await storage.setItem(key, JSON.stringify([...parsed, attempt].slice(-500)));
          return true;
        } catch {
          return false;
        }
      });
      queue = operation.then(() => undefined);
      return operation;
    },
    flush: () => queue,
  };
}
