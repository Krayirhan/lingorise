import { PracticeState } from "./home.types";

export interface GardenHeroModel {
  isCompleted: boolean;
  isInProgress: boolean;
  isLevelDone: boolean;
  showPracticeAgain: boolean;
  onCtaPress: () => void;
}

export function createGardenHeroModel({
  practiceState,
  isDailyCompleted = false,
  isLevelFullyLearned = false,
  onPress,
  onViewProgress,
  onPracticeAgain,
  onGoToPracticeHub,
}: {
  practiceState: PracticeState;
  isDailyCompleted?: boolean;
  isLevelFullyLearned?: boolean;
  onPress: () => void;
  onViewProgress?: () => void;
  onPracticeAgain?: () => void;
  onGoToPracticeHub?: () => void;
}): GardenHeroModel {
  const isCompleted = practiceState === "completed" || isDailyCompleted;
  const isInProgress = practiceState === "in_progress" && !isCompleted;
  const isLevelDone = isLevelFullyLearned;
  return {
    isCompleted,
    isInProgress,
    isLevelDone,
    showPracticeAgain: isCompleted && !isLevelDone,
    onCtaPress: isLevelDone
      ? onGoToPracticeHub || onViewProgress || onPress
      : isCompleted
        ? onViewProgress || onPress
        : onPress,
  };
}
