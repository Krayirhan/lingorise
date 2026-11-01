export interface WeekStripDay {
  /** YYYY-MM-DD */
  date: string;
  label: string;
  isToday: boolean;
  isActive: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The Monday-to-Sunday week that contains `todayISO`, with each day marked
 * active when the learner practised on it. Dates are handled as plain UTC
 * calendar days so the strip never shifts with the device time zone.
 *
 * `labels` are the seven short day names, Monday first.
 */
export function buildWeekStrip(
  todayISO: string,
  activeDates: readonly string[],
  labels: readonly string[],
): WeekStripDay[] {
  const today = new Date(`${todayISO}T00:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const monday = today.getTime() - mondayOffset * DAY_MS;
  const active = new Set(activeDates);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday + index * DAY_MS).toISOString().slice(0, 10);
    return {
      date,
      label: labels[index] ?? "",
      isToday: date === todayISO,
      isActive: active.has(date),
    };
  });
}
