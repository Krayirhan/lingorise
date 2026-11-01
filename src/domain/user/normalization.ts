import { DAILY_QUEST_PRACTICE_ID } from "../gamification/badges";
import { ActiveSessionState, LearningItemProgress, UserData } from "../models/user";
import { CURRENT_SCHEMA_VERSION, DEFAULT_USER_DATA } from "./userDefaults";
import { migrateV1ToV2, migrateV2ToV3 } from "./migrations";
import { RawUserData } from "./migrationTypes";
export { CURRENT_SCHEMA_VERSION, DEFAULT_USER_DATA } from "./userDefaults";
export { isLegacyQuestSet, migrateV1ToV2, migrateV2ToV3 } from "./migrations";
export type { RawUserData } from "./migrationTypes";

function normalizeActiveSession(value: unknown, now: () => number): ActiveSessionState | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ActiveSessionState>;
  if (!Array.isArray(raw.questionIds) || raw.questionIds.length === 0) return null;
  const questionIds = raw.questionIds.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (questionIds.length === 0) return null;
  const answers = Array.isArray(raw.answers)
    ? raw.answers.filter((answer) => answer && typeof answer.questionId === "string")
      .map((answer) => ({
        questionId: answer.questionId,
        isCorrect: Boolean(answer.isCorrect),
        xpEarned: typeof answer.xpEarned === "number" && Number.isFinite(answer.xpEarned) ? Math.max(0, answer.xpEarned) : 0,
      }))
    : [];
  const currentIndex = typeof raw.currentIndex === "number" && Number.isFinite(raw.currentIndex)
    ? Math.max(0, Math.min(Math.floor(raw.currentIndex), questionIds.length - 1))
    : 0;
  return {
    sessionId: typeof raw.sessionId === "string" ? raw.sessionId : undefined,
    catalogVersion: typeof raw.catalogVersion === "string" ? raw.catalogVersion : undefined,
    questionIds,
    currentIndex,
    answers,
    sessionMode: raw.sessionMode === "EXAM" || raw.sessionMode === "CHECKPOINT" ? raw.sessionMode : "PRACTICE",
    startedAt: typeof raw.startedAt === "number" && Number.isFinite(raw.startedAt) ? raw.startedAt : now(),
    pickedAnswer: typeof raw.pickedAnswer === "string" ? raw.pickedAnswer : null,
    submitted: Boolean(raw.submitted),
    writingOffer: raw.writingOffer && questionIds.includes(raw.writingOffer.questionId) && ["offered", "open", "done"].includes(raw.writingOffer.status)
      ? raw.writingOffer : undefined,
    reversedOptions: raw.reversedOptions && typeof raw.reversedOptions === "object" && !Array.isArray(raw.reversedOptions)
      ? Object.fromEntries(Object.entries(raw.reversedOptions).filter(([id, options]) => questionIds.includes(id) && Array.isArray(options) && options.length >= 2 && options.length <= 4 && options.every((option) => typeof option === "string")))
      : undefined,
  };
}

/**
 * Migration versioning (roadmap Birim 8.1 / 20). Each version corresponds to
 * one real schema change this app has gone through:
 *   v1 — pre-mastery-tracking data: only solvedQuestionIds and/or the old
 *        mistake queue (`reviewQueue`) existed, no learningProgress at all.
 *   v2 — learningProgress introduced (Sprint 1-2), but quest records could
 *        still carry the old target:2 shape from before the daily-rollover
 *        rewrite.
 *   v3 — schemaVersion is stamped explicitly, quests always carry the
 *        post-rollover shape.
 *   v4 — topic checkpoint results are persisted in topicAssessments.
 * migrateV1ToV2 and migrateV2ToV3 below are the two isolated, single-
 * responsibility steps the roadmap originally asked for (Birim 8's DoD:
 * "her göç izole bir fonksiyon haline getirir"). A future v4 needs only a
 * new migrateV3ToV4 appended to the pipeline in normalizeUserData —
 * neither existing step has to be touched.
 */
