import { useEffect, useRef, useState, useCallback } from "react";
import { MeaningMatchQuestion } from "../../../types/content";
import { AnswerQualityMeta } from "../../../domain/review/qualitySignal";

export type { AnswerQualityMeta };

export function usePracticeSession(
  question: MeaningMatchQuestion,
  correctAnswer: string,
  onCheckAnswer: (xpReward: number, quality: AnswerQualityMeta) => void,
  /**
   * True for a word the learner has repeatedly missed (a "leech" — see
   * domain/learning/mastery.ts's isLeech). Its hint opens automatically
   * instead of staying hidden behind an extra tap, since a word that's
   * already proven hard doesn't need one more small barrier. This reveal is
   * the app's own choice, not the learner's, so it never carries the usual
   * hint XP penalty (see `hintPenaltyApplies` below).
   */
  autoRevealHint = false
) {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(autoRevealHint);
  const [hintPenaltyApplies, setHintPenaltyApplies] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [remindSuccess, setRemindSuccess] = useState(false);

  const baseReward = question.xp || 10;
  const xpReward = hintPenaltyApplies ? Math.max(2, baseReward - 2) : baseReward;

  // roadmap Birim 3 §3.1 — an indirect quality signal (response time, hint
  // use, retry count) collected without asking the learner anything new.
  const questionShownAtRef = useRef(Date.now());
  const attemptNumberRef = useRef(1);

  // Shuffle options on question change
  useEffect(() => {
    const rawList = question.options || [correctAnswer, ...(question.wrongOptions || [])];
    const list = [...rawList];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setShuffledOptions(list);
    setShowHint(autoRevealHint);
    setHintPenaltyApplies(false);
    setIsChecking(false);
    setRemindSuccess(false);
    questionShownAtRef.current = Date.now();
    attemptNumberRef.current = 1;
  }, [question.id, correctAnswer, question.options, question.wrongOptions, autoRevealHint]);

  const toggleHint = useCallback(() => {
    setShowHint((prev) => {
      const next = !prev;
      // Only a learner-initiated reveal costs XP — the automatic one for a
      // leech word never does, and toggling it off and back on doesn't
      // retroactively turn that same reveal into a penalized one.
      if (next && !autoRevealHint) setHintPenaltyApplies(true);
      return next;
    });
  }, [autoRevealHint]);

  const handleCheck = useCallback(
    (picked: string | null, submitted: boolean) => {
      if (!picked || submitted || isChecking) return;
      setIsChecking(true);
      const isCorrect = picked === correctAnswer;
      const quality: AnswerQualityMeta = {
        responseTimeMs: Date.now() - questionShownAtRef.current,
        attemptNumber: attemptNumberRef.current,
      };
      // A wrong attempt (via "Tekrar Dene") means the NEXT check on this same
      // question is no longer a clean first try — count it, then reset the
      // clock so response time reflects thinking time on the retry itself.
      if (!isCorrect) {
        attemptNumberRef.current += 1;
      }
      questionShownAtRef.current = Date.now();
      setTimeout(() => {
        setIsChecking(false);
        onCheckAnswer(xpReward, quality);
      }, 240);
    },
    [isChecking, onCheckAnswer, xpReward, correctAnswer]
  );

  return {
    shuffledOptions,
    showHint,
    toggleHint,
    isChecking,
    remindSuccess,
    setRemindSuccess,
    xpReward,
    handleCheck,
  };
}
