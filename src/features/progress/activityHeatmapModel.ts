export interface HeatmapDay {
  /** YYYY-MM-DD */
  date: string;
  /** 0 = no practice, 1–3 = increasing number of answers that day. */
  intensity: 0 | 1 | 2 | 3;
  isToday: boolean;
  isFuture: boolean;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
  /** Zero-based month index when this week holds the 1st of a month, else null. */
  monthStart: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function intensityFor(answers: number): HeatmapDay["intensity"] {
  if (answers <= 0) return 0;
  if (answers < 10) return 1;
  if (answers < 20) return 2;
  return 3;
}

/**
 * The last `weeks` Monday-to-Sunday weeks ending with the week of `todayISO`,
 * oldest first. Days are plain UTC calendar dates so the grid never shifts
 * with the device time zone.
 */
export function buildActivityHeatmap(
  todayISO: string,
  history: readonly { date: string; answers: number }[],
  weeks = 12,
): HeatmapWeek[] {
  const answersByDate = new Map<string, number>();
  for (const entry of history) {
    answersByDate.set(entry.date, (answersByDate.get(entry.date) ?? 0) + entry.answers);
  }

  const today = new Date(`${todayISO}T00:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const firstMonday = today.getTime() - (mondayOffset + (weeks - 1) * 7) * DAY_MS;

  return Array.from({ length: weeks }, (_, weekIndex) => {
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(firstMonday + (weekIndex * 7 + dayIndex) * DAY_MS).toISOString().slice(0, 10);
      return {
        date,
        intensity: intensityFor(answersByDate.get(date) ?? 0),
        isToday: date === todayISO,
        isFuture: date > todayISO,
      };
    });
    const firstOfMonth = days.find((day) => day.date.endsWith("-01"));
    return { days, monthStart: firstOfMonth ? Number(firstOfMonth.date.slice(5, 7)) - 1 : null };
  });
}
