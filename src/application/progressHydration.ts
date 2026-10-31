import { rolloverToToday } from "../domain/gamification/dailyRollover";
import { UserData } from "../domain/models/user";
import { getDueReviewItems } from "../domain/review/spacedRepetition";
import { daysBetween, detectClockAnomaly } from "../domain/sync/clockAnomaly";
import { ApplicationDependencies } from "./ports";

interface ProgressHydrationHelpers {
  loadUserData: () => Promise<UserData>;
  saveUserData: (data: UserData) => Promise<boolean>;
  fetchUserData: (uid: string) => Promise<UserData | null>;
  setUserData: (value: UserData | ((previous: UserData) => UserData)) => void;
  setIsHydrated: (value: boolean | ((previous: boolean) => boolean)) => void;
  checkServerDateAnomaly: (lastKnownServerDate?: string, todayFormatted?: string) => void;
  noteCloudSyncOutcome: (succeeded: boolean) => void;
}

export function createProgressHydration(deps: ApplicationDependencies, helpers: ProgressHydrationHelpers) {
  const { loadUserData, saveUserData, fetchUserData, setUserData, setIsHydrated,
    checkServerDateAnomaly, noteCloudSyncOutcome } = helpers;
  async function initialize() {
    const loaded = await loadUserData();
    const { data: updated, isNewDay, todayFormatted } = rolloverToToday(loaded, deps.clock.nowDate());

    checkServerDateAnomaly(loaded.lastKnownServerDate, todayFormatted);

    deps.telemetry.track("session_started", {
      daysSinceLastOpen: loaded.lastActiveDate
        ? daysBetween(loaded.lastActiveDate, todayFormatted)
        : null,
    });

    if (isNewDay) {
      deps.telemetry.track("daily_rollover_applied", {
        streakBefore: loaded.streak,
        streakAfter: updated.streak,
        pendingReviewsAtOpen: getDueReviewItems(loaded.learningProgress || {}, deps.clock.now()).length,
      });
    }

    setUserData(updated);
    // Signed-in bootstrap owns the initial write, avoiding competing cold-start saves.
    if (!deps.account.current()) {
      await saveUserData(updated);
    }
    setIsHydrated(true);
  }

  const refresh = async () => {
    const loaded = await loadUserData();
    const { data: rolledUpdate, isNewDay, todayFormatted } = rolloverToToday(loaded, deps.clock.nowDate());

    // The locally cached lastKnownServerDate is only ever written at sign-in
    // (AppBootstrap's onAuthStateChanged flow) or here. A long session between
    // sign-ins would otherwise check clock-manipulation against an
    // increasingly stale reference, so every refresh() re-anchors it against
    // Firestore's actual clock for signed-in users — cheap because refresh()
    // is already a deliberate, infrequent action (pull-to-refresh, sign-in).
    const user = deps.account.current();
    let lastKnownServerDate = loaded.lastKnownServerDate;
    if (user) {
      const remote = await fetchUserData(user.uid);
      if (remote?.lastKnownServerDate) {
        lastKnownServerDate = remote.lastKnownServerDate;
      }
    }

    checkServerDateAnomaly(lastKnownServerDate, todayFormatted);
    if (isNewDay) {
      deps.telemetry.track("daily_rollover_applied", {
        streakBefore: loaded.streak,
        streakAfter: rolledUpdate.streak,
        pendingReviewsAtOpen: getDueReviewItems(loaded.learningProgress || {}, deps.clock.now()).length,
      });
    }
    const updated: UserData = { ...rolledUpdate, lastKnownServerDate };
    setUserData(updated);
    await saveUserData(updated);
    if (user) {
      try {
        await Promise.all([deps.remote.saveProfile(user.uid, updated), deps.remote.saveProgress(user.uid, updated)]);
        noteCloudSyncOutcome(true);
      } catch (error) {
        console.warn("Lingterra: Firebase sync failed during refresh; local data is safe", error);
        noteCloudSyncOutcome(false);
      }
    }
  };

  /** Local resets must never overwrite remote account progress. */
  const reloadLocalOnly = async () => {
    const loaded = await loadUserData();
    const { data: updated } = rolloverToToday(loaded, deps.clock.nowDate());
    setUserData(updated);
    await saveUserData(updated);
  };

  return { initialize, refresh, reloadLocalOnly };
}

