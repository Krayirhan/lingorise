import { useEffect, useState, useCallback } from "react";
import { MeaningMatchQuestion } from "../../../types/content";

export function usePracticeSession(
  question: MeaningMatchQuestion,
  correctAnswer: string,
  onCheckAnswer: (xpReward: number) => void
) {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [remindSuccess, setRemindSuccess] = useState(false);

  const baseReward = question.xp || 10;
  const xpReward = showHint ? Math.max(2, baseReward - 2) : baseReward;

  // Shuffle options on question change
  useEffect(() => {
    const rawList = question.options || [correctAnswer, ...(question.wrongOptions || [])];
    const list = [...rawList];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setShuffledOptions(list);
    setShowHint(false);
    setIsChecking(false);
    setRemindSuccess(false);
  }, [question.id, correctAnswer, question.options, question.wrongOptions]);

  const handleCheck = useCallback(
    (picked: string | null, submitted: boolean) => {
      if (!picked || submitted || isChecking) return;
      setIsChecking(true);
      setTimeout(() => {
        setIsChecking(false);
        onCheckAnswer(xpReward);
      }, 240);
    },
    [isChecking, onCheckAnswer, xpReward]
  );

  return {
    shuffledOptions,
    showHint,
    setShowHint,
    isChecking,
    remindSuccess,
    setRemindSuccess,
    xpReward,
    handleCheck,
  };
}
