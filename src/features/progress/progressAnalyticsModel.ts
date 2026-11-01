import { PracticeHistoryEntry } from "../../domain/models/user";

export interface ProgressAnalytics {
  answered: number;
  correct: number;
  accuracy: number;
}

export function buildProgressAnalytics(practiceHistory: PracticeHistoryEntry[]): ProgressAnalytics {
  const answered = practiceHistory.reduce((sum, entry) => sum + entry.answers, 0);
  const correct = practiceHistory.reduce((sum, entry) => sum + entry.correct, 0);

  return {
    answered,
    correct,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
  };
}
