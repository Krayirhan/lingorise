import { logger } from "../utils/logger";

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 600
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error instanceof Error ? error.message : error);
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(1.5, attempt - 1)));
      }
    }
  }
  throw lastError;
}

export function isOfflineError(error: unknown): boolean {
  if (!error) return false;
  const details = error as { message?: string; code?: string };
  const msg = (details.message || details.code || "").toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("offline") ||
    msg.includes("unavailable") ||
    msg.includes("failed to fetch")
  );
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  logger.error("Reported application error:", error, context);
  // Extensible for Sentry.captureException or Firebase Crashlytics
}
