export type PracticeSessionMode = "PRACTICE" | "EXAM" | "CHECKPOINT";

/** Retrying is only available in practice; scored assessment attempts stay fixed. */
export function getRetryAction(mode: PracticeSessionMode, onRetry: () => void): (() => void) | undefined {
  return mode === "PRACTICE" ? onRetry : undefined;
}
