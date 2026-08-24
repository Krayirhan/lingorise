import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../types/user";
import { createDailyQuests, DAILY_QUEST_PRACTICE_ID } from "../domain/gamification/badges";
import { LearningItemProgress } from "../types/user";
import { deriveStatus } from "../domain/learning/mastery";
import { DEFAULT_EASE_FACTOR } from "../domain/review/spacedRepetition";
import { clearTelemetry, track } from "./telemetry";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Days across which previously solved words are re-scheduled on upgrade. */
const MIGRATION_SPREAD_DAYS = 7;

/** Shape of the pre-Sprint-2 mistake queue, kept only for migration. */
interface LegacyReviewItem {
  questionId: string;
  mistakeCount?: number;
  lastMistakeAt?: number;
  nextReviewAt?: number;
  intervalDays?: number;
  repetitions?: number;
  easeFactor?: number;
}

const STORAGE_KEY = "@lingorise_user_data_v2";
const LEGACY_STORAGE_KEY = "@lingorise_user_data_v1";

/**
 * Migration versioning (roadmap Birim 8.1). Each version bump corresponds to
 * one of the three migration paths that used to be detected only by "does
 * this old field exist" checks scattered through normalizeUserData:
 *   v1 — pre-learningProgress data: only solvedQuestionIds and/or the old
 *        mistake-queue (`reviewQueue`) existed.
 *   v2 — learningProgress introduced (Sprint 1-2), but quest records could
 *        still carry the old target:2 shape from before the daily-rollover
 *        rewrite.
 *   v3 — current: schemaVersion is now stamped explicitly so future
 *        migrations never again have to infer version from field shape.
 * The migrations themselves (migrateLearningProgress, isLegacyQuestSet)
 * still run their own idempotent shape checks below — this constant and
 * detector exist for observability (8.3) and so a future v4 has a version
 * number to gate on instead of one more "does this field exist" check.
 */
export const CURRENT_SCHEMA_VERSION = 3;

/** Infers the version of data written before schemaVersion existed. */
function detectStoredSchemaVersion(
  data: Partial<UserData> & { reviewQueue?: LegacyReviewItem[]; schemaVersion?: number }
): number {
  if (typeof data.schemaVersion === "number") return data.schemaVersion;
  if (data.learningProgress && typeof data.learningProgress === "object" && !Array.isArray(data.learningProgress)) {
    return 2;
  }
  if (Array.isArray(data.solvedQuestionIds) || Array.isArray(data.reviewQueue)) return 1;
  return CURRENT_SCHEMA_VERSION; // no recognizable legacy shape — nothing to migrate
}

export const DEFAULT_USER_DATA: UserData = {
  onboardingCompleted: false,
  xp: 0,
  level: "A1",
  locale: "tr",
  streak: 0,
  lastActiveDate: "",
  dailyGoalMinutes: 5,
  practiceSessionSize: 20,
  notificationsEnabled: false,
  soundEnabled: true,
  reduceMotion: false,
  avatarId: "sprig",
  displayName: "",
  favoriteWordIds: [],
  solvedQuestionIds: [],
  rewardedQuestionIds: [],
  unlockedBadges: [],
  dailyQuests: createDailyQuests(20, false),
  dailyReviewXpIds: [],
  learningProgress: {},
  celebratedLevels: [],
  practiceHistory: [],
  questHistory: [],
  activeSession: null,
};

/** Detects only the old, untouched demo profile; real activity is never reset. */
export function isSeededDemoProfile(data: Partial<UserData>): boolean {
  return (
    data.xp === 120 &&
    data.streak === 3 &&
    data.lastCompletedWord?.word === "quiet" &&
    data.lastCompletedWord?.meaning === "sessiz" &&
    data.solvedQuestionIds?.length === 0 &&
    data.rewardedQuestionIds?.length === 0 &&
    data.practiceHistory?.length === 0
  );
}

/**
 * Brings forward progress saved before per-word recall was tracked. A solved
 * id only ever meant "answered right once", so it is adopted as `learning` —
 * claiming anything stronger would recreate the inflated percentages this
 * record exists to replace.
 */
