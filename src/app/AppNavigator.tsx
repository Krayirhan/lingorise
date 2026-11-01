import { useEffect, useState } from "react";
import { GlobalAppLayout } from "../components/GlobalAppLayout";
import { GlobalTopBarProps } from "../components/GlobalTopBar";
import { useApplication } from "../context/ApplicationContext";
import { copyByLocale } from "../i18n/en";
import { HomeTab } from "../features/home/home.types";
import { useHomeViewModel } from "../features/home/hooks/useHomeViewModel";
import { useAppSession } from "../state/useAppSession";
import { useUserProgress } from "../state/useUserProgress";
import { LevelPromotionModal } from "../features/home/components/LevelPromotionModal";
import { LevelSwitcherModal } from "../features/home/components/LevelSwitcherModal";
import { getMainRoute } from "./getMainRoute";
import { SessionRoute } from "./SessionRoute";
import { DeepLinkTarget, useDeepLinkNavigation, useFailureNoticeToasts, useSafeSessionStarts } from "./navigatorHooks";

interface Props {
  userProgress: ReturnType<typeof useUserProgress>;
  onAccountPress?: () => void;
  deepLinkTarget?: DeepLinkTarget | null;
  onDeepLinkConsumed?: () => void;
}

export function AppNavigator({ userProgress, onAccountPress, deepLinkTarget, onDeepLinkConsumed }: Props) {
  const application = useApplication();
  const { allQuestions } = application.catalogue;
  const { getQuestionsByLevel } = application.catalogue;
  const { isLevelReady } = application.catalogue;
  const { evaluatePromotion } = application.learning;
  const { isExamAvailable } = application.learning;
  const { getTopicProgressSummaries, getNextCurriculumLesson, getPendingTopicCheckpoint } = application.learning;

  const { userData, recordAnswer, bookmarkQuestion, setLocale, setLevel, markLevelCelebrated, markGardenExplainerSeen } = userProgress;
  const session = useAppSession(userData, userProgress.setActiveSession);
  const [levelSwitcherOpen, setLevelSwitcherOpen] = useState(false);

  useFailureNoticeToasts(userProgress);

  const copy = copyByLocale[userData.locale];
  const homeViewModel = useHomeViewModel(userData, copy, userData.locale);

  const promotion = evaluatePromotion(
    userData.level,
    userData.passedLevelExams || [],
    userData.celebratedLevels || []
  );

  const { startPracticeSafe, startExamSafe } = useSafeSessionStarts(session, copy, userData.level);

  // Records a level-completion exam's result exactly once per attempt. The
  // exam is the sole way a level is marked complete now (roadmap
  // 18-srs-flow-hardening.md "sınav" redesign) — no per-word mastery
  // percentage feeds this any more.
  const [recordSessionResult] = useState(application.createResultRecorder);
  useEffect(() => {
    recordSessionResult({
      mode: session.sessionMode, completed: session.isSessionCompleted,
      level: userData.level, questions: session.sessionQuestions, answers: session.sessionAnswers
    });
  }, [recordSessionResult, session.sessionMode, session.isSessionCompleted, session.sessionQuestions, session.sessionAnswers, userData.level]);

  useDeepLinkNavigation(session, deepLinkTarget, onDeepLinkConsumed);

  if (session.screen === "onboarding" || (session.screen === "practice" && session.currentQuestion)) {
    return <SessionRoute application={application} session={session} userData={userData} userProgress={userProgress} copy={copy} recordAnswer={recordAnswer} bookmarkQuestion={bookmarkQuestion} onAccountPress={onAccountPress} />;
  }

  const topBarProps: GlobalTopBarProps = {
    level: userData.level,
    streak: userData.streak,
    locale: userData.locale,
    levelLabel: copy.home.levelPrefix,
    streakLabel: copy.home.streakAccessibility,
    onLevelPress: () => setLevelSwitcherOpen(true),
    onRefresh: userProgress.refresh,
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab === "garden") session.goToHome();
    else if (tab === "practice") session.goToPracticeHome();
    else if (tab === "progress") session.goToProgress();
    else if (tab === "profile") session.goToProfile();
  };

  const { activeTab, content } = getMainRoute({
    userData, copy, homeViewModel, getQuestionsByLevel, isLevelReady, isExamAvailable,
    getTopicProgressSummaries, getNextCurriculumLesson, getPendingTopicCheckpoint,
    startPracticeSafe, startExamSafe, setPracticeSessionSize: userProgress.setPracticeSessionSize,
    setLocale, setLevel, session, userProgress, onAccountPress, markGardenExplainerSeen, handleTabPress,
    allQuestions, setLevelSwitcherOpen,
  });
  return (
    <>
      <GlobalAppLayout
        topBarProps={topBarProps}
        copy={copy}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      >
        {content}
      </GlobalAppLayout>

      <LevelSwitcherModal
        copy={copy}
        visible={levelSwitcherOpen}
        currentLevel={userData.level}
        solvedQuestionIds={userData.solvedQuestionIds}
        passedLevelExams={userData.passedLevelExams || []}
        onSelect={setLevel}
        onClose={() => setLevelSwitcherOpen(false)}
        reduceMotion={userData.reduceMotion}
      />

      <LevelPromotionModal
        copy={copy}
        level={userData.level}
        promotion={promotion}
        visible={promotion.shouldCelebrate}
        onAdvance={(next) => {
          markLevelCelebrated(userData.level);
          setLevel(next);
        }}
        onDismiss={() => markLevelCelebrated(userData.level)}
        reduceMotion={userData.reduceMotion}
      />
    </>
  );
}
