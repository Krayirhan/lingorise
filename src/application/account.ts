import { AccountGateway, RemoteProgressRepository, TelemetryPort } from "./ports";

export class PartialAccountDeletionError extends Error {
  constructor(public readonly cause: unknown) {
    super("Account data was deleted, but removing the authentication credential failed.");
    this.name = "PartialAccountDeletionError";
  }
}

export function createAccountService(account: AccountGateway, remote: RemoteProgressRepository, telemetry: TelemetryPort) {
  return {
    current: account.current,
    subscribe: account.subscribe,
    async register(email: string, password: string, name: string) {
      const user = await account.register(email, password, name);
      await account.disableGuestMode();
      return user;
    },
    async login(email: string, password: string) {
      const user = await account.login(email, password);
      await account.disableGuestMode();
      return user;
    },
    logout: account.logout,
    resetPassword: account.resetPassword,
    sendVerificationEmail: account.sendVerificationEmail,
    updateDisplayName: account.updateDisplayName,
    enableGuestMode: account.enableGuestMode,
    async deleteAccount() {
      const user = account.current();
      if (!user) return;
      await remote.delete(user.uid);
      try {
        await account.deleteCredential(user.uid);
      } catch (error) {
        telemetry.track("account_deletion_partial", { phase: "auth" });
        throw new PartialAccountDeletionError(error);
      }
      await account.enableGuestMode();
    },
  };
}
