import * as ts from "typescript";
import { boundaryViolation, dependencySpecifiers, importCycles } from "../../scripts/checkArchitecture";
import { PartialAccountDeletionError } from "../../src/application/account";
import { createCatalogueLoader } from "../../src/application/catalogueLoader";
import { createApplication } from "../../src/application/createApplication";
import { createConsecutiveFailureReporter } from "../../src/application/consecutiveFailureReporter";
import { Account, ApplicationDependencies, CatalogueResult } from "../../src/application/ports";
import { restoreSession } from "../../src/application/sessionRestoration";
import { allQuestions, CONTENT_VERSION } from "../support/bundledCatalogue";
import { createDailyQuests } from "../../src/domain/gamification/badges";
import { UserData } from "../../src/domain/models/user";
import { applyPracticeAnswer } from "../../src/domain/practice/answer";
import { summarizeSession } from "../../src/domain/practice/sessionSummary";
import { RemoteStateUnknownError } from "../../src/domain/sync/remoteSync";
import { DEFAULT_USER_DATA, normalizeUserData } from "../../src/domain/user/normalization";
import { assert } from "../support/assertions";

const epoch = Date.parse("2026-10-05T12:00:00Z");
const today = "2026-10-05";
const account: Account = { uid: "learner", email: "learner@example.test", displayName: "Learner", emailVerified: false };
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const settle = () => new Promise<void>(resolve => setImmediate(resolve));

function fixture(initial: UserData = clone(DEFAULT_USER_DATA)) {
  const state = {
    data: clone(initial), signedIn: false, failSave: false, failRemote: false, failDelete: false,
    notificationScheduleGranted: true, notificationScheduleFails: false,
    remoteResult: { status: "absent" } as Awaited<ReturnType<ApplicationDependencies["remote"]["fetch"]>>,
    calls: [] as string[], events: [] as Array<{ name: string; params: unknown }>,
  };
  const deps: ApplicationDependencies = {
    local: {
      async load() { state.calls.push("local.load"); return clone(state.data); },
      async save(data) { state.calls.push("local.save"); if (state.failSave) return false; state.data = clone(data); return true; },
      async clear() { state.calls.push("local.clear"); state.data = clone(DEFAULT_USER_DATA); return { success: true, data: state.data }; },
    },
    remote: {
      async fetch() { state.calls.push("remote.fetch"); return state.remoteResult; },
      async saveProfile() { state.calls.push("remote.profile"); if (state.failRemote) throw new Error("offline"); },
      async saveProgress() { state.calls.push("remote.progress"); if (state.failRemote) throw new Error("offline"); },
      async saveLearningItem() { state.calls.push("remote.item"); },
      async delete() { state.calls.push("remote.delete"); },
    },
    account: {
      current: () => state.signedIn ? account : null,
      subscribe: () => () => { },
      async register() { return account; }, async login() { return account; }, async logout() { },
      async resetPassword() { }, async sendVerificationEmail() { }, async updateDisplayName() { },
      async deleteCredential() { state.calls.push("account.delete"); if (state.failDelete) throw new Error("recent-login-required"); state.signedIn = false; },
      async disableGuestMode() { },
      async enableGuestMode() { state.calls.push("account.guest"); },
    },
    catalogue: { async load(level) { return { questions: allQuestions.filter(q => q.level === level), version: "2.3.0", source: "bundled" }; } },
    clock: { now: () => epoch, nowDate: () => new Date(epoch), todayISO: () => today, wallNow: () => epoch },
    random: { next: () => 0.5 },
    telemetry: { track(name, params) { state.events.push({ name, params }); }, async clear() { } },
    notifications: {
      async scheduleDailyReminder() { if (state.notificationScheduleFails) throw new Error("permission unavailable"); return state.notificationScheduleGranted; },
      async cancelDailyReminder() { state.calls.push("notifications.cancel"); },
    },
    backup: { async export() { return false; } },
    speech: { async speak() { }, async stop() { } },
  };
  return { state, deps, app: createApplication(deps, clone(allQuestions), CONTENT_VERSION) };
}

