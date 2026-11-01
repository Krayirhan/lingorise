import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../domain/models/user";
import { CURRENT_SCHEMA_VERSION, DEFAULT_USER_DATA, detectStoredSchemaVersion, isLegacyQuestSet, normalizeUserData } from "../domain/user/normalization";
import { track } from "./telemetry";
import { createLocalWritingRepository, LOCAL_WRITING_KEY, writingKeyForProfile } from "../application/localWritingRepository";
import { createProfileStorage } from "../application/profileStorage";
const STORAGE_KEY = "@lingterra_user_data_v2";
const LEGACY_STORAGE_KEY = "@lingorise_user_data_v1";
/** Pre-rebrand key (app was named LingoRise); kept only so existing installs migrate forward. */
const LEGACY_RENAME_STORAGE_KEY = "@lingorise_user_data_v2";
const profileStorage = createProfileStorage(AsyncStorage, Date.now);
export const { loadProfile, saveProfile, removeProfile, backupLegacyProfile, readUnassignedLegacyProfile, resolveLegacyProfile, loadPending, savePending, clearPending } = profileStorage;
const writingRepository = createLocalWritingRepository(AsyncStorage);
export const saveWritingAttempt = writingRepository.save;
export const flushWritingAttempts = writingRepository.flush;
export async function clearWritingAttempts(profile?: string): Promise<void> {
  await writingRepository.flush();
  await AsyncStorage.removeItem(writingKeyForProfile(profile));
}

/**
 * Loads and migrates user data from AsyncStorage with safe fallbacks.
 */
export async function loadUserData(): Promise<UserData> {
  try {
    let raw = await AsyncStorage.getItem(STORAGE_KEY);
    // Rebrand migration check (LingoRise -> Lingterra key rename)
    if (!raw) {
      const renamedRaw = await AsyncStorage.getItem(LEGACY_RENAME_STORAGE_KEY);
      if (renamedRaw) {
        raw = renamedRaw;
        await AsyncStorage.setItem(STORAGE_KEY, renamedRaw);
        await AsyncStorage.removeItem(LEGACY_RENAME_STORAGE_KEY).catch(() => { });
      }
    }
    // Legacy migration check
    if (!raw) {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        await AsyncStorage.setItem(STORAGE_KEY, legacyRaw);
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => { });
      }
    }

    if (!raw) {
      return DEFAULT_USER_DATA;
    }

    const parsedRaw = JSON.parse(raw);
    const fromVersion = detectStoredSchemaVersion(parsedRaw);
    const normalized = normalizeUserData(parsedRaw, Date.now);
    if (fromVersion < CURRENT_SCHEMA_VERSION) {
      track("migration_applied", {
        fromVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        hadLegacyReviewQueue: Array.isArray(parsedRaw.reviewQueue) && parsedRaw.reviewQueue.length > 0,
        hadLegacyQuestSet: isLegacyQuestSet(parsedRaw.dailyQuests),
      });
    }
    return normalized;
  } catch (error) {
    console.warn("Lingterra: Error loading user data, fallback to defaults", error);
    return DEFAULT_USER_DATA;
  }
}

/** Returns false on failure instead of swallowing it, so callers can surface a signal to the user on repeated failures. */
export async function saveUserData(data: UserData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Lingterra: Error saving user data", error);
    return false;
  }
}

export interface ClearLocalDataResult {
  success: boolean;
  data: UserData;
}

/**
 * Clears local storage. Returns whether it actually succeeded instead of
 * silently swallowing an AsyncStorage error (REL-QA-003 / GLOBAL-QA-006) —
 * a trust-sensitive "your data has been erased" action must not report
 * success when the underlying clear failed.
 */
export async function clearAllLocalData(): Promise<ClearLocalDataResult> {
  let success = true;
  try {
    await writingRepository.flush();
    await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_RENAME_STORAGE_KEY, LEGACY_STORAGE_KEY, LOCAL_WRITING_KEY]);
  } catch (err) {
    console.warn("AsyncStorage clear error", err);
    success = false;
  }
  return { success, data: DEFAULT_USER_DATA };
}
