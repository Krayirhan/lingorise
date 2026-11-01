import { useMemo } from "react";
import { useApplication } from "../../../context/ApplicationContext";
import { LevelCode } from "../../../domain/models/content";
import { PracticeHistoryEntry } from "../../../domain/models/user";
import { buildActivityHeatmap, HeatmapWeek } from "../activityHeatmapModel";

export interface HerbariumSlot {
  id: string;
  word: string;
  meaning: string;
  learned: boolean;
}

export interface ProgressVisuals {
  unitNumber: number;
  slots: HerbariumSlot[];
  heatmap: HeatmapWeek[];
}

/** The current unit's words as herbarium slots, plus the practice heatmap. */
export function useProgressVisuals(
  level: LevelCode,
  solvedQuestionIds: string[],
  practiceHistory: PracticeHistoryEntry[],
): ProgressVisuals {
  const application = useApplication();
  const { getLevelUnitInfo } = application.catalogue;
  const { todayISO } = application.clock;

  return useMemo(() => {
    const unit = getLevelUnitInfo(level, solvedQuestionIds);
    const solved = new Set(solvedQuestionIds);
    return {
      unitNumber: unit.unitIndex + 1,
      slots: unit.questions.map((question) => ({
        id: question.id,
        word: question.word || question.prompt || "",
        meaning: question.meaning || question.answer || "",
        learned: solved.has(question.id),
      })),
      heatmap: buildActivityHeatmap(todayISO(), practiceHistory),
    };
  }, [getLevelUnitInfo, todayISO, level, solvedQuestionIds, practiceHistory]);
}
