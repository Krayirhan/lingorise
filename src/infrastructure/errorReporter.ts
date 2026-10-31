import { logger } from "../utils/logger";

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 600
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error?.message || error);
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(1.5, attempt - 1)));
      }
    }
  }
  throw lastError;
}

export function isOfflineError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.code || "").toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("offline") ||
    msg.includes("unavailable") ||
    msg.includes("failed to fetch")
  );
}

export function reportError(error: any, context?: Record<string, any>) {
  logger.error("Reported application error:", error, context);
  // Extensible for Sentry.captureException or Firebase Crashlytics
}
