import { createDailyQuests } from "../gamification/badges";
import { UserData } from "../models/user";

export const CURRENT_SCHEMA_VERSION = 4;

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
  topicAssessments: {},
  productionAttempts: [],
  celebratedLevels: [],
  passedLevelExams: [],
  practiceHistory: [],
  questHistory: [],
  activeSession: null,
};

