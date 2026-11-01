import { HomeScreen } from "../../screens/HomeScreen";
import { MainRouteDependencies } from "../mainRoute.types";

export function HomeRoute({ userData, copy, homeViewModel, allQuestions, getPendingTopicCheckpoint, startPracticeSafe, session, handleTabPress, userProgress, setLevelSwitcherOpen, markGardenExplainerSeen }: MainRouteDependencies) {
  const pendingCheckpoint = getPendingTopicCheckpoint(
    userData.level,
    userData.solvedQuestionIds,
    userData.learningProgress,
    userData.locale,
    userData.topicAssessments,
  );

  return (
    <HomeScreen
      copy={copy}
      locale={userData.locale}
      viewModel={homeViewModel}
      activeTab="garden"
      onLevelPress={() => setLevelSwitcherOpen(true)}
      onQuestPress={pendingCheckpoint ? session.goToPracticeHome : () => startPracticeSafe()}
      onPracticePress={session.goToPracticeHome}
      onWordPress={wordData => {
        const match = allQuestions.find(question =>
          (question.word && question.word.toLowerCase() === wordData.word.toLowerCase())
          || (question.prompt && question.prompt.toLowerCase() === wordData.word.toLowerCase()),
        );
        startPracticeSafe(match ? [match] : undefined);
      }}
      onTabPress={handleTabPress}
      onRefresh={userProgress.refresh}
      reduceMotion={userData.reduceMotion}
      showGardenExplainer={!userData.hasSeenGardenExplainer}
      onDismissGardenExplainer={markGardenExplainerSeen}
    />
  );
}
