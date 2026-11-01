import { useCallback, useEffect, useState } from "react";
import { buildActiveSession, restoreSession } from "../application/sessionRestoration";
import { useApplication } from "../context/ApplicationContext";
import { LevelCode, MeaningMatchQuestion } from "../domain/models/content";
import { ActiveSessionState, UserData } from "../domain/models/user";

export type ScreenType = "onboarding" | "home" | "practiceHome" | "practice" | "progress" | "profile";
export type SessionMode = "PRACTICE" | "EXAM" | "CHECKPOINT";

export interface SessionAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  xpEarned: number;
}

export function useAppSession(userData: UserData, setActiveSession?: (session: ActiveSessionState | null) => void) {
  const application = useApplication();
  const { CONTENT_VERSION } = application.catalogue;
  const { now } = application.clock;
  const createSessionId = () => `session-${now()}-${application.random.next().toString(36).slice(2, 10)}`;

  const { restored, questions: restoredQuestions, hasRestorableSession } = restoreSession(userData, application.catalogue);
  const [screen, setScreen] = useState<ScreenType>(hasRestorableSession ? "practice" : userData.onboardingCompleted ? "home" : "onboarding");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sessionMode, setSessionMode] = useState<SessionMode>(restored?.sessionMode || "PRACTICE");
  const [sessionId, setSessionId] = useState(restored?.sessionId || createSessionId());
  const [sessionQuestions, setSessionQuestions] = useState<MeaningMatchQuestion[]>(restoredQuestions);
  const [currentIndex, setCurrentIndex] = useState(Math.min(restored?.currentIndex || 0, Math.max(0, restoredQuestions.length - 1)));
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswerRecord[]>(restored?.answers || []);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [picked, setPicked] = useState<string | null>(restored?.pickedAnswer ?? null);
  const [submitted, setSubmitted] = useState(restored?.submitted ?? false);
  const [writingOffer, setWritingOffer] = useState<ActiveSessionState["writingOffer"]>(restored?.writingOffer);

  useEffect(() => {
    if (!setActiveSession) return;
    if (screen !== "practice" || isSessionCompleted || sessionQuestions.length === 0) {
      setActiveSession(null);
      return;
    }
    setActiveSession(buildActiveSession({
      sessionId, catalogVersion: CONTENT_VERSION, questions: sessionQuestions, currentIndex, answers: sessionAnswers,
      sessionMode, startedAt: restored?.startedAt || now(), pickedAnswer: picked, submitted, writingOffer,
    }));
  }, [screen, isSessionCompleted, sessionQuestions, currentIndex, sessionAnswers, sessionMode, sessionId, picked, submitted, writingOffer, setActiveSession]);

  const resetQuestionState = useCallback(() => {
    setPicked(null);
    setSubmitted(false);
  }, []);

  const beginSession = useCallback(
    (qList: MeaningMatchQuestion[], mode: SessionMode) => {
      if (qList.length === 0) return false;
      setSessionQuestions(qList);
      setSessionId(createSessionId());
      setCurrentIndex(0);
      setSessionAnswers([]);
      setWritingOffer(undefined);
      setIsSessionCompleted(false);
      setSessionMode(mode);
      resetQuestionState();
      setScreen("practice");
      return true;
    },
    [resetQuestionState]
  );

  /** Returns false (and starts nothing) when there is no session to build — the caller must not treat that as success (CORE-004). */
  const startPractice = useCallback((customQuestions?: MeaningMatchQuestion[], reverseMode?: boolean): boolean => {
    const latestUser = application.progress.getSnapshot().isHydrated
      ? application.progress.getSnapshot().userData
      : userData;
    const questions = application.sessionCommands.practice(latestUser, customQuestions, reverseMode);
    return questions ? beginSession(questions, "PRACTICE") : false;
  }, [application, userData, beginSession]);

  const startExam = useCallback((level: LevelCode): boolean => {
    const questions = application.sessionCommands.exam(level);
    return questions ? beginSession(questions, "EXAM") : false;
  }, [application, beginSession]);

  const startTopicCheckpoint = useCallback((level: LevelCode, topicId: string): boolean => {
    const questions = application.sessionCommands.checkpoint(level, topicId);
    return questions ? beginSession(questions, "CHECKPOINT") : false;
  }, [application, beginSession]);

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
      application.sessionCommands.complete(sessionAnswers, sessionQuestions.length, sessionMode);
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
    // where the app is
    screen, onboardingStep, setOnboardingStep,
    // the running session
    sessionMode, sessionQuestions, currentIndex, sessionAnswers, isSessionCompleted, currentQuestion,
    picked, submitted, writingOffer, setWritingOffer, setPicked, setSubmitted,
    resetQuestionState, recordSessionStep, nextQuestion,
    // starting sessions and moving between screens
    startPractice, startExam, startTopicCheckpoint,
    goToHome, goToPracticeHome, goToProgress, goToProfile, goToOnboarding,
  };
}
