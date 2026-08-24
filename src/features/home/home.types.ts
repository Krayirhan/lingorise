import { Copy, Locale } from "../../i18n/en";
import { LevelCode } from "../../types/content";
import { DailyQuest, GardenProgress, QuestHistoryEntry } from "../../types/user";

export type HomeTab = "garden" | "practice" | "progress" | "profile";

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
  /** Words recalled reliably across every level — what the garden grows on. */
  masteredWords: number;
  questHistory: QuestHistoryEntry[];
  greetingTitle: string;
  greetingSubtitle: string;
  reviewCount: number;
  practiceRecommendation: string;
  skillProgress: SkillProgress[];
  recommendedWord: RecommendedWordData;
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
  onReviewPress: () => void;
  onWordPress?: (wordData: RecommendedWordData) => void;
  onTabPress: (tab: HomeTab) => void;
  onRefresh: () => Promise<void>;
}
