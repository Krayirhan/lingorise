/** Whole calendar days between two YYYY-MM-DD strings (positive if `toISO` is later). */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00Z`).getTime();
  const to = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export interface ClockAnomalyResult {
  isAnomalous: boolean;
  daysDifference: number | null;
}

/**
 * Detects a suspicious forward jump between the last server-confirmed date
 * and this device's current date — e.g. a manually advanced device clock
 * used to fast-forward streak/daily-quest rollover. A gap of more than one
 * day is anomalous; same-day or a single day's normal passage is not.
 */
export function detectClockAnomaly(
  lastKnownServerDate: string | undefined,
  todayFormatted: string | undefined
): ClockAnomalyResult {
  if (!lastKnownServerDate || !todayFormatted) {
    return { isAnomalous: false, daysDifference: null };
  }
  const daysDifference = daysBetween(lastKnownServerDate, todayFormatted);
  return { isAnomalous: daysDifference > 1, daysDifference };
}
