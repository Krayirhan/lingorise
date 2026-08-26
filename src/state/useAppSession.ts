import { useState, useCallback, useEffect } from "react";
import { MeaningMatchQuestion } from "../types/content";
import { getCurrentLevelUnitQuestions, getQuestionById, getQuestionsByLevel } from "../content/questions";
import { toPickTheWordSession, canUsePickTheWord } from "../domain/practice/reverseMode";
import { randomizeDistractors } from "../domain/practice/distractors";
import { buildLevelExam } from "../domain/learning/levelExam";
import { ActiveSessionState, UserData } from "../types/user";
import { LevelCode } from "../types/content";
import { now } from "../utils/clock";
import { track } from "../services/telemetry";

/**
 * Picks new words ordered by increasing difficulty (1-5), with randomized order
 * within each difficulty group to prevent rote memorization while ensuring a gentle ramp.
 */
export function pickNewWords(freshWords: MeaningMatchQuestion[], count: number): MeaningMatchQuestion[] {
  const byDifficulty = new Map<number, MeaningMatchQuestion[]>();
  for (const q of freshWords) {
    const d = q.difficulty || 1;
    if (!byDifficulty.has(d)) byDifficulty.set(d, []);
    byDifficulty.get(d)!.push(q);
  }
  const ordered = [...byDifficulty.keys()].sort((a, b) => a - b).flatMap((d) => {
    const group = byDifficulty.get(d)!;
    return [...group].sort(() => Math.random() - 0.5); // grup içinde hâlâ rastgele — ezber riski kalmıyor
  });
  return ordered.slice(0, count);
}

/**
 * Daily practice, always and only new words. A word the learner has already
 * met correctly is never shown here again, by construction — there is no
 * review queue mixing anything back in. Level completion is decided
 * separately and explicitly, by the level exam (domain/learning/levelExam.ts),
 * not by resurfacing individual words for reinforcement.
 */
function buildDailySessionCore(userData: UserData): MeaningMatchQuestion[] {
  const sessionSize = userData.practiceSessionSize || 20;
  const unitQuestions = getCurrentLevelUnitQuestions(userData.level, userData.solvedQuestionIds);
  const freshWords = unitQuestions.filter((q) => !userData.rewardedQuestionIds.includes(q.id));

  return pickNewWords(freshWords, sessionSize);
}

/**
 * Draws each question's decoys fresh from its own level's pool (roadmap
 * Birim 10.1) rather than the fixed set baked in at content-authoring time.
 */
function withFreshDistractors(questions: MeaningMatchQuestion[]): MeaningMatchQuestion[] {
  return questions.map((q) => randomizeDistractors(q, getQuestionsByLevel(q.level)));
}

export function buildDailySession(userData: UserData): MeaningMatchQuestion[] {
  return withFreshDistractors(buildDailySessionCore(userData));
}

export type ScreenType = "onboarding" | "home" | "practiceHome" | "practice" | "progress" | "profile";
export type SessionMode = "PRACTICE" | "EXAM";

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

  const beginSession = useCallback(
    (qList: MeaningMatchQuestion[], mode: SessionMode) => {
      if (qList.length === 0) return false;
      setSessionQuestions(qList);
      setCurrentIndex(0);
      setSessionAnswers([]);
      setIsSessionCompleted(false);
      setSessionMode(mode);
      resetQuestionState();
      setScreen("practice");
      return true;
    },
    [resetQuestionState]
  );

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
        track("practice_session_started", {
          freshCount: qList.length,
          reverseMode: Boolean(reverseMode),
        });
      }
      if (reverseMode && canUsePickTheWord(qList.length)) qList = toPickTheWordSession(qList);
      beginSession(qList, "PRACTICE");
    },
    [userData, beginSession]
  );

  /**
   * The level completion exam: 60 questions drawn from the whole level
   * (not just words the learner has already met), easy/medium/hard evenly
   * mixed. Scoring 50+ correct marks the level complete — this replaces
   * per-word spaced-repetition mastery as the promotion gate entirely (see
   * domain/learning/promotion.ts and domain/learning/levelExam.ts).
   */
  const startExam = useCallback(
    (level: LevelCode) => {
      const qList = withFreshDistractors(buildLevelExam(level));
      if (qList.length === 0) return;
      track("level_exam_started", { level, questionCount: qList.length });
      beginSession(qList, "EXAM");
    },
    [beginSession]
  );

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
    startExam,
    goToHome,
    goToPracticeHome,
    goToProgress,
    goToProfile,
    goToOnboarding,
  };
}
