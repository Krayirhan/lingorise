import { useCallback, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { MeaningMatchQuestion } from "../domain/models/content";
import { Copy } from "../i18n/en";
import { useAppSession } from "../state/useAppSession";
import { useUserProgress } from "../state/useUserProgress";

type Session = ReturnType<typeof useAppSession>;
type UserProgress = ReturnType<typeof useUserProgress>;
export type DeepLinkTarget = "home" | "practice" | "progress" | "profile";

/** Shows the save and cloud-sync failure notices as toasts, once each. */
export function useFailureNoticeToasts(userProgress: UserProgress) {
  const { showToast } = useToast();
  const { saveFailureNotice, clearSaveFailureNotice, cloudSyncFailureNotice, clearCloudSyncFailureNotice } = userProgress;

  useEffect(() => {
    if (!saveFailureNotice) return;
    showToast({ message: saveFailureNotice, type: "attention", durationMs: 5000 });
    clearSaveFailureNotice();
  }, [saveFailureNotice, showToast, clearSaveFailureNotice]);

  useEffect(() => {
    if (!cloudSyncFailureNotice) return;
    showToast({ message: cloudSyncFailureNotice, type: "attention", durationMs: 5000 });
    clearCloudSyncFailureNotice();
  }, [cloudSyncFailureNotice, showToast, clearCloudSyncFailureNotice]);
}

/**
 * Defensive net for CORE-004: session.startPractice/startExam return false
 * instead of silently no-op'ing when there's nothing to build a session from.
 * The primary fix is the UI never offering that CTA once a level is fully
 * learned (PracticeHubScreen/GardenHeroCard), but every entry point is routed
 * through here too so a missed or future call site still surfaces something
 * instead of going dead and unexplained.
 */
export function useSafeSessionStarts(session: Session, copy: Copy, level: Parameters<Session["startExam"]>[0]) {
  const { showToast } = useToast();
  const notifyNothingLeft = useCallback(() => {
    showToast({ message: copy.game.noWordsLeftNotice, type: "attention", durationMs: 4000 });
  }, [showToast, copy]);

  const startPracticeSafe = useCallback((customQuestions?: MeaningMatchQuestion[], reverseMode?: boolean) => {
    if (!session.startPractice(customQuestions, reverseMode)) notifyNothingLeft();
  }, [session, notifyNothingLeft]);

  const startExamSafe = useCallback(() => {
    if (!session.startExam(level)) notifyNothingLeft();
  }, [session, notifyNothingLeft, level]);

  return { startPracticeSafe, startExamSafe };
}

/** Opens the tab a deep link asked for, then reports it consumed. */
export function useDeepLinkNavigation(session: Session, target?: DeepLinkTarget | null, onConsumed?: () => void) {
  useEffect(() => {
    if (!target) return;
    if (target === "practice") session.goToPracticeHome();
    else if (target === "progress") session.goToProgress();
    else if (target === "profile") session.goToProfile();
    else session.goToHome();
    onConsumed?.();
  }, [target, onConsumed, session]);
}
