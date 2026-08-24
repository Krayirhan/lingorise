import { useState, useCallback, useEffect } from "react";
import { MeaningMatchQuestion } from "../types/content";
import { getCurrentLevelUnitQuestions, getQuestionById, getQuestionsByLevel } from "../content/questions";
import { getDueReviewItems } from "../domain/review/spacedRepetition";
import { toPickTheWordSession, canUsePickTheWord } from "../domain/practice/reverseMode";
import { randomizeDistractors } from "../domain/practice/distractors";
import { ActiveSessionState, UserData } from "../types/user";
import { now } from "../utils/clock";
import { track } from "../services/telemetry";

/**
 * Above this much overdue material, new words stop being introduced. Piling
 * fresh vocabulary on top of a backlog is how learners end up drowning and
 * quitting, so the garden gets watered before anything new is planted.
 */
export const REVIEW_DEBT_LIMIT = 40;

/** Due words, soonest-scheduled first, resolved to real questions. */
function collectDueQuestions(userData: UserData, limit: number): MeaningMatchQuestion[] {
  return getDueReviewItems(userData.learningProgress || {})
    .slice(0, limit)
    .map((item) => getQuestionById(item.questionId))
    .filter((q): q is MeaningMatchQuestion => q !== undefined);
}

/**
 * One session for the day: overdue reviews first, then new words for whatever
 * room is left. A single flow means the review debt can no longer be skipped.
 */
function buildDailySessionCore(userData: UserData): MeaningMatchQuestion[] {
  const sessionSize = userData.practiceSessionSize || 20;
  const dueQuestions = collectDueQuestions(userData, sessionSize);

  const remainingSlots = sessionSize - dueQuestions.length;
  const totalDue = getDueReviewItems(userData.learningProgress || {}).length;
  if (remainingSlots <= 0 || totalDue >= REVIEW_DEBT_LIMIT) return dueQuestions;

  const unitQuestions = getCurrentLevelUnitQuestions(userData.level, userData.solvedQuestionIds);
  const dueIds = new Set(dueQuestions.map((q) => q.id));
  const freshWords = unitQuestions.filter(
    (q) => !userData.rewardedQuestionIds.includes(q.id) && !dueIds.has(q.id)
  );

  const newPortion = [...freshWords].sort(() => Math.random() - 0.5).slice(0, remainingSlots);
  const session = [...dueQuestions, ...newPortion];
  if (session.length > 0) return session;

  // Nothing due and no unseen words left in the unit. Rather than leaving the
  // button dead, offer the words closest to their next review. These pay no XP
  // — they are not due — so practising ahead cannot be farmed.
  return getDueReviewItemsSoonest(userData, sessionSize);
}

/**
 * Draws each question's decoys fresh from its own level's pool (roadmap
 * Birim 10.1) rather than the fixed set baked in at content-authoring time.
 * A due review pulled in from a level the learner has since moved past still
 * gets decoys from ITS level, not the learner's current one.
 */
function withFreshDistractors(questions: MeaningMatchQuestion[]): MeaningMatchQuestion[] {
  return questions.map((q) => randomizeDistractors(q, getQuestionsByLevel(q.level)));
}

export function buildDailySession(userData: UserData): MeaningMatchQuestion[] {
  return withFreshDistractors(buildDailySessionCore(userData));
}

/** Known words ordered by how soon they come around again. */
function getDueReviewItemsSoonest(userData: UserData, limit: number): MeaningMatchQuestion[] {
  return Object.entries(userData.learningProgress || {})
    .filter(([, item]) => item.attempts > 0)
    .sort((a, b) => a[1].nextReviewAt - b[1].nextReviewAt)
    .slice(0, limit)
    .map(([id]) => getQuestionById(id))
    .filter((q): q is MeaningMatchQuestion => q !== undefined);
}

export type ScreenType = "onboarding" | "home" | "practiceHome" | "practice" | "progress" | "profile";
export type SessionMode = "PRACTICE" | "REVIEW";

export interface SessionAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  xpEarned: number;
}

