import { LevelCode } from "../../domain/models/content";
import { LevelProgressItem, TopicProgressItem } from "../../features/progress/progress.types";
import { ProgressScreen } from "../../screens/ProgressScreen";
import { MainRouteDependencies } from "../mainRoute.types";

export function ProgressRoute({ userData, copy, homeViewModel, getQuestionsByLevel, isLevelReady, getTopicProgressSummaries, startPracticeSafe, session, handleTabPress }: MainRouteDependencies) {
  const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const levelProgressList: LevelProgressItem[] = levels.map(level => {
    const questions = getQuestionsByLevel(level);
    const questionIds = new Set(questions.map(question => question.id));
    return {
      level,
      total: questions.length,
      seen: userData.solvedQuestionIds.filter(id => questionIds.has(id)).length,
      examPassed: (userData.passedLevelExams || []).includes(level),
      isReady: isLevelReady(level),
    };
  });
  const topicBreakdown: TopicProgressItem[] = getTopicProgressSummaries(
    userData.level,
    userData.solvedQuestionIds,
    userData.learningProgress,
    userData.locale,
    userData.topicAssessments,
  ).map(topic => ({ ...topic, topic: topic.title }));
  const levelQuestions = getQuestionsByLevel(userData.level);
  const levelQuestionIds = new Set(levelQuestions.map(question => question.id));

  return (
    <ProgressScreen
      copy={copy}
      locale={userData.locale}
      xp={userData.xp}
      streak={userData.streak}
      level={userData.level}
      gardenProgress={homeViewModel.gardenProgress}
      totalSolved={(userData.rewardedQuestionIds || []).length}
      seenWordCount={userData.solvedQuestionIds.filter(id => levelQuestionIds.has(id)).length}
      levelWordCount={levelQuestions.length}
      levelProgressList={levelProgressList}
      topicBreakdown={topicBreakdown}
      solvedQuestionIds={userData.solvedQuestionIds}
      lastActiveDate={userData.lastActiveDate}
      practiceHistory={userData.practiceHistory}
      unlockedBadges={userData.unlockedBadges}
      onPracticeWord={question => startPracticeSafe([question])}
      onBack={session.goToHome}
      onTabPress={handleTabPress}
      reduceMotion={userData.reduceMotion}
    />
  );
}
