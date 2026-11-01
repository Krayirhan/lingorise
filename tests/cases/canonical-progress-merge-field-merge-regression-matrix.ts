import { applyDailyRollover, rolloverToToday } from "../../src/domain/gamification/dailyRollover";
import { DAILY_QUEST_PRACTICE_ID, DAILY_QUEST_REVIEW_ID } from "../../src/domain/gamification/badges";
import { recordLearningOutcome } from "../../src/domain/learning/mastery";
import { DEFAULT_USER_DATA, normalizeUserData } from "../../src/domain/user/normalization";
import { PracticeHistoryEntry, QuestHistoryEntry, UserData } from "../../src/domain/models/user";
import { mergeUserData, PROGRESS_FIELD_STRATEGY } from "../../src/domain/sync/progressMerge";
import { decideMergeAction, RemoteUserDataResult } from "../../src/domain/sync/remoteSync";
import { assert } from "../support/assertions";

// 56. Canonical Progress Merge — Two-Device Cold-Start Lifecycle And Full
// Field-Merge Regression Matrix (DATA-QA-001 / DATA-QA-002 / VERIFY-QA-001 /
// RELEASE-QA-001 / GLOBAL-QA-001 / GLOBAL-QA-002 / GLOBAL-QA-003):
//
// Every assertion below calls the REAL production merge function
// (`mergeUserData` from src/domain/sync/progressMerge.ts) — the exact same
// function `mergeAndSyncUserData()` in src/application/synchronization.ts calls. The
// historical defect was a test that hand-reimplemented the merge formula
// instead of calling production code (VERIFY-QA-001); that is why no
// assertion in this section builds its own merge logic.
console.log("\n56. Canonical Progress Merge — Field-Merge Regression Matrix:");
{
  // 0. Compiler/test drift-protection backstop (MAINT-QA-001 / GLOBAL-QA-001):
  // every UserData field must have an explicit merge strategy. This is a
  // runtime backstop for the compile-time guarantee `Record<keyof UserData,
  // FieldStrategy>` already gives — if a field is ever added to UserData
  // without updating PROGRESS_FIELD_STRATEGY, the project fails to
  // typecheck; this assertion additionally proves the registry's key set
  // and DEFAULT_USER_DATA's key set have not silently diverged.
  // DEFAULT_USER_DATA intentionally omits several optional UserData fields
  // (hasSeenGardenExplainer, lastCompletedWord, lastSyncSuccessAt,
  // lastKnownServerDate, schemaVersion) that only exist once set at runtime
  // — so this checks PROGRESS_FIELD_STRATEGY is a superset of every field a
  // real record actually carries, not an exact key-set match. The full
  // key-set guarantee (every UserData field, optional ones included, has a
  // strategy) is what `Record<keyof UserData, FieldStrategy>` already
  // enforces at compile time in progressMerge.ts itself.
  assert(
    Object.keys(DEFAULT_USER_DATA).every((key) => key in PROGRESS_FIELD_STRATEGY),
    "Every field DEFAULT_USER_DATA actually carries has an explicit canonical merge strategy"
  );

  const remoteServerClock = 1_700_000_000_000;
  const mergeScenarioToday = new Date().toISOString().split("T")[0];
  const mergeScenarioYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const word1 = recordLearningOutcome(undefined, true, mergeScenarioToday, remoteServerClock);
  const word2 = recordLearningOutcome(undefined, true, mergeScenarioToday, remoteServerClock + 1000);

  // Two-Device Cold-Start Concurrent Merge Lifecycle (historical DATA-001 scenario). Dates are computed
  // relative to the real current date (not hardcoded literals) because `mergeUserData` now normalizes
  // `streak` against the real clock internally (DATA-QA-006) — a hardcoded past date would eventually
  // look "stale" purely from the passage of real time, which is exactly the class of test fragility this
  // scenario must not have.
  const device1RemoteDoc: UserData = normalizeUserData({
    xp: 40,
    streak: 3,
    lastActiveDate: mergeScenarioToday,
    lastKnownServerDate: mergeScenarioToday,
    solvedQuestionIds: ["q-apple", "q-banana"],
    rewardedQuestionIds: ["q-apple", "q-banana"],
    unlockedBadges: ["badge_first_step"],
    learningProgress: {
      "q-apple": { ...word1, serverSyncedAt: remoteServerClock },
      "q-banana": { ...word2, serverSyncedAt: remoteServerClock + 1000 },
    },
    onboardingCompleted: true,
  });

  const word3 = recordLearningOutcome(undefined, true, mergeScenarioYesterday, remoteServerClock - 86400000);
  const device2LocalPreMerge: UserData = normalizeUserData({
    xp: 25,
    streak: 2,
    lastActiveDate: mergeScenarioYesterday,
    lastKnownServerDate: mergeScenarioYesterday,
    solvedQuestionIds: ["q-cherry"],
    rewardedQuestionIds: ["q-cherry"],
    unlockedBadges: ["badge_first_step"],
    learningProgress: { "q-cherry": word3 },
    onboardingCompleted: true,
  });

  // `mergeUserData` is called directly on the raw (not pre-rolled-over) local state — this IS the real
  // call `mergeAndSyncUserData()` makes in production (AppBootstrap only rolls the local side over for
  // its own daily-scoped fields; `mergeUserData` itself independently normalizes each side's `streak`
  // against the real clock, so no manual pre-processing step is needed here for this to be accurate).
  const authoritativeMergedData = mergeUserData(device2LocalPreMerge, device1RemoteDoc);

  assert(
    Object.keys(authoritativeMergedData.learningProgress || {}).length === 3,
    "Cold-start merge preserves all 3 words across both devices without data loss"
  );
  assert(
    Boolean(authoritativeMergedData.learningProgress?.["q-apple"]) &&
      Boolean(authoritativeMergedData.learningProgress?.["q-banana"]) &&
      Boolean(authoritativeMergedData.learningProgress?.["q-cherry"]),
    "Both remote words ('q-apple', 'q-banana') and local words ('q-cherry') survive into the authoritative record"
  );
  assert(authoritativeMergedData.xp === 40, "Merged XP takes the maximum accumulated XP (40) rather than being overwritten by stale local XP (25) [MONOTONIC_MAX, XP protection]");
  // Note: local is only 1 day stale here (a normal continuing streak, not a multi-day gap), so
  // normalizedStreak's gap gap-reset never engages for either side — this asserts the ordinary
  // cross-device MAX-merge outcome, NOT the DATA-QA-006 stale-resurrection fix itself (that is
  // independently and specifically covered below, in the dedicated DATA-QA-006 block).
  assert(authoritativeMergedData.streak === 3, "Merged streak reflects the higher of two normally-continuing cross-device streaks [MONOTONIC_MAX]");
  assert(authoritativeMergedData.solvedQuestionIds.length === 3, "All solved question IDs are merged uniquely [UNION_SET]");
  assert(authoritativeMergedData.rewardedQuestionIds.length === 3, "All rewarded question IDs are merged uniquely [UNION_SET]");
  assert(authoritativeMergedData.unlockedBadges.length === 1, "Badges shared by both devices are not duplicated [UNION_SET]");
  assert(authoritativeMergedData.onboardingCompleted === true, "Onboarding status remains completed after cold-start merge [OR_TRUE]");
  assert(
    !("q-apple" in device2LocalPreMerge.learningProgress) && "q-apple" in authoritativeMergedData.learningProgress,
    "Remote-only progress ('q-apple') is preserved by the merge without local clobbering [RICHER_LEARNING_PROGRESS]"
  );

  // --- The historical DATA-QA-002 / RELEASE-QA-001 regression, reproduced directly ---
  // Before the fix: a signed-in cold-start merge spread `{...local, ...remote, xp, streak, solved, rewarded, badges, learningProgress}` —
  // `passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, and
  // `lastActiveDate` were NOT in that explicit re-merge list, so they came wholesale from `...remote`, silently discarding
  // anything the local device had that the stale remote copy did not.
  const passedExamLocallyOnly: UserData = normalizeUserData({
    ...DEFAULT_USER_DATA,
    passedLevelExams: ["A1"],
    level: "A2",
    lastActiveDate: "2026-08-27",
  });
  // The remote copy is stale precisely because the background sync that should have carried this exam pass up
  // to Firestore failed (REL-QA-004) before the app cold-started again.
  const staleRemoteAfterFailedSync: UserData = normalizeUserData({
    ...DEFAULT_USER_DATA,
    passedLevelExams: [],
    level: "A1",
    lastActiveDate: "2026-08-26",
  });
  const mergedAfterFailedSyncThenRestart = mergeUserData(passedExamLocallyOnly, staleRemoteAfterFailedSync);
  assert(
    mergedAfterFailedSyncThenRestart.passedLevelExams.includes("A1"),
    "cold start after failed cloud sync preserves passed level exam progress (the historical DATA-QA-002 / RELEASE-QA-001 defect, reproduced and fixed)"
  );
  assert(
    mergedAfterFailedSyncThenRestart.level === "A2",
    "cold start after failed cloud sync does not downgrade a more advanced local level selection [HIGHER_LEVEL]"
  );
  assert(
    mergedAfterFailedSyncThenRestart.lastActiveDate === "2026-08-27",
    "cold start after failed cloud sync keeps the later of the two lastActiveDate values [LATER_DATE_STRING]"
  );

  // passedLevelExams — local only / remote only / both
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: ["A1"] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: [] })
  ).passedLevelExams.length === 1, "passedLevelExams: local-only pass survives the merge");
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: [] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: ["A1"] })
  ).passedLevelExams.length === 1, "passedLevelExams: remote-only pass survives the merge");
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: ["A1"] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, passedLevelExams: ["A2"] })
  ).passedLevelExams.sort().join(",") === "A1,A2", "passedLevelExams: distinct passes on both devices are unioned, neither is lost");

  // dailyQuests — same-day richer-progress-per-id merge
  {
    const localQuests: UserData["dailyQuests"] = [
      { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 20, target: 20, xpReward: 30, completed: true },
      { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 0, target: 1, xpReward: 20, completed: false },
    ];
    const remoteQuests: UserData["dailyQuests"] = [
      { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 5, target: 20, xpReward: 30, completed: false },
      { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 1, target: 1, xpReward: 20, completed: true },
    ];
    const mergedQuests = mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, dailyQuests: localQuests }),
      normalizeUserData({ ...DEFAULT_USER_DATA, dailyQuests: remoteQuests })
    ).dailyQuests;
    const practiceQuest = mergedQuests.find((q) => q.id === DAILY_QUEST_PRACTICE_ID)!;
    const reviewQuest = mergedQuests.find((q) => q.id === DAILY_QUEST_REVIEW_ID)!;
    assert(practiceQuest.completed === true && practiceQuest.current === 20, "dailyQuests: the practice quest keeps its local completion, not overwritten by a less-progressed remote copy");
    assert(reviewQuest.completed === true && reviewQuest.current === 1, "dailyQuests: the review quest keeps its remote completion, not overwritten by a less-progressed local copy");
  }

  // questHistory — union by (date, questId) identity, an append-only log
  {
    const localHistory: QuestHistoryEntry[] = [{ date: "2026-08-25", questId: DAILY_QUEST_PRACTICE_ID, completedAt: "2026-08-25T10:00:00Z" }];
    const remoteHistory: QuestHistoryEntry[] = [{ date: "2026-08-24", questId: DAILY_QUEST_PRACTICE_ID, completedAt: "2026-08-24T10:00:00Z" }];
    const mergedHistory = mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, questHistory: localHistory }),
      normalizeUserData({ ...DEFAULT_USER_DATA, questHistory: remoteHistory })
    ).questHistory;
    assert(mergedHistory.length === 2, "questHistory: distinct-day entries from both devices are unioned, neither is discarded");
  }

  // celebratedLevels — UNION_SET
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, celebratedLevels: ["A1"] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, celebratedLevels: ["A2"] })
  ).celebratedLevels.sort().join(",") === "A1,A2", "celebratedLevels: a celebration on either device is never un-celebrated by a merge");

  // practiceHistory — same-day richer-counts merge, distinct days unioned
  {
    const localHistory: PracticeHistoryEntry[] = [{ date: "2026-08-25", answers: 10, correct: 8, xp: 40 }];
    const remoteHistory: PracticeHistoryEntry[] = [
      { date: "2026-08-25", answers: 3, correct: 3, xp: 15 },
      { date: "2026-08-24", answers: 5, correct: 5, xp: 25 },
    ];
    const mergedHistory = mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, practiceHistory: localHistory }),
      normalizeUserData({ ...DEFAULT_USER_DATA, practiceHistory: remoteHistory })
    ).practiceHistory;
    assert(mergedHistory.length === 2, "practiceHistory: distinct days are unioned, not deduplicated away");
    const day25 = mergedHistory.find((e) => e.date === "2026-08-25")!;
    assert(day25.answers === 10 && day25.xp === 40, "practiceHistory: a same-day entry takes the richer (higher) counts from either device, not whichever device happened to sync last");
  }

  // dailyReviewXpIds — same-day union (prevents double-XP on either device for a word already rewarded today)
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-25", dailyReviewXpIds: ["q-apple"] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-25", dailyReviewXpIds: ["q-banana"] })
  ).dailyReviewXpIds.sort().join(",") === "q-apple,q-banana", "dailyReviewXpIds: today's paid-out review ids from both devices are unioned");

  // favoriteWordIds — UNION_STRING_ARRAY (bookmarking is additive; a merge must never lose a bookmark from either device)
  assert(mergeUserData(
    normalizeUserData({ ...DEFAULT_USER_DATA, favoriteWordIds: ["q-apple"] }),
    normalizeUserData({ ...DEFAULT_USER_DATA, favoriteWordIds: ["q-banana"] })
  ).favoriteWordIds.sort().join(",") === "q-apple,q-banana", "favoriteWordIds: bookmarks from both devices are unioned, neither device's bookmark is lost");

  // --- Day-boundary safety for daily-scoped fields (dailyQuests / dailyReviewXpIds) ---
  // Reproduces a real gap an independent reviewer found in this sprint's first draft:
  // DailyQuest carries no date of its own — applyDailyRollover() regenerates it from
  // scratch every day under the same fixed ids. A naive quest-id-keyed OR/max merge
  // (with no day-boundary check) would let YESTERDAY's remote `completed: true` mark
  // TODAY's freshly-rolled-over quest complete by id, silently blocking that day's
  // practice-quest XP — even though the two records are a full day apart.
  {
    const yesterdaysRemoteQuests: UserData["dailyQuests"] = [
      { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 20, target: 20, xpReward: 30, completed: true },
      { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 1, target: 1, xpReward: 20, completed: true },
    ];
    const todaysFreshLocalQuests: UserData["dailyQuests"] = [
      { id: DAILY_QUEST_PRACTICE_ID, titleKey: "questDailyPractice", current: 0, target: 20, xpReward: 30, completed: false },
      { id: DAILY_QUEST_REVIEW_ID, titleKey: "questDailyReview", current: 0, target: 1, xpReward: 20, completed: false },
    ];
    const merged = mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-26", dailyQuests: todaysFreshLocalQuests, dailyReviewXpIds: [] }),
      normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-25", dailyQuests: yesterdaysRemoteQuests, dailyReviewXpIds: ["q-apple"] })
    );
    assert(
      merged.dailyQuests.every((q) => q.completed === false),
      "cross-day merge does not let yesterday's completed quest silently mark today's freshly-rolled-over quest complete (day-boundary regression, found by independent review)"
    );
    assert(
      merged.dailyReviewXpIds.length === 0,
      "cross-day merge does not carry yesterday's already-paid review-XP ids into today, which would wrongly block today's review-XP reward for the same word"
    );
    assert(merged.lastActiveDate === "2026-08-26", "cross-day merge still takes the later lastActiveDate even though the daily-scoped fields follow the same side, not necessarily the merge-wide max");
  }

  // The same-day case must still merge richly across devices sharing today's date (already covered above); confirm a genuinely same-day cross-device case is unaffected by the day-boundary guard.
  assert(
    mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-25", dailyReviewXpIds: ["q-apple"] }),
      normalizeUserData({ ...DEFAULT_USER_DATA, lastActiveDate: "2026-08-25", dailyReviewXpIds: ["q-banana"] })
    ).dailyReviewXpIds.length === 2,
    "same-day dailyReviewXpIds still union normally — the day-boundary guard only changes cross-day behavior"
  );

  // learningProgress — richer-record merge (already covered above by the two-device scenario)
  assert(
    Object.keys(mergeUserData(
      normalizeUserData({ ...DEFAULT_USER_DATA, learningProgress: { "q-x": word1 } }),
      normalizeUserData({ ...DEFAULT_USER_DATA, learningProgress: { "q-y": word2 } })
    ).learningProgress).length === 2,
    "learningProgress: per-word records from both devices are merged without loss [RICHER_RECORD]"
  );

  // Idempotency / convergence: merging a state with itself must not mutate it further.
  {
    const state = authoritativeMergedData;
    const reapplied = mergeUserData(state, state);
    assert(reapplied.xp === state.xp, "Idempotency: re-merging an already-merged state does not change XP");
    assert(reapplied.passedLevelExams.length === state.passedLevelExams.length, "Idempotency: re-merging an already-merged state does not change passedLevelExams");
    assert(reapplied.dailyQuests.length === state.dailyQuests.length, "Idempotency: re-merging an already-merged state does not change the daily quest count");
    assert(Object.keys(reapplied.learningProgress).length === Object.keys(state.learningProgress).length, "Idempotency: re-merging an already-merged state does not change the learningProgress word count");
  }

  // Device A -> Device B -> Device A round trip: nothing exclusive to either device is lost across two hops.
  {
    const deviceA = normalizeUserData({ ...DEFAULT_USER_DATA, xp: 10, passedLevelExams: ["A1"], solvedQuestionIds: ["q-a"] });
    const deviceB = normalizeUserData({ ...DEFAULT_USER_DATA, xp: 20, passedLevelExams: ["A2"], solvedQuestionIds: ["q-b"] });
    const aToB = mergeUserData(deviceB, deviceA); // Device B pulls down Device A's cloud state
    const backToA = mergeUserData(deviceA, aToB); // Device A's next cold start pulls down the now-merged cloud state
    assert(backToA.xp === 20, "A -> B -> A: the higher XP survives the full round trip");
    assert(backToA.passedLevelExams.sort().join(",") === "A1,A2", "A -> B -> A: exam passes from both original devices survive the full round trip");
    assert(backToA.solvedQuestionIds.sort().join(",") === "q-a,q-b", "A -> B -> A: solved words from both original devices survive the full round trip");
  }

  // Stale cloud snapshot: a remote copy far behind local must not regress local's protected progress.
  {
    const staleSnapshotToday = new Date().toISOString().split("T")[0];
    const staleSnapshotLongAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const freshLocal = normalizeUserData({ ...DEFAULT_USER_DATA, xp: 500, streak: 30, lastActiveDate: staleSnapshotToday, passedLevelExams: ["A1", "A2", "B1"] });
    const staleRemote = normalizeUserData({ ...DEFAULT_USER_DATA, xp: 10, streak: 1, lastActiveDate: staleSnapshotLongAgo, passedLevelExams: [] });
    const merged = mergeUserData(freshLocal, staleRemote);
    assert(merged.xp === 500 && merged.streak === 30, "A stale cloud snapshot never regresses XP/streak below the fresher local state");
    assert(merged.passedLevelExams.length === 3, "A stale cloud snapshot never drops exam passes the local device already has");
  }

  // Partial local state (a fresh install with nothing local yet) merging with a populated remote: remote's progress must not be lost.
  {
    const freshInstallLocal = normalizeUserData({});
    const populatedRemote = normalizeUserData({
      xp: 300,
      passedLevelExams: ["A1"],
      learningProgress: { "q-apple": word1 },
    });
    const merged = mergeUserData(freshInstallLocal, populatedRemote);
    assert(merged.xp === 300, "Partial/fresh local state does not clobber remote XP");
    assert(merged.passedLevelExams.includes("A1"), "Partial/fresh local state does not clobber remote exam passes");
    assert("q-apple" in merged.learningProgress, "Partial/fresh local state does not clobber remote learning progress");
  }

  // Migrated older local data participating in the same merge (v1-shaped local data normalized before merging).
  {
    const migratedOldLocal = normalizeUserData({ solvedQuestionIds: ["q-legacy"], xp: 5 });
    const remote = normalizeUserData({ xp: 50, passedLevelExams: ["A1"] });
    const merged = mergeUserData(migratedOldLocal, remote);
    assert(merged.xp === 50, "A migrated (v1-shaped) local record still merges correctly against a richer remote");
    assert("q-legacy" in merged.learningProgress, "A migrated (v1-shaped) local record's synthesized learningProgress entry survives the merge");
  }

  // --- Remote absent vs. remote fetch failed (DATA-QA-001 / GLOBAL-QA-003) ---
  // `decideMergeAction` is the actual pure decision `mergeAndSyncUserData()` executes
  // (see src/application/synchronization.ts) — tested directly here with synthetic
  // RemoteUserDataResult values, with no live/mocked Firestore SDK required.
  {
    const localData = normalizeUserData({ ...DEFAULT_USER_DATA, xp: 42, passedLevelExams: ["A1"] });

    const absentResult: RemoteUserDataResult = { status: "absent" };
    const absentDecision = decideMergeAction(absentResult, localData);
    assert(absentDecision.action === "first-sync", "remote absent: decision is first-sync (push local up), not a merge and not an error");
    assert(absentDecision.action === "first-sync" && absentDecision.data === localData, "remote absent: the data to push is exactly the local data, unmodified");

    const failedResult: RemoteUserDataResult = { status: "failed", error: new Error("simulated network failure") };
    const failedDecision = decideMergeAction(failedResult, localData);
    assert(
      failedDecision.action === "unknown-remote-state",
      "remote fetch FAILED is decided as unknown-remote-state, never treated the same as remote ABSENT — this is the exact DATA-QA-001 distinction: a transient failure must not authorize pushing/overwriting as if no remote account existed"
    );

    const foundResult: RemoteUserDataResult = { status: "found", data: normalizeUserData({ ...DEFAULT_USER_DATA, xp: 100, passedLevelExams: ["A2"] }) };
    const foundDecision = decideMergeAction(foundResult, localData);
    assert(foundDecision.action === "merge", "remote found: decision is a real merge, not a blind push");
    assert(
      foundDecision.action === "merge" && foundDecision.data.passedLevelExams.sort().join(",") === "A1,A2",
      "remote found: the merge decision's data is produced by the real mergeUserData function (both exam passes present), not a hand-copied formula"
    );
  }

  // --- Sprint 2 Phase A carry-over regressions: DATA-QA-005, DATA-QA-006, VERIFY-QA-003 ---
  // Both scenarios below were independently discovered by DATA-002-REAUDIT/VERIFICATION-ASSURANCE-002-REAUDIT
  // AFTER Sprint 1 shipped; these tests close the exact verification-system gap (VERIFY-QA-003) that let
  // them ship undetected, by calling the real production functions in the real production ORDER, not a
  // test-only replica.

  // DATA-QA-005 — level is a free, user-reversible content-selection preference (see
  // LevelSwitcherModal.tsx's own doc comment: "every level is selectable, access is never locked"), not a
  // monotonic achievement — a merge must prefer the more RECENTLY set level, not the higher one.
  {
    const recentLocalDowngrade = normalizeUserData({ ...DEFAULT_USER_DATA, level: "A1", levelSetAt: 2_000_000 });
    const staleRemoteHigher = normalizeUserData({ ...DEFAULT_USER_DATA, level: "B1", levelSetAt: 1_000_000 });
    const mergedAfterDowngrade = mergeUserData(recentLocalDowngrade, staleRemoteHigher);
    assert(
      mergedAfterDowngrade.level === "A1",
      "cold start after an intentional manual level downgrade preserves the downgrade instead of silently restoring a stale-but-higher remote level (DATA-QA-005, fixed)"
    );

    const staleLocalLower = normalizeUserData({ ...DEFAULT_USER_DATA, level: "A1", levelSetAt: 1_000_000 });
    const recentRemotePromotion = normalizeUserData({ ...DEFAULT_USER_DATA, level: "B1", levelSetAt: 2_000_000 });
    const mergedAfterPromotion = mergeUserData(staleLocalLower, recentRemotePromotion);
    assert(
      mergedAfterPromotion.level === "B1",
      "legitimate level progression (a more recent promotion on another device) still survives the merge — the fix is recency-based, not merely 'local always wins'"
    );

    // Legacy fallback: neither side has ever stamped levelSetAt (pre-migration data) — falls back to the
    // old higher-level heuristic, which is a safe, non-regressing default for that transitional case only.
    const legacyLocal = normalizeUserData({ ...DEFAULT_USER_DATA, level: "A2" });
    const legacyRemote = normalizeUserData({ ...DEFAULT_USER_DATA, level: "A1" });
    assert(
      mergeUserData(legacyLocal, legacyRemote).level === "A2",
      "when neither side has a levelSetAt timestamp (legacy pre-migration data), the merge falls back to the higher level rather than an arbitrary choice"
    );
  }

  // DATA-QA-006 — a long-stale local device's streak must be rolled over to the device's actual current
  // date BEFORE it participates in a merge, or a correctly-decayed remote streak can be silently
  // overridden by the stale device's frozen-high value (Math.max resurrects it, and the merge's own
  // lastActiveDate update then hides the gap from ever being detected afterwards).
  //
  // The fix has two complementary layers, both exercised below:
  //  1. `mergeUserData` itself now normalizes EACH side's streak against the
  //     real clock (`normalizedStreak`, progressMerge.ts) before taking the
  //     max — this alone closes the resurrection regardless of which side
  //     (local OR remote) is the stale one, and regardless of caller behavior.
  //  2. `AppBootstrap` additionally rolls the LOCAL side over to today
  //     (`rolloverToToday`) before calling the merge at all — required so
  //     local's day-scoped fields (`dailyQuests`/`dailyReviewXpIds`) are
  //     correctly regenerated, which layer 1 does not touch.
  {
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const staleRawLocal = normalizeUserData({ ...DEFAULT_USER_DATA, streak: 10, lastActiveDate: fiveDaysAgo });
    const freshRemote = normalizeUserData({ ...DEFAULT_USER_DATA, streak: 2, lastActiveDate: todayISO });

    // Layer 1 alone (merging the RAW, un-rolled-over local state directly) already prevents resurrection —
    // `mergeUserData` normalizes both sides internally, so a stale local streak can never survive past a
    // correctly-decayed remote one even without any caller-side pre-processing.
    const mergedRawLocal = mergeUserData(staleRawLocal, freshRemote);
    assert(
      mergedRawLocal.streak <= 2,
      "cold start after a multi-day gap on this device: mergeUserData's own internal streak normalization prevents the stale streak from resurrecting past the correctly-decayed remote value, even with no caller-side pre-processing (DATA-QA-006, fixed at the merge-function root cause)"
    );

    // Layer 2, exercised together with layer 1 (the actual production AppBootstrap sequence).
    const { data: rolledLocal } = rolloverToToday(staleRawLocal);
    const mergedWithBothLayers = mergeUserData(rolledLocal, freshRemote);
    assert(
      mergedWithBothLayers.streak <= 2,
      "the full production sequence (rollover-before-merge, then the merge's own normalization) still prevents resurrection"
    );

    // Legitimate same-day reopen must not be treated as a gap.
    const localAlreadyToday = normalizeUserData({ ...DEFAULT_USER_DATA, streak: 5, lastActiveDate: todayISO });
    const sameDayRollover = rolloverToToday(localAlreadyToday);
    assert(sameDayRollover.isNewDay === false, "rolloverToToday is a no-op when the device was already opened today");
    assert(sameDayRollover.data.streak === 5, "rolloverToToday preserves today's streak unchanged when no day boundary was crossed");

    // Both sides equally stale by the same amount: the fetched remote document itself being the stale
    // side (not just local) is exactly the case a local-only rollover could not have fixed by itself —
    // this is what layer 1 (normalizing REMOTE too, inside mergeUserData) specifically closes.
    const bothStaleRemote = normalizeUserData({ ...DEFAULT_USER_DATA, streak: 8, lastActiveDate: fiveDaysAgo });
    const { data: rolledLocalBothStale } = rolloverToToday(staleRawLocal);
    const mergedBothStale = mergeUserData(rolledLocalBothStale, bothStaleRemote);
    assert(
      mergedBothStale.streak === 1,
      "when the fetched remote document is itself the stale side, mergeUserData's own normalization still resets it correctly instead of letting its frozen-high streak survive the max comparison"
    );
  }
}