export async function runApplicationTests() {
  {
    const { app, state, deps } = fixture();
    deps.local.saveProfile = async () => {};
    await app.progress.beginProfileTransition();
    app.progress.activateProfile("guest", { ...clone(DEFAULT_USER_DATA), xp: 42 });
    state.signedIn = true;
    deps.account.logout = async () => { throw new Error("sign out failed"); };
    try { await app.signOutProfile(); } catch { /* expected */ }
    assert(app.progress.getSnapshot().profileTransition && app.progress.getManagedProfile() === "guest", "Failed sign-out during a pending login never relabels guest data as account data");
    app.progress.getSnapshot().setSoundEnabled(false);
    assert(app.progress.getSnapshot().userData.soundEnabled, "Failed sign-out keeps writes blocked until a safe transition succeeds");
  }
  {
    const { deps } = fixture();
    let signedIn: Account | null = null;
    const guest = { ...clone(DEFAULT_USER_DATA), onboardingCompleted: true, xp: 10, solvedQuestionIds: ["guest-word"] };
    const accountA = { ...clone(DEFAULT_USER_DATA), onboardingCompleted: true, xp: 90, solvedQuestionIds: ["account-a-word"] };
    const accountB = { ...clone(DEFAULT_USER_DATA), onboardingCompleted: true, xp: 40, solvedQuestionIds: ["account-b-word"] };
    const local = new Map<string, UserData>([["guest", clone(guest)]]);
    const cloud = new Map<string, UserData>([["a", clone(accountA)], ["b", clone(accountB)]]);
    deps.account.current = () => signedIn;
    deps.account.logout = async () => { signedIn = null; };
    deps.local.loadProfile = async key => local.has(key) ? clone(local.get(key)!) : null;
    deps.local.saveProfile = async (key, value) => { local.set(key, clone(value)); };
    deps.local.backupLegacyProfile = async () => false;
    deps.remote.fetch = async uid => cloud.has(uid) ? { status: "found", data: clone(cloud.get(uid)!) } : { status: "absent" };
    deps.remote.saveProfile = async (uid, value) => { cloud.set(uid, clone(value)); };
    deps.remote.saveProgress = async () => {};
    const app = createApplication(deps, clone(allQuestions), CONTENT_VERSION);
    await app.progress.beginProfileTransition();
    app.progress.activateProfile("guest", (await app.profiles!.loadGuest()));
    signedIn = { ...account, uid: "a" };
    await app.progress.beginProfileTransition();
    const a = await app.profiles!.prepareAccount("a", "account", () => signedIn?.uid ?? null);
    app.progress.activateProfile("account:a", await app.profiles!.commitAccount(a, () => signedIn?.uid ?? null));
    assert(app.progress.getSnapshot().userData.solvedQuestionIds.join() === "account-a-word", "Guest to existing account uses only account progress when selected");
    await app.signOutProfile();
    app.progress.activateProfile("guest", await app.profiles!.loadGuest());
    assert(app.progress.getSnapshot().userData.solvedQuestionIds.join() === "guest-word", "Sign out restores the original guest progress");
    signedIn = { ...account, uid: "b" };
    await app.progress.beginProfileTransition();
    const b = await app.profiles!.prepareAccount("b", "merge", () => signedIn?.uid ?? null);
    app.progress.activateProfile("account:b", await app.profiles!.commitAccount(b, () => signedIn?.uid ?? null));
    const wordsB = app.progress.getSnapshot().userData.solvedQuestionIds;
    assert(wordsB.includes("guest-word") && wordsB.includes("account-b-word") && !wordsB.includes("account-a-word"), "Second account merges only its own and explicitly selected guest progress");
    assert(cloud.get("a")!.solvedQuestionIds.join() === "account-a-word" && local.get("guest")!.solvedQuestionIds.join() === "guest-word", "Other account and guest remain unchanged through both transitions");
  }
  {
    const { app, deps } = fixture();
    let broken = true;
    let stored: UserData | null = null;
    deps.local.saveProfile = async (_owner, data) => { if (broken) throw new Error("disk"); stored = clone(data); };
    await app.progress.beginProfileTransition();
    app.progress.activateProfile("guest", clone(DEFAULT_USER_DATA));
    app.progress.getSnapshot().setSoundEnabled(false);
    await settle();
    app.progress.getSnapshot().setReduceMotion(true);
    let blocked = false;
    try { await app.progress.beginProfileTransition(); } catch { blocked = true; }
    assert(blocked && stored === null, "Failed local writes block profile transition");
    broken = false;
    await app.progress.beginProfileTransition();
    const recovered = stored as UserData | null;
    assert(recovered !== null && !recovered.soundEnabled && recovered.reduceMotion, "Retry preserves the newest in-memory profile after a write failure");
  }
  {
    const { app, state, deps } = fixture();
    const saves: string[] = [];
    deps.local.saveProfile = async (owner, data) => { saves.push(`${owner}:${data.soundEnabled}`); };
    await app.progress.hydrate();
    await app.progress.beginProfileTransition();
    app.progress.getSnapshot().setSoundEnabled(false);
    assert(saves.length === 0, "Profile transition blocks progress writes");
    app.progress.activateProfile("guest", clone(DEFAULT_USER_DATA));
    app.progress.getSnapshot().setSoundEnabled(false);
    state.signedIn = true;
    app.progress.getSnapshot().setSoundEnabled(true);
    await app.progress.beginProfileTransition();
    assert(saves.join() === "guest:false", "Auth identity change blocks stale guest writes and transition drains queued saves");
    assert(!state.calls.includes("remote.profile"), "Guest changes never reach a newly signed-in account");
    deps.local.loadProfile = async owner => owner === "account:learner" ? { ...clone(DEFAULT_USER_DATA), xp: 99 } : null;
    app.progress.activateProfile("account:learner", { ...clone(DEFAULT_USER_DATA), xp: 99 });
    state.calls.length = 0;
    await app.progress.getSnapshot().refresh();
    assert(app.progress.getSnapshot().userData.xp === 99 && !state.calls.includes("local.load") && !state.calls.includes("remote.profile"), "Managed refresh reads only the active profile and does not push shared legacy data");
    const exported = JSON.parse(await app.data.exportUserDataJSON());
    assert(exported.data.xp === 99, "Backup exports the active profile rather than the legacy shared record");
    state.remoteResult = { status: "failed", error: new Error("offline") };
    const failedReset = await app.data.clearAllLocalData();
    assert(!failedReset.success && app.progress.getSnapshot().userData.xp === 99, "Offline account reset preserves the active profile");
    state.remoteResult = { status: "found", data: { ...clone(DEFAULT_USER_DATA), xp: 72 } };
    const reset = await app.data.clearAllLocalData();
    assert(reset.success && app.progress.getSnapshot().userData.xp === 72 && !state.calls.includes("remote.progress"), "Account local reset restores cloud progress without writing a wipe");
  }
  {
    const reported: string[] = [];
    const events: Array<{ name: string; consecutiveFailures: number }> = [];
    const noteFailure = createConsecutiveFailureReporter({
      eventName: "local_save_failed",
      notice: "storage notice",
      track: (name, parameters) => events.push({ name, consecutiveFailures: parameters.consecutiveFailures }),
      reportNotice: message => reported.push(message),
    });
    noteFailure(false);
    noteFailure(false);
    noteFailure(false);
    assert(reported.length === 1 && events[0].consecutiveFailures === 1 && events[2].consecutiveFailures === 3, "Failure reporter emits every telemetry event but reports the threshold notice once");
    noteFailure(true);
    noteFailure(false);
    noteFailure(false);
    assert(reported.length === 2, "Failure reporter resets its consecutive threshold and alert state after success");
  }
  console.log("Application behavior and architecture regression tests:");
  {
    const { app, state, deps } = fixture();
    const simulatedDate = new Date("2032-04-20T12:00:00Z");
    const migrated = normalizeUserData({ solvedQuestionIds: ["legacy-word"] }, () => epoch);
    assert(migrated.learningProgress["legacy-word"].lastAnsweredAt === epoch && JSON.stringify(normalizeUserData(migrated, () => epoch + 1000)) === JSON.stringify(migrated), "Migration uses explicit time and remains idempotent on repeated loads");
    deps.clock.nowDate = () => simulatedDate;
    deps.clock.now = () => simulatedDate.getTime();
    deps.clock.todayISO = () => "2032-04-20";
    state.data.lastActiveDate = "2032-04-20";
    state.data.streak = 2;
    state.remoteResult = { status: "found", data: { ...clone(DEFAULT_USER_DATA), lastActiveDate: "2032-04-01", streak: 99 } };
    const merged = await app.synchronization.signIn(account.uid);
    assert(merged.streak === 2, "Merge decays a stale remote streak against the injected calendar rather than the host clock");
    const json = await app.data.exportUserDataJSON();
    assert(JSON.parse(json).exportedAt === new Date(epoch).toISOString(), "Backup timestamps preserve real wall-clock semantics independently of the learning clock");
    const restored = await app.data.importUserDataJSON(json);
    assert(JSON.stringify(restored) === JSON.stringify(merged), "Backup envelope round-trip preserves the complete persisted user model");
    assert(JSON.stringify(await app.data.importUserDataJSON(JSON.stringify(merged))) === JSON.stringify(merged), "Legacy unwrapped backups remain compatible");
    let error: unknown;
    try { await app.data.importUserDataJSON("invalid json"); } catch (caught) { error = caught; }
    assert(error instanceof Error && error.message === "Geçersiz yedekleme dosyası formatı.", "Malformed backup retains the existing explicit error message");
    const summary = summarizeSession("EXAM", [{ isCorrect: true, xpEarned: 0 }, { isCorrect: false, xpEarned: 0 }], 20);
    assert(summary.totalXpEarned === 0 && summary.correctCount === 1 && summary.mistakesCount === 1 && summary.totalQuestions === 2 && summary.examResult?.passed === false, "Session summary uses recorded XP and the existing exam threshold");
  }
  {
    const { app, state } = fixture();
    await Promise.all([app.progress.hydrate(), app.progress.hydrate()]);
    assert(state.calls.filter(call => call === "local.load").length === 1, "Hydration is owned by one application instance, including repeated React effects");
    assert(app.progress.getSnapshot().isHydrated && app.progress.getSnapshot().userData.lastActiveDate === today, "Guest cold start applies the injected clock and hydrates");
    assert(!state.calls.some(call => call.startsWith("remote.")), "Guest hydration never writes to the cloud");
    let observed = 0;
    const unsubscribe = app.progress.subscribe(() => observed++);
    const initialSnapshot = app.progress.getSnapshot();
    app.progress.getSnapshot().setDisplayName("New name");
    assert(observed === 1 && initialSnapshot !== app.progress.getSnapshot(), "Progress publishes one stable new snapshot per state transition");
    unsubscribe();
    app.progress.getSnapshot().setDisplayName("Another name");
    assert(observed === 1, "Progress subscribers can unsubscribe");
  }
  {
    const initial = { ...clone(DEFAULT_USER_DATA), lastActiveDate: today, dailyQuests: createDailyQuests(1, false) };
    const { app, state } = fixture(initial);
    await app.progress.hydrate();
    const question = allQuestions[0];
    const before = clone(app.progress.getSnapshot().userData);
    const expected = applyPracticeAnswer(before, question, question.meaning, question.xp || 10, "PRACTICE", epoch, today, () => 0.5);
    state.events.length = 0;
    app.progress.getSnapshot().recordAnswer(question, question.meaning, question.xp || 10, "PRACTICE");
    await settle();
    assert(JSON.stringify(app.progress.getSnapshot().userData) === JSON.stringify(expected), "Application answer preserves XP, mastery, daily quests, badges and practice history");
    const answer = state.events.find(event => event.name === "question_answered");
    assert(JSON.stringify(answer?.params) === JSON.stringify({ questionId: question.id, isCorrect: true, isFirstEncounter: true, wasDue: false, usedHint: false, level: question.level, responseTimeMs: null, inferredQuality: null }), "Answer telemetry preserves its existing fields and values");
    assert(state.events.some(event => event.name === "word_mastery_changed") && state.events.some(event => event.name === "daily_quest_completed"), "Mastery and quest transition events are produced alongside the answer");
    assert(app.progress.getSnapshot().badgeUnlockQueue.length > 0, "Only newly earned badges are queued for celebration");
    assert(app.sessions.buildDailySession(app.progress.getSnapshot().userData).every(q => q.id !== question.id), "Daily session excludes words already rewarded");
  }
  {
    const { app, state } = fixture();
    state.signedIn = true;
    await app.progress.hydrate();
    assert(!state.calls.includes("local.save"), "Signed-in hydration leaves the cold-start write to the merge use case");
    state.remoteResult = { status: "failed", error: new Error("offline") };
    state.calls.length = 0;
    let error: unknown;
    try { await app.synchronization.signIn(account.uid); } catch (caught) { error = caught; }
    assert(error instanceof RemoteStateUnknownError, "Unknown remote state remains distinct from an absent document");
    assert(!state.calls.some(call => ["local.save", "remote.profile", "remote.progress"].includes(call)), "Failed remote read performs no local or remote writes");
    state.remoteResult = { status: "found", data: { ...clone(DEFAULT_USER_DATA), lastActiveDate: today, xp: 400, solvedQuestionIds: ["remote-only"], rewardedQuestionIds: ["remote-only"] } };
    state.calls.length = 0;
    const merged = await app.synchronization.signIn(account.uid);
    assert(merged.xp === 400 && merged.solvedQuestionIds.includes("remote-only"), "Signed-in merge retains remote-only progress");
    assert(state.calls.join(",") === "local.load,remote.fetch,remote.profile,remote.progress,local.save", "Sign-in synchronization preserves authoritative write order");
    state.calls.length = 0;
    await app.data.clearAllLocalData();
    await app.progress.getSnapshot().reloadLocalOnly();
    assert(!state.calls.some(call => call.startsWith("remote.")), "Local reset and state reload never push wiped progress to the cloud");
  }
  {
    const { app, state } = fixture();
    state.signedIn = true;
    await app.progress.hydrate();
    state.remoteResult = { status: "found", data: { ...clone(DEFAULT_USER_DATA), lastActiveDate: today, xp: 75 } };
    state.calls.length = 0;
    const result = await app.accountSession.synchronizeAfterSignIn(account.uid);
    assert(result.status === "synchronized", "Account session use case completes the existing sign-in merge");
    assert(state.calls.slice(0, 5).join(",") === "local.load,remote.fetch,remote.profile,remote.progress,local.save", "Account session preserves sign-in merge write order");
    await settle();
    assert(app.progress.getSnapshot().userData.xp === 75, "Account session refreshes the visible progress snapshot after sign-in");

    state.remoteResult = { status: "failed", error: new Error("offline") };
    state.calls.length = 0;
    const failed = await app.accountSession.synchronizeAfterSignIn(account.uid);
    assert(failed.status === "failed" && failed.error instanceof RemoteStateUnknownError, "Account session returns an explicit failed-merge result");
    assert(!state.calls.some(call => ["local.save", "remote.profile", "remote.progress"].includes(call)), "Failed account-session merge does not write local or remote progress");
  }
  {
    const { app, state } = fixture();
    await app.progress.hydrate();
    state.failSave = true;
    app.progress.getSnapshot().setSoundEnabled(false);
    await settle();
    assert(app.progress.getSnapshot().saveFailureNotice === null, "One failed local write does not show a failure notice");
    app.progress.getSnapshot().setSoundEnabled(true);
    await settle();
    assert(app.progress.getSnapshot().saveFailureNotice !== null, "Two consecutive local write failures show the existing notice");
    app.progress.getSnapshot().clearSaveFailureNotice();
    state.failSave = false;
    app.progress.getSnapshot().setSoundEnabled(false);
    await settle();
    state.failSave = true;
    app.progress.getSnapshot().setSoundEnabled(true);
    await settle();
    assert(app.progress.getSnapshot().saveFailureNotice === null, "Successful local save resets the consecutive failure threshold");
    state.signedIn = true; state.failRemote = true; state.failSave = false;
    app.progress.getSnapshot().setAvatarId("sprig");
    await settle();
    assert(app.progress.getSnapshot().cloudSyncFailureNotice === null, "One cloud failure keeps the existing notification threshold");
    app.progress.getSnapshot().setAvatarId("leaf");
    await settle();
    assert(app.progress.getSnapshot().cloudSyncFailureNotice !== null && state.data.avatarId === "leaf", "Repeated cloud failures surface a notice while retaining local progress");
  }
  {
    const { app, state } = fixture();
    await app.progress.hydrate();
    await app.progress.getSnapshot().setNotificationsEnabled(false);
    assert(state.calls.includes("notifications.cancel") && !state.data.notificationsEnabled, "Disabling reminders cancels the notification and persists the disabled preference");
    await app.progress.getSnapshot().setNotificationsEnabled(true);
    assert(state.data.notificationsEnabled, "Granted reminder permission persists the enabled preference");
    state.notificationScheduleFails = true;
    await app.progress.getSnapshot().setNotificationsEnabled(true);
    assert(!state.data.notificationsEnabled, "Notification adapter errors are contained and persist the disabled preference");
  }
  {
    const { app } = fixture();
    await app.progress.hydrate();
    app.progress.getSnapshot().recordTopicAssessment("topic-progression", 0, 0);
    app.progress.getSnapshot().recordTopicAssessment("topic-progression", 4, 5);
    app.progress.getSnapshot().recordTopicAssessment("topic-progression", 2, 5);
    const assessment = app.progress.getSnapshot().userData.topicAssessments["topic-progression"];
    assert(assessment.attempts === 3 && assessment.bestScore === 4 && assessment.passed, "Topic checkpoint keeps best score and prior pass across empty, passing, and later failing attempts");
  }
  {
    const { app, state } = fixture();
    await app.progress.hydrate();
    const record = app.createResultRecorder();
    const questions = app.learning.buildLevelExam("A1");
    const session = { mode: "EXAM" as const, completed: true, level: "A1" as const, questions, answers: questions.map(q => ({ questionId: q.id, isCorrect: true })) };
    record(session); record(session);
    assert(state.events.filter(event => event.name === "level_exam_completed").length === 1, "Repeated completion effects record an exam result once");
    assert(app.progress.getSnapshot().userData.passedLevelExams.includes("A1"), "Passing exam marks the level complete");
    const topicId = questions[0].topicId!;
    const checkpointQuestions = app.learning.buildTopicCheckpoint("A1", topicId);
    const checkpoint = { ...session, mode: "CHECKPOINT" as const, questions: checkpointQuestions, answers: checkpointQuestions.map(q => ({ questionId: q.id, isCorrect: true })) };
    record(checkpoint); record(checkpoint);
    assert(app.progress.getSnapshot().userData.topicAssessments[topicId].attempts === 1, "Repeated checkpoint completion does not double-count attempts");
    const data = { ...clone(DEFAULT_USER_DATA), activeSession: { questionIds: [questions[0].id], currentIndex: 0, answers: [], sessionMode: "EXAM" as const, startedAt: epoch, pickedAnswer: questions[0].meaning, submitted: true, catalogVersion: app.catalogue.CONTENT_VERSION } };
    const restored = restoreSession(data, app.catalogue);
    assert(restored.hasRestorableSession && Boolean(restored.restored?.submitted) && restored.restored?.pickedAnswer === questions[0].meaning, "Session restoration keeps the already-scored answer state");
    assert(!restoreSession({ ...data, activeSession: { ...data.activeSession, catalogVersion: "stale" } }, app.catalogue).hasRestorableSession, "Incompatible catalogue version cannot restore a stale session");
  }
  {
    const { app, state } = fixture();
    state.signedIn = true; state.failDelete = true;
    let error: unknown;
    try { await app.account.deleteAccount(); } catch (caught) { error = caught; }
    assert(error instanceof PartialAccountDeletionError && !state.calls.includes("account.guest"), "Partial account deletion remains explicit and does not report guest-mode success");
    state.failDelete = false;
    await app.account.deleteAccount();
    assert(state.calls.filter(call => call === "remote.delete").length === 2 && state.calls.includes("account.guest"), "Account deletion retry repeats the safe data deletion before removing credentials");
    const backup = await app.data.exportBackup();
    assert(backup !== null && JSON.parse(backup).version === "2.2.0", "Unavailable share UI returns the unchanged backup envelope for display");
  }
  {
    const remote: CatalogueResult = { questions: [allQuestions[0]], version: "remote-v", source: "remote" };
    const cached: CatalogueResult = { ...remote, version: "cache-v", source: "cache" };
    const bundled: CatalogueResult = { ...remote, version: "bundle-v", source: "bundled" };
    let remoteFails = false, cacheFails = false, writeFails = false;
    const load = createCatalogueLoader({
      async remote() { if (remoteFails) throw new Error("remote unavailable/integrity failure"); return remote; },
      async readCache() { if (cacheFails) throw new Error("malformed cache"); return cached; },
      async writeCache() { if (writeFails) throw new Error("disk full"); },
      bundled: () => bundled,
    });
    assert((await load("A1")).source === "remote", "Published remote catalogue has first priority");
    writeFails = true;
    assert((await load("A1")).version === "cache-v", "Cache write failure preserves the previous fallback behavior");
    remoteFails = true;
    assert((await load("A1")).source === "cache", "Remote timeout or integrity failure falls back to valid cached content");
    cacheFails = true;
    assert((await load("A1")).source === "bundled", "Invalid/unavailable cache falls back to bundled content");
    const a = fixture().app, b = fixture().app;
    const original = a.catalogue.getQuestionById(allQuestions[0].id)!;
    const thinRemote = { ...original, meaning: "remote meaning", exampleSentence: "", phonetic: "" };
    a.catalogue.setRuntimeQuestions([thinRemote]);
    assert(a.catalogue.getQuestionById(original.id)?.exampleSentence === original.exampleSentence && a.catalogue.getQuestionById(original.id)?.phonetic === original.phonetic, "Thin remote rows keep bundled teaching enrichment");
    assert(b.catalogue.getQuestionById(original.id)?.meaning === original.meaning, "Runtime catalogue state is isolated between application instances");
  }
  {
    const source = ts.createSourceFile("fixture.ts", `import { A } from './a'; export * from './b'; type T = import('./c').T; import('./d'); require('./e'); require(variable);`, ts.ScriptTarget.Latest, true);
    assert(dependencySpecifiers(source).join(",") === "./a,./b,./c,./d,./e", "Architecture scanner includes imports, re-exports, type imports and literal dynamic/require dependencies");
    assert(boundaryViolation("src/domain/test.ts", "src/infrastructure/storage.ts", "../infrastructure/storage") !== null, "Architecture check rejects domain-to-adapter imports");
    assert(boundaryViolation("src/application/test.ts", null, "firebase/auth") !== null, "Architecture check rejects SDKs in application");
    assert(boundaryViolation("src/screens/Test.tsx", null, "firebase/auth") !== null, "Architecture check rejects SDK access from presentation");
    assert(boundaryViolation("src/screens/Test.tsx", null, "react-native") === null, "Architecture check permits visual platform dependencies");
    assert(boundaryViolation("src/content/test.ts", "src/application/catalogue.ts", "../application/catalogue") !== null, "Architecture check rejects content-to-application dependencies");
    assert(boundaryViolation("src/utils/test.ts", "src/application/catalogue.ts", "../application/catalogue") !== null, "Architecture check closes the generic support escape hatch");
    assert(boundaryViolation("src/infrastructure/test.ts", "src/screens/HomeScreen.tsx", "../screens/HomeScreen") !== null, "Architecture check rejects infrastructure-to-presentation dependencies");
    assert(boundaryViolation("src/screens/Test.tsx", "src/content/levels.ts", "../content/levels") === null, "Architecture check allows read-only bundled content in presentation");
    assert(boundaryViolation("src/screens/Test.tsx", "src/content/editorialQuality.ts", "../content/editorialQuality") !== null, "Architecture check keeps editorial catalogue logic behind application/domain APIs");
    assert(boundaryViolation("src/unclassified/Test.ts", "src/domain/models/user.ts", "../domain/models/user") !== null, "Architecture check rejects unclassified source roots");
    assert(boundaryViolation("src/screens/Test.tsx", null, "expo-speech") !== null, "Architecture check keeps platform data/service SDKs out of presentation");
    assert(importCycles(new Map([["a", ["b"]], ["b", ["a"]]])).length === 1, "Architecture check detects a real dependency cycle");
  }
}
