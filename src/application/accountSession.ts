import { ProgressController } from "./progressController";
import { createSynchronization } from "./synchronization";

export function createAccountSession(
  synchronization: ReturnType<typeof createSynchronization>,
  progress: ProgressController
) {
  return {
    async synchronizeAfterSignIn(userId: string): Promise<{ status: "synchronized" } | { status: "failed"; error: unknown }> {
      try {
        await synchronization.signIn(userId);
        void progress.getSnapshot().refresh();
        return { status: "synchronized" };
      } catch (error) {
        progress.getSnapshot().reportCloudSyncFailure();
        return { status: "failed", error };
      }
    },
  };
}
