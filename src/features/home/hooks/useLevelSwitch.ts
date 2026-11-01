import { useState } from "react";
import { useApplication } from "../../../context/ApplicationContext";
import { LevelCode } from "../../../domain/models/content";
import { levels } from "../../../content/levels";

export interface LevelOption {
  entry: (typeof levels)[number];
  total: number;
  seen: number;
  ready: boolean;
  isCurrent: boolean;
  isEarned: boolean;
}

/**
 * State and actions behind the level switcher. Picking a level ahead of the
 * learner first asks for confirmation; every other pick applies at once.
 */
export function useLevelSwitch({ visible, currentLevel, solvedQuestionIds, passedLevelExams, onSelect, onClose }: {
  visible: boolean;
  currentLevel: LevelCode;
  solvedQuestionIds: string[];
  passedLevelExams: LevelCode[];
  onSelect: (level: LevelCode) => void;
  onClose: () => void;
}) {
  const application = useApplication();
  const { getQuestionsByLevel, isLevelReady } = application.catalogue;
  const { assessLevelChoice } = application.learning;
  const { track } = application;
  const [pendingLevel, setPendingLevel] = useState<LevelCode | null>(null);

  const options: LevelOption[] = visible
    ? levels.map((entry) => {
      const levelQuestionIds = getQuestionsByLevel(entry.code).map((q) => q.id);
      return {
        entry,
        total: levelQuestionIds.length,
        seen: solvedQuestionIds.filter((id) => levelQuestionIds.includes(id)).length,
        ready: isLevelReady(entry.code),
        isCurrent: entry.code === currentLevel,
        isEarned: passedLevelExams.includes(entry.code),
      };
    })
    : [];

  const pick = (level: LevelCode) => {
    if (level === currentLevel) {
      onClose();
      return;
    }
    if (assessLevelChoice(level, currentLevel, passedLevelExams).isAhead) {
      track("level_switch_warning_shown", { currentLevel, targetLevel: level });
      setPendingLevel(level);
      return;
    }
    onSelect(level);
    onClose();
  };

  const confirmPending = () => {
    if (!pendingLevel) return;
    track("level_switch_confirmed_ahead", { currentLevel, targetLevel: pendingLevel });
    onSelect(pendingLevel);
    setPendingLevel(null);
    onClose();
  };

  return { options, pendingLevel, pick, confirmPending, cancelPending: () => setPendingLevel(null) };
}
