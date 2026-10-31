import { Dispatch, SetStateAction } from "react";
import { createLearningCatalogue } from "../application/learningCatalogue";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
import { Copy } from "../i18n/en";
import { HomeTab, HomeViewModel } from "../features/home/home.types";
import { useAppSession } from "../state/useAppSession";
import { useUserProgress } from "../state/useUserProgress";

export interface MainRouteDependencies {
  userData: UserData;
  copy: Copy;
  homeViewModel: HomeViewModel;
  getQuestionsByLevel: (level: LevelCode) => MeaningMatchQuestion[];
  isLevelReady: (level: LevelCode) => boolean;
  getTopicProgressSummaries: ReturnType<typeof createLearningCatalogue>["getTopicProgressSummaries"];
  getNextCurriculumLesson: ReturnType<typeof createLearningCatalogue>["getNextCurriculumLesson"];
  getPendingTopicCheckpoint: ReturnType<typeof createLearningCatalogue>["getPendingTopicCheckpoint"];
  allQuestions: MeaningMatchQuestion[];
  isExamAvailable: (level: LevelCode) => boolean;
  startPracticeSafe: (questions?: MeaningMatchQuestion[], reverseMode?: boolean) => void;
  startExamSafe: () => void;
  setPracticeSessionSize: ReturnType<typeof useUserProgress>["setPracticeSessionSize"];
  setLocale: ReturnType<typeof useUserProgress>["setLocale"];
  setLevel: ReturnType<typeof useUserProgress>["setLevel"];
  session: ReturnType<typeof useAppSession>;
  userProgress: ReturnType<typeof useUserProgress>;
  onAccountPress?: () => void;
  markGardenExplainerSeen: ReturnType<typeof useUserProgress>["markGardenExplainerSeen"];
  handleTabPress: (tab: HomeTab) => void;
  setLevelSwitcherOpen: Dispatch<SetStateAction<boolean>>;
}
