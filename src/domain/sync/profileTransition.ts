import { UserData } from "../models/user";
import { mergeUserData } from "./progressMerge";
import { RemoteUserDataResult, RemoteStateUnknownError } from "./remoteSync";

export type GuestProgressChoice = "merge" | "account";

export function compareProfileProgress(guest: UserData, account: UserData) {
  const guestWords = new Set(guest.solvedQuestionIds);
  const accountWords = new Set(account.solvedQuestionIds);
  return { guestWords: guestWords.size, accountWords: accountWords.size,
    additionalWords: [...guestWords].filter(id => !accountWords.has(id)).length,
    guestXp: guest.xp, accountXp: account.xp, mergedXp: Math.max(guest.xp, account.xp) };
}

/** Only skip the prompt on restoring an already established account session. */
export function shouldOfferGuestMerge(guest: UserData, restoringSession: boolean, accountCached: boolean, account?: UserData, now = new Date()): boolean {
  const hasProgress = Boolean(guest.xp > 0 || guest.solvedQuestionIds.length ||
    guest.rewardedQuestionIds.length || guest.favoriteWordIds.length || guest.unlockedBadges.length ||
    guest.passedLevelExams.length || Object.keys(guest.learningProgress).length ||
    Object.keys(guest.topicAssessments).length || guest.practiceHistory.length || guest.productionAttempts.length);
  if (!hasProgress || (restoringSession && accountCached)) return false;
  if (!account) return true;
  const fields: Array<keyof UserData> = ["xp", "streak", "solvedQuestionIds", "rewardedQuestionIds", "favoriteWordIds", "unlockedBadges", "learningProgress", "topicAssessments", "passedLevelExams", "practiceHistory", "questHistory", "productionAttempts", "dailyQuests"];
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonical(entry)]));
    return value;
  };
  const merged = mergeUserData(guest, account, now);
  const baseline = mergeUserData(account, account, now);
  return fields.some(field => JSON.stringify(canonical(merged[field])) !== JSON.stringify(canonical(baseline[field])));
}

/** Select account data only after the learner has explicitly chosen what to do with guest data. */
export function selectAccountProgress(
  guest: UserData,
  accountCache: UserData | null,
  remote: RemoteUserDataResult,
  choice: GuestProgressChoice,
  empty: UserData,
  now: Date,
): UserData {
  if (remote.status === "failed") throw new RemoteStateUnknownError(remote.error);
  const account = remote.status === "found"
    ? accountCache ? mergeUserData(accountCache, remote.data, now) : remote.data
    : accountCache ?? empty;
  // A practice in progress belongs to its profile, never the guest being imported.
  return choice === "merge"
    ? { ...mergeUserData(guest, account, now), activeSession: accountCache?.activeSession ?? null, lastCompletedWord: accountCache?.lastCompletedWord }
    : { ...account, activeSession: accountCache?.activeSession ?? null, lastCompletedWord: accountCache?.lastCompletedWord };
}
