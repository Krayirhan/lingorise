import { Copy, Locale } from "../../i18n/en";
import { LevelCode, MeaningMatchQuestion } from "../../domain/models/content";
import { GardenProgress, PracticeHistoryEntry } from "../../domain/models/user";

export interface LevelProgressItem {
  /** False while the level lacks enough words to be worth entering. */
  isReady?: boolean;
  level: LevelCode;
  total: number;
  /** Words answered correctly at least once. */
  seen: number;
  /** Whether this level's completion exam has been passed (domain/learning/levelExam.ts). */
  examPassed: boolean;
}

export interface TopicProgressItem {
  topicId: string;
  topic: string;
  objective: string;
  total: number;
  seen: number;
  reliable: number;
  percent: number;
  state: "locked" | "available" | "in_progress" | "assessment_due" | "completed" | "mastered";
}

export interface ProgressScreenProps {
  copy: Copy;
  locale: Locale;
  xp: number;
  streak: number;
  level: LevelCode;
  gardenProgress: GardenProgress;
  totalSolved: number;
  /** Words the learner has met at least once, for the notebook. */
  seenWordCount: number;
  /** Pool the notebook is measured against — the learner's own level. */
  levelWordCount: number;
  levelProgressList: LevelProgressItem[];
  topicBreakdown: TopicProgressItem[];
  solvedQuestionIds?: string[];
  lastActiveDate?: string;
  practiceHistory?: PracticeHistoryEntry[];
  unlockedBadges?: string[];
  onPracticeWord?: (question: MeaningMatchQuestion) => void;
  onBack: () => void;
  reduceMotion?: boolean;
  onTabPress?: (tab: "garden" | "practice" | "progress" | "profile") => void;
}
