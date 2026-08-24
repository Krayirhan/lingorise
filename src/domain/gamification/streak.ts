import { nowDate } from "../../utils/clock";

export interface StreakUpdateResult {
  newStreak: number;
  todayFormatted: string;
  isNewDay: boolean;
}

export function updateDailyStreak(
  lastActiveDate: string | undefined,
  currentStreak: number
): StreakUpdateResult {
  const today = nowDate();
  const todayFormatted = today.toISOString().split("T")[0];

  if (!lastActiveDate) {
    return {
      newStreak: 1,
      todayFormatted,
      isNewDay: true,
    };
  }

  if (lastActiveDate === todayFormatted) {
    return {
      newStreak: Math.max(1, currentStreak),
      todayFormatted,
      isNewDay: false,
    };
  }

  const lastDate = new Date(lastActiveDate);
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return {
      newStreak: currentStreak + 1,
      todayFormatted,
      isNewDay: true,
    };
  }

  return {
    newStreak: 1,
    todayFormatted,
    isNewDay: true,
  };
}
