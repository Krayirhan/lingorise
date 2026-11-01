/** Reads error details from SDK or application errors without exposing SDK types. */
export function errorDetail(error: unknown, field: "code" | "message"): string | undefined {
  if (!error || typeof error !== "object" || !(field in error)) return undefined;
  const value = (error as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
}
