import { useState, useCallback, useEffect } from "react";
import { MeaningMatchQuestion } from "../types/content";
import { getCurrentLevelUnitQuestions, getQuestionById, getQuestionsByLevel } from "../content/questions";
import { getDueReviewItems } from "../domain/review/spacedRepetition";
import { toPickTheWordSession, canUsePickTheWord } from "../domain/practice/reverseMode";
import { randomizeDistractors } from "../domain/practice/distractors";
import { ActiveSessionState, UserData } from "../types/user";
import { now } from "../utils/clock";
import { track } from "../services/telemetry";

/** Due words, soonest-scheduled first, resolved to real questions. */
function collectDueQuestions(userData: UserData, limit: number): MeaningMatchQuestion[] {
  return getDueReviewItems(userData.learningProgress || {})
    .slice(0, limit)
    .map((item) => getQuestionById(item.questionId))
    .filter((q): q is MeaningMatchQuestion => q !== undefined);
}

/**
 * Whether the learner has spaced-repetition reviews due right now. As long as
 * this is true, normal ("new word") practice is gated behind review — a
 * learner should never be shown a word they've already met a second time
 * inside what's supposed to be new-word practice, and a due word should never
 * resurface silently mixed into that flow with no indication of why it's
 * back. Review is its own mandatory, separate flow instead (see
 * `startPractice`/`startReview` below, and `PracticeHubScreen`).
 */
export function hasPendingReviews(userData: UserData): boolean {
  return getDueReviewItems(userData.learningProgress || {}).length > 0;
}

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
 * Normal ("new word") practice, and ONLY new words — a word the learner has
 * already met is never mixed back in here, by construction. Reviews are a
 * fully separate mandatory flow (`buildReviewSessionCore`). The empty-while-
 * pending guard below is enforced here, in the one place both `startPractice`
 * and any other caller funnel through, rather than trusted to every call
 * site — a caller that forgets to check `hasPendingReviews` first still gets
 * a safely empty session instead of silently leaking due words back in.
 */
function buildDailySessionCore(userData: UserData): MeaningMatchQuestion[] {
  if (hasPendingReviews(userData)) return [];

  const sessionSize = userData.practiceSessionSize || 20;
  const unitQuestions = getCurrentLevelUnitQuestions(userData.level, userData.solvedQuestionIds);
  const freshWords = unitQuestions.filter((q) => !userData.rewardedQuestionIds.includes(q.id));

  const newPortion = pickNewWords(freshWords, sessionSize);
  if (newPortion.length > 0) return newPortion;

  // Nothing unseen left in the current unit and nothing due yet either.
  // Rather than leaving the button dead, offer the words closest to their
  // next review as bonus practice. These pay no XP — they are not due — so
  // practising ahead cannot be farmed.
  return getDueReviewItemsSoonest(userData, sessionSize);
}

/** The mandatory review session: every word due right now, oldest-due first. */
function buildReviewSessionCore(userData: UserData): MeaningMatchQuestion[] {
  return collectDueQuestions(userData, userData.practiceSessionSize || 20);
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

export function buildReviewSession(userData: UserData): MeaningMatchQuestion[] {
  return withFreshDistractors(buildReviewSessionCore(userData));
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
      // A specific word (word notebook, search, "practice this word") was
      // chosen deliberately, so it bypasses the review gate below — the
      // learner asked for exactly this word, review or not.
      if (customQuestions && customQuestions.length > 0) {
        let qList = withFreshDistractors(customQuestions);
        if (reverseMode && canUsePickTheWord(qList.length)) qList = toPickTheWordSession(qList);
        beginSession(qList, "PRACTICE");
        return;
      }

      // Mandatory: due reviews must be cleared before new words are
      // introduced. Every entry point into "normal practice" (home hero,
      // practice hub) calls this same function with no custom questions, so
      // enforcing the gate here — once — means no screen can accidentally
      // skip it. A learner is never shown a word a second time inside what's
      // supposed to be new-word practice.
      if (hasPendingReviews(userData)) {
        const dueList = buildReviewSessionCore(userData);
        const qList = withFreshDistractors(dueList);
        track("practice_session_started", {
          sessionType: "review_only",
          dueCount: dueList.length,
          freshCount: 0,
          reverseMode: false,
        });
        beginSession(qList, "REVIEW");
        return;
      }

      let qList = buildDailySession(userData);
      if (qList.length === 0) return;
      track("practice_session_started", {
        sessionType: "new_only",
        dueCount: 0,
        freshCount: qList.length,
        reverseMode: Boolean(reverseMode),
      });
      if (reverseMode && canUsePickTheWord(qList.length)) qList = toPickTheWordSession(qList);
      beginSession(qList, "PRACTICE");
    },
    [userData, beginSession]
  );

  const startReview = useCallback(() => {
    // No blanket fallback to the whole catalogue — serving un-due words was
    // what quietly defeated the spacing. If nothing is due, hand the learner
    // the ordinary new-word session instead of a dead tap.
    const dueList = buildReviewSessionCore(userData);
    const qList = dueList.length > 0 ? withFreshDistractors(dueList) : buildDailySession(userData);
    if (qList.length === 0) return;

    track("practice_session_started", {
      sessionType: dueList.length > 0 ? "review_only" : "new_only",
      dueCount: dueList.length,
      freshCount: qList.length - dueList.length,
      reverseMode: false,
    });

    beginSession(qList, dueList.length > 0 ? "REVIEW" : "PRACTICE");
  }, [userData, beginSession]);

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
