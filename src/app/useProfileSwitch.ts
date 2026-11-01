import { useCallback, useEffect, useRef, useState } from "react";
import { compareProfileProgress, GuestProgressChoice, selectAccountProgress, shouldOfferGuestMerge } from "../domain/sync/profileTransition";
import { DEFAULT_USER_DATA } from "../domain/user/normalization";
import { useApplication } from "../context/ApplicationContext";
import { classifyProfileFailure, ProfileFailure } from "../domain/sync/profileFailure";

type Stage = "loading" | "legacy" | "choice" | "ready" | "error";

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
  const [comparison, setComparison] = useState<ReturnType<typeof compareProfileProgress> | null>(null);
  const lastComparison = useRef<ReturnType<typeof compareProfileProgress> | null>(null);
  const generation = useRef(0);
  const firstEvent = useRef(true);
  const lastEvent = useRef<{ uid: string | null; initial: boolean }>({ uid: null, initial: true });
  const currentUid = useCallback(() => app.account.current()?.uid ?? null, [app]);

  const activateAccount = useCallback(async (id: string, choice: GuestProgressChoice, sequence: number) => {
    if (!app.profiles) throw new Error("Profile storage unavailable");
    let prepared = await app.profiles.prepareAccount(id, "account", currentUid);
    if (choice === "merge") {
      const guest = await app.profiles.loadGuest();
      if (generation.current !== sequence || currentUid() !== id) return;
      const latest = compareProfileProgress(guest, prepared.data);
      if (lastComparison.current && JSON.stringify(latest) !== JSON.stringify(lastComparison.current)) {
        lastComparison.current = latest;
        setComparison(latest);
        setStage("choice");
        return;
      }
      prepared = { ...prepared, choice, data: selectAccountProgress(guest, prepared.data, { status: "absent" }, choice, DEFAULT_USER_DATA, app.clock.nowDate()) };
    }
    const data = await app.profiles.commitAccount(prepared, currentUid);
    if (generation.current !== sequence || currentUid() !== id) return;
    app.progress.activateProfile(`account:${id}`, data);
    setProfile(`account:${id}`);
    setStage("ready");
  }, [app, currentUid]);

  const inspect = useCallback(async (id: string | null, initial: boolean, sequence: number) => {
    if (!app.profiles) throw new Error("Profile storage unavailable");
    await app.progress.beginProfileTransition();
    if (generation.current !== sequence) return;
    if (await app.profiles.readUnassignedLegacyProfile()) {
      if (generation.current === sequence) setStage("legacy");
      return;
    }
    if (id === null) {
      const guest = await app.profiles.loadGuest();
      if (generation.current !== sequence || currentUid() !== null) return;
      app.progress.activateProfile("guest", guest);
      setProfile("guest");
      setStage("ready");
      return;
    }
    const pending = await app.profiles.resumePending(id, currentUid);
    if (generation.current !== sequence || currentUid() !== id) return;
    if (pending) {
      const data = await app.profiles.commitAccount(pending, currentUid);
      if (generation.current !== sequence || currentUid() !== id) return;
      app.progress.activateProfile(`account:${id}`, data);
      setProfile(`account:${id}`);
      setStage("ready");
      return;
    }
    const [guest, cached] = await Promise.all([app.profiles.loadGuest(), app.profiles.hasAccountCache(id)]);
    if (generation.current !== sequence || currentUid() !== id) return;
    const account = await app.profiles.prepareAccount(id, "account", currentUid);
    if (generation.current !== sequence || currentUid() !== id) return;
    if (shouldOfferGuestMerge(guest, initial, cached, account.data, app.clock.nowDate())) {
      const latest = compareProfileProgress(guest, account.data);
      lastComparison.current = latest;
      setComparison(latest);
      setStage("choice");
      return;
    }
    const data = await app.profiles.commitAccount(account, currentUid);
    if (generation.current !== sequence || currentUid() !== id) return;
    app.progress.activateProfile(`account:${id}`, data);
    setProfile(`account:${id}`);
    setStage("ready");
  }, [app, currentUid]);

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
    void inspect(id, initial, sequence).catch(error => { if (generation.current === sequence) { setFailure(reportTransitionError(error)); setStage("error"); } });
  }), [app, inspect]);

  const chooseLegacy = async (importAsGuest: boolean) => {
    const sequence = generation.current;
    setStage("loading");
    try {
      await app.profiles!.resolveLegacyProfile(importAsGuest);
      await inspect(lastEvent.current.uid, lastEvent.current.initial, sequence);
    } catch (error) { if (generation.current === sequence) { setFailure(reportTransitionError(error)); setStage("error"); } }
  };
  const chooseAccount = async (choice: GuestProgressChoice) => {
    if (!uid) return;
    const sequence = generation.current;
    setStage("loading");
    try { await activateAccount(uid, choice, sequence); }
    catch (error) { if (generation.current === sequence) { setFailure(reportTransitionError(error)); setStage("error"); } }
  };
  const backToGuest = async () => {
    setStage("loading");
    try { await app.signOutProfile(); }
    catch (error) { setFailure(reportTransitionError(error)); setStage("error"); }
  };
  return { stage, profile, failure, comparison, retry, chooseLegacy, chooseAccount, backToGuest, hasAccount: uid !== null };
}
