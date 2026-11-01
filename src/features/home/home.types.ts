import { Copy, Locale } from "../../i18n/en";
import { LevelCode } from "../../domain/models/content";
import { DailyQuest, GardenProgress, QuestHistoryEntry } from "../../domain/models/user";
import { WeekStripDay } from "./weekStripModel";
import type { HomeTab } from "../../components/navigation";

/** Navigation tabs are shared app-wide; re-exported for the home feature. */
export type { HomeTab };

export interface SkillProgress {
  id: string;
  title: string;
  meta: string;
  percent: number;
  isReady: boolean;
  icon: string;
}

export interface RecommendedWordData {
  word: string;
  meaning: string;
  level: LevelCode;
  topic: string;
  phonetic?: string;
  pronunciation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

/** A learned word shown in the home collection strip. */
export interface CollectedWord extends RecommendedWordData {
  id: string;
}

export type PracticeState = "not_started" | "in_progress" | "completed";

export interface HomeViewModel {
  level: LevelCode;
  xp: number;
  streak: number;
  stageName: string;
  gardenProgress: GardenProgress;
  dailyQuests: DailyQuest[];
  isDailyCompleted?: boolean;
  practiceState: PracticeState;
  practiceCompletedCount: number;
  practiceTargetCount: number;
  /** XP actually banked today, from practice history. */
  dailyXpEarned: number;
  /** XP a fully completed day is worth, including the quest bonus. */
  dailyXpTarget: number;
  /** One-based unit the learner is working through, e.g. 3 of 11. */
  unitNumber: number;
  unitCount: number;
  unitLearned: number;
  unitTotal: number;
  /** True once every word in the current level has been rewarded — buildDailySession has nothing left to draw from (CORE-004). */
  isLevelFullyLearned: boolean;
  /** Words recalled reliably across every level — what the garden grows on. */
  masteredWords: number;
  questHistory: QuestHistoryEntry[];
  /** Time-of-day salutation (morning / afternoon / evening) read from the app clock. */
  greetingEyebrow: string;
  greetingTitle: string;
  greetingSubtitle: string;
  skillProgress: SkillProgress[];
  recommendedWord: RecommendedWordData;
  /** Monday-to-Sunday practice days for the streak strip. */
  weekStrip: WeekStripDay[];
  /** Most recently learned words in the current level, newest first. */
  collection: CollectedWord[];
  badges: string[];
}

export interface HomeScreenProps {
  copy: Copy;
  locale: Locale;
  viewModel: HomeViewModel;
  activeTab?: HomeTab;
  onLevelPress: () => void;
  onQuestPress: () => void;
  onPracticePress?: () => void;
  onWordPress?: (wordData: RecommendedWordData) => void;
  onTabPress: (tab: HomeTab) => void;
  onRefresh: () => Promise<void>;
  reduceMotion?: boolean;
  showGardenExplainer?: boolean;
  onDismissGardenExplainer?: () => void;
}
