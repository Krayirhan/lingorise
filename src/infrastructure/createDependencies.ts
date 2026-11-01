import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { deleteUser, onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { Account, ApplicationDependencies } from "../application/ports";
import { normalizeUserData } from "../domain/user/normalization";
import { B1_WRITING_TASKS } from "../content/b1WritingPilot";
import * as clock from "../utils/clock";
import * as account from "./auth";
import { loadCatalogue } from "./catalogueService";
import { auth } from "./firebase";
import * as remote from "./firestore";
import * as notifications from "./notificationService";
import { speechService } from "./speechService";
import * as local from "./storage";
import * as telemetry from "./telemetry";

function mapAccount(user: User): Account {
  return { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified };
}

export function createDependencies(): ApplicationDependencies {
  // Preserve the SDK identity selected before an asynchronous account operation.
  const knownUsers = new Map<string, User>();
  function remember(user: User): Account {
    knownUsers.set(user.uid, user);
    return mapAccount(user);
  }
  return {
    local: { load: local.loadUserData, save: local.saveUserData, clear: local.clearAllLocalData, saveWritingAttempt: local.saveWritingAttempt,
      loadProfile: local.loadProfile, saveProfile: local.saveProfile, backupLegacyProfile: local.backupLegacyProfile,
      removeProfile: local.removeProfile,
      readUnassignedLegacyProfile: local.readUnassignedLegacyProfile, resolveLegacyProfile: local.resolveLegacyProfile,
      loadPending: local.loadPending, savePending: local.savePending, clearPending: local.clearPending,
      clearWritingAttempts: local.clearWritingAttempts, flushWritingAttempts: local.flushWritingAttempts },
    remote: {
      async fetch(uid) {
        const result = await remote.fetchUserDataResult(uid);
        return result.status === "found" ? { ...result, data: normalizeUserData(result.data, Date.now) } : result;
      },
      saveProfile: remote.syncUserData, saveProgress: remote.syncUserProgress,
      saveLearningItem: remote.syncLearningItemProgress, delete: remote.deleteUserData,
    },
    account: {
      current: () => auth.currentUser ? remember(auth.currentUser) : null,
      subscribe: listener => onAuthStateChanged(auth, user => listener(user ? remember(user) : null)),
      register: async (email, password, name) => remember(await account.register(email, password, name)),
      login: async (email, password) => remember(await account.login(email, password)),
      logout: account.logout, resetPassword: account.resetPassword,
      sendVerificationEmail: account.sendVerificationEmail, enableGuestMode: account.enableGuestMode, disableGuestMode: account.disableGuestMode,
      async updateDisplayName(uid, name) {
        const user = knownUsers.get(uid);
        if (user) await updateProfile(user, { displayName: name });
      },
      async deleteCredential(uid) {
        const user = knownUsers.get(uid);
        if (!user) throw new Error("Account identity is no longer available.");
        await deleteUser(user);
      },
    },
    catalogue: { load: loadCatalogue, getWritingTask: (questionId) => B1_WRITING_TASKS[questionId] },
    clock: { now: clock.now, nowDate: clock.nowDate, todayISO: clock.todayISO, wallNow: Date.now },
    random: { next: Math.random },
    telemetry: { track: telemetry.track, clear: telemetry.clearTelemetry },
    notifications,
    speech: speechService,
    backup: {
      async export(json) {
        const file = new File(Paths.cache, `lingterra-backup-${Date.now()}.json`);
        file.write(json);
        if (!await Sharing.isAvailableAsync()) return false;
        await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "Lingterra yedeğini dışa aktar" });
        return true;
      },
    },
  };
}