function migrateLearningProgress(
  stored: unknown,
  solvedQuestionIds: string[],
  legacyReviewQueue: LegacyReviewItem[]
): Record<string, LearningItemProgress> {
  const migrated: Record<string, LearningItemProgress> = {};

  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const [id, item] of Object.entries(stored as Record<string, LearningItemProgress>)) {
      const repaired: LearningItemProgress = {
        status: item.status || "learning",
        attempts: item.attempts ?? 0,
        correctCount: item.correctCount ?? 0,
        wrongCount: item.wrongCount ?? 0,
        repetitions: item.repetitions ?? 0,
        distinctCorrectDays: item.distinctCorrectDays ?? 0,
        lastCorrectDate: item.lastCorrectDate,
        intervalDays: item.intervalDays ?? 0,
        easeFactor: item.easeFactor || DEFAULT_EASE_FACTOR,
        nextReviewAt: item.nextReviewAt ?? 0,
        lastAnsweredAt: item.lastAnsweredAt,
        serverSyncedAt: item.serverSyncedAt,
      };
      migrated[id] = { ...repaired, status: deriveStatus(repaired) };
    }
  } else {
    // A solved id only ever meant "answered right once", so it is adopted as
    // `learning` — claiming anything stronger would recreate the inflated
    // percentages this record exists to replace.
    //
    // Their schedules are spread across the coming days rather than all coming
    // due at once: a learner with hundreds of solved words should not open the
    // app to a wall of reviews that also blocks every new word.
    const now = Date.now();
    solvedQuestionIds.forEach((id, index) => {
      const dayOffset = index % MIGRATION_SPREAD_DAYS;
      migrated[id] = {
        status: "learning",
        attempts: 1,
        correctCount: 1,
        wrongCount: 0,
        repetitions: 1,
        distinctCorrectDays: 1,
        intervalDays: 1,
        easeFactor: DEFAULT_EASE_FACTOR,
        nextReviewAt: now + dayOffset * DAY_MS,
        lastAnsweredAt: now,
      };
    });
  }

  // Words that only lived in the old mistake queue keep their schedule so no
  // pending review is silently dropped by the rewrite.
  for (const legacy of legacyReviewQueue) {
    if (!legacy?.questionId) continue;
    const existing = migrated[legacy.questionId];
    const item: LearningItemProgress = {
      status: existing?.status || "learning",
      attempts: existing?.attempts ?? Math.max(1, legacy.mistakeCount || 1),
      correctCount: existing?.correctCount ?? 0,
      wrongCount: existing?.wrongCount ?? (legacy.mistakeCount || 1),
      repetitions: existing?.repetitions ?? (legacy.repetitions || 0),
      distinctCorrectDays: existing?.distinctCorrectDays ?? 0,
      lastCorrectDate: existing?.lastCorrectDate,
      intervalDays: legacy.intervalDays ?? existing?.intervalDays ?? 0,
      easeFactor: legacy.easeFactor || existing?.easeFactor || DEFAULT_EASE_FACTOR,
      nextReviewAt: legacy.nextReviewAt ?? existing?.nextReviewAt ?? Date.now(),
      lastAnsweredAt: existing?.lastAnsweredAt ?? legacy.lastMistakeAt,
    };
    migrated[legacy.questionId] = { ...item, status: deriveStatus(item) };
  }

  return migrated;
}

/**
 * Quests saved before the daily-rollover rewrite counted "answers submitted"
 * with a target of 2 while the UI promised a full session. Those are reissued
 * so nobody is left staring at a permanently completed two-step day.
 */
function isLegacyQuestSet(quests: unknown): boolean {
  if (!Array.isArray(quests) || quests.length === 0) return true;
  const practice = quests.find((quest) => quest?.id === DAILY_QUEST_PRACTICE_ID);
  return !practice || typeof practice.target !== "number" || practice.target <= 2;
}

