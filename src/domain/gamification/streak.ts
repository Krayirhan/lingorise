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

  // A clock correction (NTP resync, timezone change, manual adjustment) can
  // make "today" appear on or before lastActiveDate without an exact string
  // match above (e.g. a date-only diff of 0 computed from differing
  // times-of-day, or a genuinely backward jump). That is not a missed day —
  // treat it as a no-op rather than punishing the streak for the device
  // clock moving the wrong way.
  if (diffDays <= 0) {
    return {
      newStreak: Math.max(1, currentStreak),
      todayFormatted,
      isNewDay: false,
    };
  }

  return {
    newStreak: 1,
    todayFormatted,
    isNewDay: true,
  };
}
