import { DEFAULT_USER_DATA } from "../../src/domain/user/normalization";
import { compareProfileProgress, selectAccountProgress, shouldOfferGuestMerge } from "../../src/domain/sync/profileTransition";
import { RemoteStateUnknownError } from "../../src/domain/sync/remoteSync";
import { classifyProfileFailure } from "../../src/domain/sync/profileFailure";
import { assert } from "../support/assertions";

const guest = { ...DEFAULT_USER_DATA, xp: 20, solvedQuestionIds: ["guest"] };
const cloud = { ...DEFAULT_USER_DATA, xp: 100, solvedQuestionIds: ["cloud"] };
const now = new Date("2026-11-01T12:00:00Z");
const accountOnly = selectAccountProgress(guest, null, { status: "found", data: cloud }, "account", DEFAULT_USER_DATA, now);
assert(accountOnly.solvedQuestionIds.join() === "cloud", "Account-only selection does not import guest words");
const combined = selectAccountProgress(guest, null, { status: "found", data: cloud }, "merge", DEFAULT_USER_DATA, now);
assert(combined.solvedQuestionIds.includes("guest") && combined.solvedQuestionIds.includes("cloud") && combined.xp === 100, "Explicit merge keeps both sets and maximum XP");
let failed = false;
try { selectAccountProgress(guest, null, { status: "failed", error: new Error("offline") }, "merge", DEFAULT_USER_DATA, now); }
catch (error) { failed = error instanceof RemoteStateUnknownError; }
assert(failed, "Unknown cloud state prevents selection");
assert(shouldOfferGuestMerge(guest, false, true), "A fresh login offers the guest choice even when this account has a cache");
assert(!shouldOfferGuestMerge(guest, true, true), "Restoring the same cached account does not repeat the guest choice");
assert(shouldOfferGuestMerge({ ...DEFAULT_USER_DATA, favoriteWordIds: ["favorite"] }, false, false), "Favorites alone count as guest progress");
assert(!shouldOfferGuestMerge(DEFAULT_USER_DATA, false, false), "A completely empty guest profile needs no merge prompt");
assert(!shouldOfferGuestMerge({ ...DEFAULT_USER_DATA, onboardingCompleted: true }, false, false, cloud, now), "Completing onboarding alone does not trigger a merge prompt");
assert(!shouldOfferGuestMerge({ ...cloud }, false, true, cloud, now), "Previously merged identical progress does not trigger another prompt");
assert(!shouldOfferGuestMerge({ ...DEFAULT_USER_DATA, xp: 5 }, false, true, cloud, now), "Lower guest XP alone does not change a more advanced account");
assert(shouldOfferGuestMerge({ ...DEFAULT_USER_DATA, xp: 5, solvedQuestionIds: ["new-guest-word"] }, false, true, cloud, now), "Unique guest words trigger a prompt even when guest XP is lower");
assert(shouldOfferGuestMerge({ ...DEFAULT_USER_DATA, xp: 150 }, false, true, cloud, now), "Higher guest XP triggers a prompt");
assert(classifyProfileFailure(new RemoteStateUnknownError({ code: "unavailable" })) === "connection", "Nested cloud read errors report the connection category");
assert(classifyProfileFailure({ code: "permission-denied" }) === "permission", "Permission errors are distinguished from connection errors");
assert(classifyProfileFailure({ code: "invalid-argument" }) === "data", "Profile serialization errors have a safe data category");
const comparison = compareProfileProgress({ ...guest, solvedQuestionIds: ["shared", "new", "new"] }, { ...cloud, solvedQuestionIds: ["shared", "old"] });
assert(comparison.guestWords === 2 && comparison.accountWords === 2 && comparison.additionalWords === 1 && comparison.mergedXp === 100, "Profile comparison counts unique words and shows the actual maximum XP");
const zeroComparison = compareProfileProgress(DEFAULT_USER_DATA, cloud);
assert(zeroComparison.additionalWords === 0 && zeroComparison.mergedXp === 100, "An empty guest profile contributes no words and cannot reduce XP");
