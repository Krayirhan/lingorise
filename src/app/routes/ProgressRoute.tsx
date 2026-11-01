import { useProgressViewModel } from "../../features/progress/hooks/useProgressViewModel";
import { ProgressScreen } from "../../screens/ProgressScreen";
import { MainRouteDependencies } from "../mainRoute.types";

export function ProgressRoute({ userData, copy, homeViewModel, startPracticeSafe, session, handleTabPress }: MainRouteDependencies) {
  const { levelProgressList, topicBreakdown, seenWordCount, levelWordCount } = useProgressViewModel(userData);

  return (
    <ProgressScreen
      copy={copy}
      locale={userData.locale}
      xp={userData.xp}
      streak={userData.streak}
      level={userData.level}
      gardenProgress={homeViewModel.gardenProgress}
      totalSolved={(userData.rewardedQuestionIds || []).length}
      seenWordCount={seenWordCount}
      levelWordCount={levelWordCount}
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
