import { PracticeHubScreen } from "../../screens/PracticeHubScreen";
import { MainRouteDependencies } from "../mainRoute.types";

export function PracticeHubRoute({ userData, copy, getQuestionsByLevel, getPendingTopicCheckpoint, getNextCurriculumLesson, getTopicProgressSummaries, isExamAvailable, startPracticeSafe, startExamSafe, homeViewModel, handleTabPress, session, userProgress }: MainRouteDependencies) {
  const levelQuestions = getQuestionsByLevel(userData.level);
  const knownQuestionIds = Array.from(
    new Set([...(userData.solvedQuestionIds || []), ...(userData.rewardedQuestionIds || [])]),
  );
  const checkpointArgs = [
    userData.level,
    knownQuestionIds,
    userData.learningProgress,
    userData.locale,
    userData.topicAssessments,
  ] as const;
  const pendingCheckpoint = getPendingTopicCheckpoint(...checkpointArgs);
  const nextLesson = getNextCurriculumLesson(...checkpointArgs);
  const nextTopic = nextLesson
    ? getTopicProgressSummaries(...checkpointArgs).find(topic => topic.topicId === nextLesson.topicId)
    : undefined;
  const unrewardedLevelQuestions = levelQuestions.filter(
    question => !userData.rewardedQuestionIds.includes(question.id),
  );
  const sessionQuestionCount = Math.min(userData.practiceSessionSize, unrewardedLevelQuestions.length);

  return (
    <PracticeHubScreen
      copy={copy}
      locale={userData.locale}
      level={userData.level}
      xp={userData.xp}
      streak={userData.streak}
      practiceSessionSize={userData.practiceSessionSize}
      onPracticeSessionSizeChange={userProgress.setPracticeSessionSize}
      onStartDailyPractice={reverseMode => startPracticeSafe(undefined, reverseMode)}
      curriculumNext={nextLesson && nextTopic ? {
        topicTitle: nextTopic.title,
        objective: nextTopic.objective,
        lessonTitle: userData.locale === "tr" ? nextLesson.titleTr : nextLesson.titleEn,
        remainingCount: sessionQuestionCount,
      } : null}
      onStartCurriculumPractice={reverseMode => startPracticeSafe(undefined, reverseMode)}
      pendingCheckpoint={pendingCheckpoint ? { topicId: pendingCheckpoint.topicId, topicTitle: pendingCheckpoint.title, questionCount: 10 } : null}
      onStartCheckpoint={topicId => session.startTopicCheckpoint(userData.level, topicId)}
      isExamAvailable={isExamAvailable(userData.level)}
      isExamPassed={(userData.passedLevelExams || []).includes(userData.level)}
      onStartExam={startExamSafe}
      isLevelFullyLearned={homeViewModel.isLevelFullyLearned}
      onTabPress={handleTabPress}
    />
  );
}
