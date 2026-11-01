declare const __DEV__: boolean | undefined;

class AppLogger {
  private isDev =
    typeof __DEV__ !== "undefined"
      ? !!__DEV__
      : typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

  public debug(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.log(`[Lingterra:DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.info(`[Lingterra:INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]) {
    console.warn(`[Lingterra:WARN] ${message}`, ...args);
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const details = error as { message?: unknown; code?: unknown } | null | undefined;
    console.error(`[Lingterra:ERROR] ${message}`, {
      error: details?.message || error,
      code: details?.code,
      context,
    });
  }
}

export const logger = new AppLogger();
