import { isOfflineError } from "../../src/infrastructure/errorReporter";
import { assert } from "../support/assertions";

// 13. Async Retry & Offline Resilience
console.log("\n13. Async Retry & Error Handling:");
export const isNetErr = isOfflineError(new Error("network error: failed to fetch"));
assert(isNetErr === true, "isOfflineError accurately detects network disconnect errors");
export const isRegularErr = isOfflineError(new Error("validation failed"));
assert(isRegularErr === false, "isOfflineError returns false for non-network errors");

