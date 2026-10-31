import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { UserData } from "../domain/models/user";
import { decideMergeAction, RemoteStateUnknownError } from "../domain/sync/remoteSync";
import { Clock, LocalProgressRepository, RemoteProgressRepository, TelemetryPort } from "./ports";

export function createSynchronization(local: LocalProgressRepository, remote: RemoteProgressRepository, clock: Clock, telemetry: TelemetryPort) {
  async function mergeAndSync(userId: string, data: UserData) {
    const decision = decideMergeAction(await remote.fetch(userId), data, clock.nowDate());
    if (decision.action === "unknown-remote-state") throw new RemoteStateUnknownError(decision.error);
    await remote.saveProfile(userId, decision.data);
    await remote.saveProgress(userId, decision.data);
    return decision.data;
  }
  return {
    mergeAndSync,
    async signIn(userId: string) {
      const { data } = rolloverToToday(await local.load(), clock.nowDate());
      const merged = await mergeAndSync(userId, data);
      await local.save(merged);
      return merged;
    },
    async resetLocal() {
      const result = await local.clear();
      await telemetry.clear();
      return result;
    },
  };
}
