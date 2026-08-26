import { Copy, Locale } from "../../i18n/en";
import { LevelCode, MeaningMatchQuestion } from "../../types/content";
import { GardenProgress, LearningItemProgress, PracticeHistoryEntry } from "../../types/user";

export interface LevelProgressItem {
  /** False while the level lacks enough words to be worth entering. */
  isReady?: boolean;
  level: LevelCode;
  total: number;
  /** Words answered correctly at least once — real, immediate coverage. */
  seen: number;
  /** Words confirmed known across separate days — durable, not just tapped once. */
  mastered: number;
  percent: number;
}

export interface TopicProgressItem {
  topic: string;
  count: number;
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
  /** Drives the Word Notebook's real per-word mastery status (see WordNotebookModal). */
  learningProgress?: Record<string, LearningItemProgress>;
  lastActiveDate?: string;
  practiceHistory?: PracticeHistoryEntry[];
  unlockedBadges?: string[];
  onPracticeWord?: (question: MeaningMatchQuestion) => void;
  onBack: () => void;
  reduceMotion?: boolean;
  onTabPress?: (tab: "garden" | "practice" | "progress" | "profile") => void;
}
