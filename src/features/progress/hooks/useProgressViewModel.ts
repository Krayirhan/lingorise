import { useMemo } from "react";
import { useApplication } from "../../../context/ApplicationContext";
import { LevelCode } from "../../../domain/models/content";
import { UserData } from "../../../domain/models/user";
import { LevelProgressItem, TopicProgressItem } from "../progress.types";

const LEVELS: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Per-level and per-topic progress the Progress screen shows. */
export function useProgressViewModel(userData: UserData) {
  const application = useApplication();
  const { getQuestionsByLevel, isLevelReady } = application.catalogue;
  const { getTopicProgressSummaries } = application.learning;

  return useMemo(() => {
    const solved = userData.solvedQuestionIds;
    const levelProgressList: LevelProgressItem[] = LEVELS.map((level) => {
      const questions = getQuestionsByLevel(level);
      const questionIds = new Set(questions.map((question) => question.id));
      return {
        level,
        total: questions.length,
        seen: solved.filter((id) => questionIds.has(id)).length,
        examPassed: (userData.passedLevelExams || []).includes(level),
        isReady: isLevelReady(level),
      };
    });
    const topicBreakdown: TopicProgressItem[] = getTopicProgressSummaries(
      userData.level,
      solved,
      userData.learningProgress,
      userData.locale,
      userData.topicAssessments,
    ).map((topic) => ({ ...topic, topic: topic.title }));
    const current = levelProgressList.find((item) => item.level === userData.level);

    return {
      levelProgressList,
      topicBreakdown,
      seenWordCount: current?.seen ?? 0,
      levelWordCount: current?.total ?? 0,
    };
  }, [userData, getQuestionsByLevel, isLevelReady, getTopicProgressSummaries]);
}