export function useAppSession(userData: UserData, setActiveSession?: (session: ActiveSessionState | null) => void) {
  const restored = userData.activeSession || null;
  const restoredQuestions = restored?.questionIds
    .map((id) => getQuestionById(id))
    .filter((q): q is MeaningMatchQuestion => q !== undefined) || [];
  const hasRestorableSession = restoredQuestions.length > 0 && !!restored;
  const [screen, setScreen] = useState<ScreenType>(hasRestorableSession ? "practice" : userData.onboardingCompleted ? "home" : "onboarding");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sessionMode, setSessionMode] = useState<SessionMode>(restored?.sessionMode || "PRACTICE");
  const [sessionQuestions, setSessionQuestions] = useState<MeaningMatchQuestion[]>(restoredQuestions);
  const [currentIndex, setCurrentIndex] = useState(Math.min(restored?.currentIndex || 0, Math.max(0, restoredQuestions.length - 1)));
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswerRecord[]>(restored?.answers || []);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!setActiveSession) return;
    if (screen !== "practice" || isSessionCompleted || sessionQuestions.length === 0) {
      setActiveSession(null);
      return;
    }
    setActiveSession({
      questionIds: sessionQuestions.map((question) => question.id),
      currentIndex,
      answers: sessionAnswers,
      sessionMode,
      startedAt: restored?.startedAt || now(),
    });
  }, [screen, isSessionCompleted, sessionQuestions, currentIndex, sessionAnswers, sessionMode, setActiveSession]);

  const resetQuestionState = useCallback(() => {
    setPicked(null);
    setSubmitted(false);
  }, []);

  const startPractice = useCallback(
    (customQuestions?: MeaningMatchQuestion[], reverseMode?: boolean) => {
      let qList: MeaningMatchQuestion[] = [];

      if (customQuestions && customQuestions.length > 0) {
        qList = withFreshDistractors(customQuestions);
      } else {
        qList = buildDailySession(userData);
      }

      if (qList.length === 0) return;

      if (!customQuestions) {
        const dueIds = new Set(getDueReviewItems(userData.learningProgress || {}).map((i) => i.questionId));
        const dueCount = qList.filter((q) => dueIds.has(q.id)).length;
        const freshCount = qList.length - dueCount;
        const sessionType = dueCount > 0 && freshCount > 0 ? "mixed" : dueCount > 0 ? "review_only" : "new_only";
        track("practice_session_started", { sessionType, dueCount, freshCount, reverseMode: Boolean(reverseMode) });
        if (dueIds.size >= REVIEW_DEBT_LIMIT && freshCount === 0 && dueCount > 0) {
          track("review_debt_capped", { dueCount: dueIds.size, sessionSize: userData.practiceSessionSize });
        }
      }

      if (reverseMode && canUsePickTheWord(qList.length)) {
        qList = toPickTheWordSession(qList);
      }

      setSessionQuestions(qList);
      setCurrentIndex(0);
      setSessionAnswers([]);
      setIsSessionCompleted(false);
      setSessionMode("PRACTICE");
      resetQuestionState();
      setScreen("practice");
    },
    [userData, resetQuestionState]
  );

  const startReview = useCallback(() => {
    // No blanket fallback to the whole catalogue — serving un-due words was
    // what quietly defeated the spacing. If nothing is due, hand the learner
    // the ordinary daily session instead of a dead tap.
    const dueList = collectDueQuestions(userData, userData.practiceSessionSize);
    const qList = withFreshDistractors(dueList.length > 0 ? dueList : buildDailySessionCore(userData));
    if (qList.length === 0) return;

    track("practice_session_started", {
      sessionType: dueList.length > 0 ? "review_only" : "new_only",
      dueCount: dueList.length,
      freshCount: qList.length - dueList.length,
      reverseMode: false,
    });

    setSessionQuestions(qList);
    setCurrentIndex(0);
    setSessionAnswers([]);
    setIsSessionCompleted(false);
    setSessionMode("REVIEW");
    resetQuestionState();
    setScreen("practice");
  }, [userData, resetQuestionState]);

  const recordSessionStep = useCallback((isCorrect: boolean, xpEarned: number) => {
    const currentQ = sessionQuestions[currentIndex];
    if (currentQ) {
      setSessionAnswers((prev) => [...prev, { questionId: currentQ.id, isCorrect, xpEarned }]);
    }
  }, [sessionQuestions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      track("practice_session_completed", {
        questionsAnswered: sessionAnswers.length,
        questionsTotal: sessionQuestions.length,
        correctCount: sessionAnswers.filter((a) => a.isCorrect).length,
        sessionMode,
      });
      setIsSessionCompleted(true);
      resetQuestionState();
    }
  }, [currentIndex, sessionQuestions.length, sessionAnswers, sessionMode, resetQuestionState]);

  const goToHome = useCallback(() => {
    setScreen("home");
    setIsSessionCompleted(false);
    resetQuestionState();
  }, [resetQuestionState]);

  const goToPracticeHome = useCallback(() => setScreen("practiceHome"), []);

  const goToProgress = useCallback(() => setScreen("progress"), []);
  const goToProfile = useCallback(() => setScreen("profile"), []);
  const goToOnboarding = useCallback((step = 0) => {
    setOnboardingStep(step);
    setScreen("onboarding");
  }, []);

  // Only ever the question the session is actually on. The old fallback to the
  // level's first question meant an empty session showed something unrelated.
  const currentQuestion: MeaningMatchQuestion | undefined = sessionQuestions[currentIndex];

  return {
    screen,
    onboardingStep,
    sessionMode,
    sessionQuestions,
    currentIndex,
    sessionAnswers,
    isSessionCompleted,
    currentQuestion,
    picked,
    submitted,
    setPicked,
    setSubmitted,
    setOnboardingStep,
    resetQuestionState,
    recordSessionStep,
    nextQuestion,
    startPractice,
    startReview,
    goToHome,
    goToPracticeHome,
    goToProgress,
    goToProfile,
    goToOnboarding,
  };
}
