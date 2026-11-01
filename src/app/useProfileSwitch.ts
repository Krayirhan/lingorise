import { useCallback, useEffect, useRef, useState } from "react";
import { compareProfileProgress, GuestProgressChoice, selectAccountProgress, shouldOfferGuestMerge } from "../domain/sync/profileTransition";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { useApplication } from "../context/ApplicationContext";
import { classifyProfileFailure, ProfileFailure } from "../domain/sync/profileFailure";

type Stage = "loading" | "legacy" | "choice" | "ready" | "error";
type ProfileStore = NonNullable<ReturnType<typeof useApplication>["profiles"]>;
type PreparedAccount = Parameters<ProfileStore["commitAccount"]>[0];
type ProgressComparison = ReturnType<typeof compareProfileProgress>;

function requireProfiles(store: ProfileStore | undefined | null): ProfileStore {
  if (!store) throw new Error("Profile storage unavailable");
  return store;
}

function reportTransitionError(error: unknown): ProfileFailure {
  const code = classifyProfileFailure(error);
  // Never log profile contents, account identifiers or credentials.
  console.warn(`Profile transition failed (${code})`);
  return code;
}

export function useProfileSwitch() {
  const app = useApplication();
  const [stage, setStage] = useState<Stage>("loading");
  const [profile, setProfile] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [failure, setFailure] = useState<ProfileFailure>("unknown");
  const [comparison, setComparison] = useState<ProgressComparison | null>(null);
  const lastComparison = useRef<ProgressComparison | null>(null);
  const generation = useRef(0);
  const firstEvent = useRef(true);
  const lastEvent = useRef<{ uid: string | null; initial: boolean }>({ uid: null, initial: true });
  const currentUid = useCallback(() => app.account.current()?.uid ?? null, [app]);
  const isStale = useCallback((sequence: number, id: string | null) => generation.current !== sequence || currentUid() !== id, [currentUid]);

  const offerChoice = useCallback((latest: ProgressComparison) => {
    lastComparison.current = latest;
    setComparison(latest);
    setStage("choice");
  }, []);

  // Commits a prepared account profile and makes it the active one, unless a
  // newer auth event or a different signed-in user has superseded this run.
  const finishAccount = useCallback(async (id: string, prepared: PreparedAccount, sequence: number) => {
    const data = await requireProfiles(app.profiles).commitAccount(prepared, currentUid);
    if (isStale(sequence, id)) return;
    app.progress.activateProfile(`account:${id}`, data);
    setProfile(`account:${id}`);
    setStage("ready");
  }, [app, currentUid, isStale]);

  const activateAccount = useCallback(async (id: string, choice: GuestProgressChoice, sequence: number) => {
    const profiles = requireProfiles(app.profiles);
    let prepared = await profiles.prepareAccount(id, "account", currentUid);
    if (choice === "merge") {
      const guest = await profiles.loadGuest();
      if (isStale(sequence, id)) return;
      const latest = compareProfileProgress(guest, prepared.data);
      if (lastComparison.current && JSON.stringify(latest) !== JSON.stringify(lastComparison.current)) return offerChoice(latest);
      prepared = { ...prepared, choice, data: selectAccountProgress(guest, prepared.data, { status: "absent" }, choice, DEFAULT_USER_DATA, app.clock.nowDate()) };
    }
    await finishAccount(id, prepared, sequence);
  }, [app, currentUid, isStale, offerChoice, finishAccount]);

  const inspect = useCallback(async (id: string | null, initial: boolean, sequence: number) => {
    const profiles = requireProfiles(app.profiles);
    await app.progress.beginProfileTransition();
    if (generation.current !== sequence) return;
    if (await profiles.readUnassignedLegacyProfile()) {
      if (generation.current === sequence) setStage("legacy");
      return;
    }
    if (id === null) {
      const guest = await profiles.loadGuest();
      if (isStale(sequence, null)) return;
      app.progress.activateProfile("guest", guest);
      setProfile("guest");
      setStage("ready");
      return;
    }
    const pending = await profiles.resumePending(id, currentUid);
    if (isStale(sequence, id)) return;
    if (pending) return finishAccount(id, pending, sequence);
    const [guest, cached] = await Promise.all([profiles.loadGuest(), profiles.hasAccountCache(id)]);
    if (isStale(sequence, id)) return;
    const account = await profiles.prepareAccount(id, "account", currentUid);
    if (isStale(sequence, id)) return;
    if (shouldOfferGuestMerge(guest, initial, cached, account.data, app.clock.nowDate())) return offerChoice(compareProfileProgress(guest, account.data));
    await finishAccount(id, account, sequence);
  }, [app, currentUid, isStale, offerChoice, finishAccount]);

  // Records a failed transition only while it is still the current one.
  const fail = useCallback((sequence: number, error: unknown) => {
    if (generation.current !== sequence) return;
    setFailure(reportTransitionError(error));
    setStage("error");
  }, []);

  const retry = useCallback(() => {
    const sequence = ++generation.current;
    setStage("loading");
    void inspect(lastEvent.current.uid, lastEvent.current.initial, sequence).catch(error => {
      setFailure(reportTransitionError(error));
      if (generation.current === sequence) setStage("error");
    });
  }, [inspect]);

  useEffect(() => app.account.subscribe(user => {
    const sequence = ++generation.current;
    const id = user?.uid ?? null;
    const initial = firstEvent.current;
    firstEvent.current = false;
    lastEvent.current = { uid: id, initial };
    setUid(id);
    setStage("loading");
    void inspect(id, initial, sequence).catch(error => fail(sequence, error));
  }), [app, inspect, fail]);

  const chooseLegacy = async (importAsGuest: boolean) => {
    const sequence = generation.current;
    setStage("loading");
    try {
      await requireProfiles(app.profiles).resolveLegacyProfile(importAsGuest);
      await inspect(lastEvent.current.uid, lastEvent.current.initial, sequence);
    } catch (error) { fail(sequence, error); }
  };
  const chooseAccount = async (choice: GuestProgressChoice) => {
    if (!uid) return;
    const sequence = generation.current;
    setStage("loading");
    try { await activateAccount(uid, choice, sequence); }
    catch (error) { fail(sequence, error); }
  };
  const backToGuest = async () => {
    setStage("loading");
    try { await app.signOutProfile(); }
    catch (error) { setFailure(reportTransitionError(error)); setStage("error"); }
  };
  return { stage, profile, failure, comparison, retry, chooseLegacy, chooseAccount, backToGuest, hasAccount: uid !== null };
}