/** Migrates persisted data and removes the legacy untouched demo profile. */
export function normalizeUserData(data: Partial<UserData>): UserData {
  const parsed = isSeededDemoProfile(data)
    ? {
        onboardingCompleted: data.onboardingCompleted,
        level: data.level,
        locale: data.locale,
        dailyGoalMinutes: data.dailyGoalMinutes,
        practiceSessionSize: data.practiceSessionSize,
        notificationsEnabled: data.notificationsEnabled,
        soundEnabled: data.soundEnabled,
        reduceMotion: data.reduceMotion,
        avatarId: data.avatarId,
        displayName: data.displayName === "LingoRise Bahçıvanı" ? "" : data.displayName,
      }
    : data;

  const legacyReviewQueue: LegacyReviewItem[] = Array.isArray(
    (parsed as { reviewQueue?: LegacyReviewItem[] }).reviewQueue
  )
    ? ((parsed as { reviewQueue?: LegacyReviewItem[] }).reviewQueue as LegacyReviewItem[])
    : [];

  return {
    ...DEFAULT_USER_DATA,
    ...parsed,
    dailyGoalMinutes: parsed.dailyGoalMinutes || DEFAULT_USER_DATA.dailyGoalMinutes,
    practiceSessionSize: [5, 10, 20, 30].includes(parsed.practiceSessionSize as number) ? parsed.practiceSessionSize as 5 | 10 | 20 | 30 : DEFAULT_USER_DATA.practiceSessionSize,
    notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_USER_DATA.notificationsEnabled,
    soundEnabled: parsed.soundEnabled ?? DEFAULT_USER_DATA.soundEnabled,
    reduceMotion: parsed.reduceMotion ?? DEFAULT_USER_DATA.reduceMotion,
    avatarId: parsed.avatarId || DEFAULT_USER_DATA.avatarId,
    displayName: parsed.displayName || DEFAULT_USER_DATA.displayName,
    favoriteWordIds: Array.isArray(parsed.favoriteWordIds) ? parsed.favoriteWordIds : [],
    solvedQuestionIds: Array.isArray(parsed.solvedQuestionIds) ? parsed.solvedQuestionIds : [],
    rewardedQuestionIds: Array.isArray(parsed.rewardedQuestionIds) ? parsed.rewardedQuestionIds : [],
    unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    dailyQuests: isLegacyQuestSet(parsed.dailyQuests)
      ? createDailyQuests(
          [5, 10, 20, 30].includes(parsed.practiceSessionSize as number)
            ? (parsed.practiceSessionSize as number)
            : DEFAULT_USER_DATA.practiceSessionSize,
          legacyReviewQueue.length > 0
        )
      : (parsed.dailyQuests as UserData["dailyQuests"]),
    dailyReviewXpIds: Array.isArray(parsed.dailyReviewXpIds) ? parsed.dailyReviewXpIds : [],
    learningProgress: migrateLearningProgress(
      parsed.learningProgress,
      Array.isArray(parsed.solvedQuestionIds) ? parsed.solvedQuestionIds : [],
      legacyReviewQueue
    ),
    celebratedLevels: Array.isArray(parsed.celebratedLevels) ? parsed.celebratedLevels : [],
    practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
    questHistory: Array.isArray(parsed.questHistory) ? parsed.questHistory : [],
    activeSession: parsed.activeSession || null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

/**
 * Loads and migrates user data from AsyncStorage with safe fallbacks.
 */
export async function loadUserData(): Promise<UserData> {
  try {
    let raw = await AsyncStorage.getItem(STORAGE_KEY);
    // Legacy migration check
    if (!raw) {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        await AsyncStorage.setItem(STORAGE_KEY, legacyRaw);
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
      }
    }

    if (!raw) {
      return DEFAULT_USER_DATA;
    }

    const parsedRaw = JSON.parse(raw);
    const fromVersion = detectStoredSchemaVersion(parsedRaw);
    const normalized = normalizeUserData(parsedRaw);
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
    console.warn("LingoRise: Error loading user data, fallback to defaults", error);
    return DEFAULT_USER_DATA;
  }
}

export const STORAGE_VERSION = "2.2.0";

export async function saveUserData(data: UserData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("LingoRise: Error saving user data", error);
  }
}

export async function exportUserDataJSON(): Promise<string> {
  const data = await loadUserData();
  return JSON.stringify(
    {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

export async function importUserDataJSON(jsonString: string): Promise<UserData> {
  try {
    const parsed = JSON.parse(jsonString);
    const dataToSave = parsed.data || parsed;
    await saveUserData(dataToSave);
    return await loadUserData();
  } catch (err) {
    throw new Error("Geçersiz yedekleme dosyası formatı.");
  }
}

export async function clearAllLocalData(): Promise<UserData> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
  } catch (err) {
    console.warn("AsyncStorage clear error", err);
  }
  await clearTelemetry();
  return DEFAULT_USER_DATA;
}

export async function resetUserData(): Promise<UserData> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
  return DEFAULT_USER_DATA;
}
