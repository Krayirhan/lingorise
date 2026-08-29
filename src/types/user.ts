import { LevelCode } from "./content";
import { Locale } from "../i18n/en";

export type GardenStage = "sprout" | "leaf" | "bud" | "flower" | "bloom_tree";

export interface GardenProgress {
  stage: GardenStage;
  stageNameTr: string;
  stageNameEn: string;
  gardenLevel: number;
  stageProgressPercent: number;
  /** Mastered-word count at which this stage began. */
  stageStartWords: number;
  /** Mastered-word count that unlocks the next stage. */
  nextStageThresholdWords: number;
}

/**
 * A word that is due to be asked again. Derived from learningProgress rather
 * than stored, so the schedule can never drift from the recall record.
 */
export interface ReviewItem {
  questionId: string;
  nextReviewAt: number;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
}

export interface Badge {
  id: string;
  code: string;
  titleKey: string;
  descKey: string;
  icon: string;
  unlockedAt?: number;
}

export interface DailyQuest {
  id: string;
  titleKey: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
}

export interface PracticeHistoryEntry {
  date: string;
  answers: number;
  correct: number;
  xp: number;
}

export interface QuestHistoryEntry {
  date: string; // YYYY-MM-DD
  questId: string;
  completedAt: string;
}

export interface ActiveSessionState {
  questionIds: string[];
  currentIndex: number;
  answers: { questionId: string; isCorrect: boolean; xpEarned: number }[];
  sessionMode: "PRACTICE" | "EXAM";
  startedAt: number;
}

export type LearningStatus = "new" | "learning" | "review" | "mastered";

export interface LearningItemProgress {
  status: LearningStatus;
  attempts: number;
  correctCount: number;
  wrongCount: number;
  /** Consecutive wrong answers. Mirrors `repetitions` (consecutive correct) but counts the opposite streak — resets to 0 on any correct answer. */
  consecutiveWrongCount?: number;
  /** Consecutive correct recalls. A wrong answer sends this back to zero. */
  repetitions: number;
  /** Separate calendar days this word was recalled correctly. */
  distinctCorrectDays: number;
  /** Guards distinctCorrectDays against same-day double counting. */
  lastCorrectDate?: string;
  /** Current spacing in days; grows with each successful recall. */
  intervalDays: number;
  /** SM-2 ease. Harder words earn shorter intervals. */
  easeFactor: number;
  /** When this word should be asked again, epoch ms. */
  nextReviewAt: number;
  lastAnsweredAt?: number;
  /**
   * Firestore server time (epoch ms) of this record's last successful cloud
   * sync. Device clocks can be skewed or simply wrong; this cannot be, which
   * is why cross-device merge prefers it over lastAnsweredAt when both sides
   * have one. Undefined until a record has synced at least once.
   */
  serverSyncedAt?: number;
}

export interface UserData {
  onboardingCompleted?: boolean;
  xp: number;
  level: LevelCode;
  /**
   * Epoch ms of the last deliberate `level` change on this device (manual
   * switch via LevelSwitcherModal, onboarding choice, or automatic
   * promotion). `level` is a free, always-available content-selection
   * preference — not a monotonic achievement like `passedLevelExams` — so a
   * cross-device merge must prefer whichever side changed it more recently,
   * not whichever side happens to be "higher" (DATA-QA-005). Absent on data
   * written before this field existed; merge falls back to the pre-existing
   * higher-level heuristic only when neither side has a timestamp.
   */
  levelSetAt?: number;
  locale: Locale;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoalMinutes: 2 | 5 | 10 | 15;
  practiceSessionSize: 5 | 10 | 20 | 30;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  avatarId: string;
  displayName: string;
  favoriteWordIds: string[];
  solvedQuestionIds: string[];
  rewardedQuestionIds: string[];
  unlockedBadges: string[];
  dailyQuests: DailyQuest[];
  /** Words that already paid out review XP today; cleared on daily rollover. */
  dailyReviewXpIds: string[];
  /**
   * Per-word recall record, keyed by question id. This — not
   * solvedQuestionIds — is what every progress percentage is measured from.
   */
  learningProgress: Record<string, LearningItemProgress>;
  /** Levels whose completion has already been celebrated, so it happens once. */
  celebratedLevels: string[];
  /**
   * Levels the learner has passed the completion exam for (60 questions
   * drawn from the whole level, 50+ correct to pass — see
   * domain/learning/levelExam.ts). This, not per-word mastery, is what
   * "finishing" a level means and what gates promotion to the next one.
   */
  passedLevelExams: LevelCode[];
  practiceHistory: PracticeHistoryEntry[];
  questHistory: QuestHistoryEntry[];
  activeSession?: ActiveSessionState | null;
  lastSyncSuccessAt?: number;
  /** Last known server date (YYYY-MM-DD or server timestamp) to detect clock anomalies. */
  lastKnownServerDate?: string;
  /** Storage schema version this record was last normalized to. Absent on data written before Sprint 8. */
  schemaVersion?: number;
  /**
   * Whether the learner has been shown the one-time explainer that the
   * garden grows from mastered words across EVERY level, while the daily
   * unit chip next to it tracks only the current level (roadmap Birim
   * 11.1/11.4 — finishing a level does not by itself move the garden stage,
   * and that was never explained anywhere).
   */
  hasSeenGardenExplainer?: boolean;
  lastCompletedWord?: {
    word: string;
    meaning: string;
    level: LevelCode;
  };
}
