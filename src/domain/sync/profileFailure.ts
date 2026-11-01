export type ProfileFailure = "permission" | "connection" | "data" | "storage" | "unknown";

/** Only classify bounded codes; never expose error messages containing user data. */
export function classifyProfileFailure(error: unknown): ProfileFailure {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const value = current as { code?: unknown; name?: unknown; cause?: unknown };
    const code = typeof value.code === "string" ? value.code.toLowerCase() : "";
    if (code.includes("permission-denied") || code.includes("unauthenticated")) return "permission";
    if (code.includes("unavailable") || code.includes("network") || code.includes("deadline-exceeded")) return "connection";
    if (code.includes("invalid-argument") || code.includes("failed-precondition")) return "data";
    if (code.includes("storage") || value.name === "QuotaExceededError") return "storage";
    current = value.cause;
  }
  return "unknown";
}
