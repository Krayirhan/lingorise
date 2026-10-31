declare const __DEV__: boolean | undefined;

type LogLevel = "debug" | "info" | "warn" | "error";

class AppLogger {
  private isDev =
    typeof __DEV__ !== "undefined"
      ? !!__DEV__
      : typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

  public debug(message: string, ...args: any[]) {
    if (this.isDev) {
      console.log(`[Lingterra:DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]) {
    if (this.isDev) {
      console.info(`[Lingterra:INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    console.warn(`[Lingterra:WARN] ${message}`, ...args);
  }

  public error(message: string, error?: any, context?: Record<string, any>) {
    console.error(`[Lingterra:ERROR] ${message}`, {
      error: error?.message || error,
      code: error?.code,
      context,
    });
  }
}

export const logger = new AppLogger();
