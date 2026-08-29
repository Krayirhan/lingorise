import { UserData } from "../../types/user";
import { normalizeUserData } from "../../services/storage";
import { mergeUserData } from "./progressMerge";

/**
 * Distinguishes "no cloud document exists for this user" from "we could not
 * find out" — a transient network/service failure must never be treated as
 * an empty remote account (DATA-QA-001 / GLOBAL-QA-003): doing so could
 * authorize overwriting real remote progress with incomplete local state.
 *
 * Deliberately kept free of any Firebase SDK import (unlike
 * `src/services/firestore.ts`, which owns the actual I/O) so it — and the
 * pure decision logic below — can be unit-tested directly, without a live or
 * mocked Firestore SDK.
 */
export type RemoteUserDataResult =
  | { status: "found"; data: UserData }
  | { status: "absent" }
  | { status: "failed"; error: unknown };

/** Thrown when the remote document's existence/state genuinely could not be determined. */
export class RemoteStateUnknownError extends Error {
  constructor(cause: unknown) {
    super("Remote user data state is unknown (fetch failed)");
    this.name = "RemoteStateUnknownError";
    this.cause = cause;
  }
}

export type MergeDecision =
  | { action: "unknown-remote-state"; error: unknown }
  | { action: "first-sync"; data: UserData }
  | { action: "merge"; data: UserData };

/**
 * The pure decision behind `mergeAndSyncUserData` (src/services/firestore.ts)
 * — split out so it can be unit-tested with a synthetic `RemoteUserDataResult`,
 * no live/mocked Firestore SDK required. A failed remote read must never be
 * treated like an absent document; this function is what that guarantee
 * actually rests on, and what `mergeAndSyncUserData` merely executes.
 */
export function decideMergeAction(remoteResult: RemoteUserDataResult, localData: UserData): MergeDecision {
  if (remoteResult.status === "failed") {
    return { action: "unknown-remote-state", error: remoteResult.error };
  }
  if (remoteResult.status === "absent") {
    return { action: "first-sync", data: localData };
  }
  const remote = normalizeUserData(remoteResult.data);
  return { action: "merge", data: mergeUserData(localData, remote) };
}