/** Infers the version of data written before schemaVersion existed. */
export function detectStoredSchemaVersion(data: RawUserData): number {
  if (typeof data.schemaVersion === "number") return data.schemaVersion;
  if (data.learningProgress && typeof data.learningProgress === "object" && !Array.isArray(data.learningProgress)) {
    return 2;
  }
  if (Array.isArray(data.solvedQuestionIds) || Array.isArray(data.reviewQueue)) return 1;
  return CURRENT_SCHEMA_VERSION; // no recognizable legacy shape — nothing to migrate
}

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
    displayName: data.displayName === "LingoRise Bahçıvanı" || data.displayName === "Lingterra Bahçıvanı" ? "" : data.displayName,
  };
}

/**
 * The per-word repair/synthesis logic migrateV1ToV2 depends on. A solved id
 * only ever meant "answered right once", so it is adopted as `learning` —
 * claiming anything stronger would recreate the inflated percentages this
 * record exists to replace.
 */
function fillDefaults(parsed: RawUserData, now: () => number): UserData {
  const practiceSessionSize = [5, 10, 20, 30].includes(parsed.practiceSessionSize as number)
    ? (parsed.practiceSessionSize as 5 | 10 | 20 | 30)
    : DEFAULT_USER_DATA.practiceSessionSize;
  const rawQuests = (parsed.dailyQuests as UserData["dailyQuests"]) || DEFAULT_USER_DATA.dailyQuests;
  const dailyQuests = rawQuests.map((quest) => {
    if (quest.id !== DAILY_QUEST_PRACTICE_ID) return quest;
    if (![5, 10, 20, 30].includes(quest.target) || quest.target === practiceSessionSize) return quest;
    const current = Math.min(quest.current, practiceSessionSize);
    return {
      ...quest,
      target: practiceSessionSize,
      current,
      completed: current >= practiceSessionSize,
    };
  });
  return {
    ...DEFAULT_USER_DATA,
    ...parsed,
    dailyGoalMinutes: parsed.dailyGoalMinutes || DEFAULT_USER_DATA.dailyGoalMinutes,
    practiceSessionSize,
    notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_USER_DATA.notificationsEnabled,
    soundEnabled: parsed.soundEnabled ?? DEFAULT_USER_DATA.soundEnabled,
    reduceMotion: parsed.reduceMotion ?? DEFAULT_USER_DATA.reduceMotion,
    avatarId: parsed.avatarId || DEFAULT_USER_DATA.avatarId,
    displayName: parsed.displayName || DEFAULT_USER_DATA.displayName,
    favoriteWordIds: Array.isArray(parsed.favoriteWordIds) ? parsed.favoriteWordIds : [],
    solvedQuestionIds: Array.isArray(parsed.solvedQuestionIds) ? parsed.solvedQuestionIds : [],
    rewardedQuestionIds: Array.isArray(parsed.rewardedQuestionIds) ? parsed.rewardedQuestionIds : [],
    unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    dailyQuests,
    dailyReviewXpIds: Array.isArray(parsed.dailyReviewXpIds) ? parsed.dailyReviewXpIds : [],
    learningProgress: (parsed.learningProgress as Record<string, LearningItemProgress>) || {},
    topicAssessments: parsed.topicAssessments && typeof parsed.topicAssessments === "object" && !Array.isArray(parsed.topicAssessments)
      ? parsed.topicAssessments
      : {},
    productionAttempts: Array.isArray(parsed.productionAttempts) ? parsed.productionAttempts : [],
    celebratedLevels: Array.isArray(parsed.celebratedLevels) ? parsed.celebratedLevels : [],
    passedLevelExams: Array.isArray(parsed.passedLevelExams) ? parsed.passedLevelExams : [],
    practiceHistory: Array.isArray(parsed.practiceHistory) ? parsed.practiceHistory : [],
    questHistory: Array.isArray(parsed.questHistory) ? parsed.questHistory : [],
    activeSession: normalizeActiveSession(parsed.activeSession, now),
  };
}

/** Migrates persisted data through every version step and fills in safe defaults. */
export function normalizeUserData(data: Partial<UserData>, now: () => number = Date.now): UserData {
  const stripped = stripSeededDemoProfile(data as RawUserData);
  const v2 = migrateV1ToV2(stripped, now);
  const v3 = migrateV2ToV3(v2);
  return { ...fillDefaults(v3, now), schemaVersion: CURRENT_SCHEMA_VERSION };
}

