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

type RawUserData = Partial<UserData> & {
  reviewQueue?: LegacyReviewItem[];
  schemaVersion?: number;
};

const STORAGE_KEY = "@lingorise_user_data_v2";
const LEGACY_STORAGE_KEY = "@lingorise_user_data_v1";

/**
 * Migration versioning (roadmap Birim 8.1 / 20). Each version corresponds to
 * one real schema change this app has gone through:
 *   v1 — pre-mastery-tracking data: only solvedQuestionIds and/or the old
 *        mistake queue (`reviewQueue`) existed, no learningProgress at all.
 *   v2 — learningProgress introduced (Sprint 1-2), but quest records could
 *        still carry the old target:2 shape from before the daily-rollover
 *        rewrite.
 *   v3 — current: schemaVersion is stamped explicitly, quests always carry
 *        the post-rollover shape.
 * migrateV1ToV2 and migrateV2ToV3 below are the two isolated, single-
 * responsibility steps the roadmap originally asked for (Birim 8's DoD:
 * "her göç izole bir fonksiyon haline getirir"). A future v4 needs only a
 * new migrateV3ToV4 appended to the pipeline in normalizeUserData —
 * neither existing step has to be touched.
 */
export const CURRENT_SCHEMA_VERSION = 3;

/** Infers the version of data written before schemaVersion existed. */
function detectStoredSchemaVersion(data: RawUserData): number {
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

/** Strips a stale seeded-demo profile back to real defaults, keeping only the choices an actual user could have made (locale, level, settings). Not a version migration — this predates schemaVersion entirely and can hit data at any version. */
function stripSeededDemoProfile(data: RawUserData): RawUserData {
  if (!isSeededDemoProfile(data)) return data;
  return {
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
  };
}

/**
 * The per-word repair/synthesis logic migrateV1ToV2 depends on. A solved id
 * only ever meant "answered right once", so it is adopted as `learning` —
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
 * v1 → v2: the pre-mastery-tracking shape — only solvedQuestionIds and/or
 * the old mistake queue — gets a real per-word learningProgress record for
 * the first time.
 *
 * This step intentionally still detects its own input by SHAPE (does a
 * structured learningProgress object already exist?) inside
 * migrateLearningProgress, rather than trusting the caller's version number
 * to decide whether to run at all. That is not an oversight: it makes the
 * step idempotent and self-healing, so it stays safe to run unconditionally
 * on every load — not gated to "only when version < 2" — repairing a record
 * with a missing serverSyncedAt or a stale derived `status` even on data
 * that is already nominally current. A version-number gate alone would lose
 * that safety net the first time schemaVersion itself is missing, wrong, or
 * from a future app version being opened on an older build.
 */
export function migrateV1ToV2(data: RawUserData): RawUserData {
  const legacyReviewQueue: LegacyReviewItem[] = Array.isArray(data.reviewQueue) ? data.reviewQueue : [];
  return {
    ...data,
    learningProgress: migrateLearningProgress(
      data.learningProgress,
      Array.isArray(data.solvedQuestionIds) ? data.solvedQuestionIds : [],
      legacyReviewQueue
    ),
  };
}

/**
 * Quests saved before the daily-rollover rewrite counted "answers submitted"
 * with a target of 2 while the UI promised a full session. Detected by
 * shape (see migrateV1ToV2's comment for why), not by trusting a version
 * number.
 */
function isLegacyQuestSet(quests: unknown): boolean {
  if (!Array.isArray(quests) || quests.length === 0) return true;
  const practice = quests.find((quest) => quest?.id === DAILY_QUEST_PRACTICE_ID);
  return !practice || typeof practice.target !== "number" || practice.target <= 2;
}

/**
 * v2 → v3: reissues quest records still carrying the pre-daily-rollover
 * shape, so nobody is left staring at a permanently completed two-step day.
 * Same self-detecting design as migrateV1ToV2, for the same reason.
 */
export function migrateV2ToV3(data: RawUserData): RawUserData {
  if (!isLegacyQuestSet(data.dailyQuests)) return data;
  const sessionSize = [5, 10, 20, 30].includes(data.practiceSessionSize as number)
    ? (data.practiceSessionSize as number)
    : DEFAULT_USER_DATA.practiceSessionSize;
  const hadLegacyReviewQueue = Array.isArray(data.reviewQueue) && data.reviewQueue.length > 0;
  return {
    ...data,
    dailyQuests: createDailyQuests(sessionSize, hadLegacyReviewQueue),
  };
}

/**
 * Fills in safe defaults for any field that is missing or malformed. This is
 * NOT a version migration — it is defensive normalization that must run on
 * every load regardless of schema version, since storage can be corrupted,
 * partially written, or simply new (a fresh install with no legacy shape at
 * all). By the time this runs, migrateV1ToV2/migrateV2ToV3 have already
 * guaranteed learningProgress and dailyQuests are well-formed, so this only
 * has to defend the remaining fields.
 */
function fillDefaults(parsed: RawUserData): UserData {
  return {
    ...DEFAULT_USER_DATA,
    ...parsed,
    dailyGoalMinutes: parsed.dailyGoalMinutes || DEFAULT_USER_DATA.dailyGoalMinutes,
    practiceSessionSize: [5, 10, 20, 30].includes(parsed.practiceSessionSize as number)
      ? (parsed.practiceSessionSize as 5 | 10 | 20 | 30)
      : DEFAULT_USER_DATA.practiceSessionSize,
    notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_USER_DATA.notificationsEnabled,
    soundEnabled: parsed.soundEnabled ?? DEFAULT_USER_DATA.soundEnabled,
    reduceMotion: parsed.reduceMotion ?? DEFAULT_USER_DATA.reduceMotion,
    avatarId: parsed.avatarId || DEFAULT_USER_DATA.avatarId,
    displayName: parsed.displayName || DEFAULT_USER_DATA.displayName,
    favoriteWordIds: Array.isArray(parsed.favoriteWordIds) ? parsed.favoriteWordIds : [],
    solvedQuestionIds: Array.isArray(parsed.solvedQuestionIds) ? parsed.solvedQuestionIds : [],
    rewardedQuestionIds: Array.isArray(parsed.rewardedQuestionIds) ? parsed.rewardedQuestionIds : [],
    unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    dailyQuests: (parsed.dailyQuests as UserData["dailyQuests"]) || DEFAULT_USER_DATA.dailyQuests,
    dailyReviewXpIds: Array.isArray(parsed.dailyReviewXpIds) ? parsed.dailyReviewXpIds : [],
    learningProgress: (parsed.learningProgress as Record<string, LearningItemProgress>) || {},
    celebratedLevels: Array.isArray(parsed.celebratedLevels) ? parsed.celebratedLevels : [],
    practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
    questHistory: Array.isArray(parsed.questHistory) ? parsed.questHistory : [],
    activeSession: parsed.activeSession || null,
  };
}

/** Migrates persisted data through every version step and fills in safe defaults. */
export function normalizeUserData(data: Partial<UserData>): UserData {
  const stripped = stripSeededDemoProfile(data as RawUserData);
  const v2 = migrateV1ToV2(stripped);
  const v3 = migrateV2ToV3(v2);
  return { ...fillDefaults(v3), schemaVersion: CURRENT_SCHEMA_VERSION };
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

/** Returns false on failure instead of swallowing it, so callers can surface a signal to the user on repeated failures. */
export async function saveUserData(data: UserData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("LingoRise: Error saving user data", error);
    return false;
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
