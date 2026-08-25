import { useEffect, useState } from "react";
import { HomeScreen } from "../screens/HomeScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PracticeScreen } from "../screens/PracticeScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PracticeHubScreen } from "../screens/PracticeHubScreen";
import { GlobalAppLayout } from "../components/GlobalAppLayout";
import { GlobalTopBarProps } from "../components/GlobalTopBar";
import { copyByLocale } from "../i18n/en";
import { allQuestions, getQuestionsByLevel, isLevelReady } from "../content/questions";
import { getTopicLabel } from "../features/home/topicLabel";
import { useUserProgress } from "../state/useUserProgress";
import { useAppSession } from "../state/useAppSession";
import { useHomeViewModel } from "../features/home/hooks/useHomeViewModel";
import { LevelCode } from "../types/content";
import { LevelProgressItem, TopicProgressItem } from "../features/progress/progress.types";
import { HomeTab } from "../features/home/home.types";
import { BadgeUnlockCelebration } from "../features/practice/components/BadgeUnlockCelebration";
import { countMasteredWords, summarizeMastery } from "../domain/learning/mastery";
import { evaluatePromotion } from "../domain/learning/promotion";
import { LevelPromotionModal } from "../features/home/components/LevelPromotionModal";
import { LevelSwitcherModal } from "../features/home/components/LevelSwitcherModal";
import { useToast } from "../context/ToastContext";

interface Props {
  userProgress: ReturnType<typeof useUserProgress>;
  onAccountPress?: () => void;
  deepLinkTarget?: "home" | "practice" | "progress" | "profile" | null;
  onDeepLinkConsumed?: () => void;
}

export function AppNavigator({ userProgress, onAccountPress, deepLinkTarget, onDeepLinkConsumed }: Props) {
  const { userData, recordAnswer, bookmarkQuestion, setLocale, setLevel, markLevelCelebrated, markGardenExplainerSeen, completeOnboarding, badgeUnlockQueue, dismissBadgeUnlock, saveFailureNotice, clearSaveFailureNotice } = userProgress;
  const session = useAppSession(userData, userProgress.setActiveSession);
  const [levelSwitcherOpen, setLevelSwitcherOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!saveFailureNotice) return;
    showToast({ message: saveFailureNotice, type: "attention", durationMs: 5000 });
    clearSaveFailureNotice();
  }, [saveFailureNotice, showToast, clearSaveFailureNotice]);

  const copy = copyByLocale[userData.locale];
  const homeViewModel = useHomeViewModel(userData, copy, userData.locale);

  const promotion = evaluatePromotion(
    userData.level,
    userData.learningProgress || {},
    userData.celebratedLevels || []
  );

  useEffect(() => {
    if (!deepLinkTarget) return;
    if (deepLinkTarget === "practice") session.goToPracticeHome();
    else if (deepLinkTarget === "progress") session.goToProgress();
    else if (deepLinkTarget === "profile") session.goToProfile();
    else session.goToHome();
    onDeepLinkConsumed?.();
  }, [deepLinkTarget, onDeepLinkConsumed, session]);

  if (session.screen === "onboarding") {
    return (
      <OnboardingScreen
        copy={copy}
        level={userData.level}
        step={session.onboardingStep}
        dailyGoalMinutes={userData.dailyGoalMinutes}
        notificationsEnabled={userData.notificationsEnabled}
        onStep={session.setOnboardingStep}
        onGoalSelect={userProgress.setDailyGoalMinutes}
        onNotificationToggle={userProgress.setNotificationsEnabled}
        onLevel={(lvl) => {
          if (lvl) setLevel(lvl);
        }}
        onComplete={() => {
          completeOnboarding();
          session.goToHome();
        }}
        onOpenAuth={onAccountPress}
        onBack={session.goToHome}
      />
    );
  }

  if (session.screen === "practice" && session.currentQuestion) {
    const currentQuestion = session.currentQuestion;
    const correctAnswer = currentQuestion.meaning || currentQuestion.answer || "";
    return (
      <>
      <PracticeScreen
        copy={copy}
        question={currentQuestion}
        index={session.currentIndex}
        totalQuestions={session.sessionQuestions.length || 1}
        sessionMode={session.sessionMode}
        picked={session.picked}
        submitted={session.submitted}
        isSessionCompleted={session.isSessionCompleted}
        sessionAnswers={session.sessionAnswers}
        onPick={session.setPicked}
        onCheck={(xpReward, quality) => {
          session.recordSessionStep(session.picked === correctAnswer, xpReward);
          recordAnswer(currentQuestion, session.picked || "", xpReward, session.sessionMode, quality);
          session.setSubmitted(true);
        }}
        onRetry={session.resetQuestionState}
        onNext={session.nextQuestion}
        onRemindLater={(q) => bookmarkQuestion(q.id)}
        onBack={session.goToHome}
        soundEnabled={userData.soundEnabled}
        reduceMotion={userData.reduceMotion}
      />
      <BadgeUnlockCelebration
        badgeId={badgeUnlockQueue[0]}
        locale={userData.locale}
        reduceMotion={userData.reduceMotion}
        onDismiss={dismissBadgeUnlock}
      />
      </>
    );
  }

  const topBarProps: GlobalTopBarProps = {
    level: userData.level,
    streak: userData.streak,
    locale: userData.locale,
    levelLabel: copy.home?.levelPrefix || "Seviye",
    streakLabel: copy.home?.streakAccessibility || "günlük çalışma serisi",
    onLevelPress: () => setLevelSwitcherOpen(true),
    onRefresh: userProgress.refresh,
  };

  const handleTabPress = (tab: HomeTab) => {
    if (tab === "garden") session.goToHome();
    else if (tab === "practice") session.goToPracticeHome();
    else if (tab === "progress") session.goToProgress();
    else if (tab === "profile") session.goToProfile();
  };

  let activeTab: HomeTab = "garden";
  let content = null;

  if (session.screen === "progress") {
    activeTab = "progress";
    const levels: LevelCode[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const levelProgressList: LevelProgressItem[] = levels.map((lvl) => {
      const qs = getQuestionsByLevel(lvl);
      const qIds = qs.map((question) => question.id);
      const summary = summarizeMastery(userData.learningProgress || {}, qIds);
      return {
        level: lvl,
        total: qs.length,
        // Answered correctly at least once — the number that actually moves
        // the moment you practice, so a finished session is never invisible.
        seen: userData.solvedQuestionIds.filter((id) => qIds.includes(id)).length,
        mastered: summary.mastered,
        percent: summary.masteredPercent,
        isReady: isLevelReady(lvl),
      };
    });

    // Topics are labelled through the same helper the home screen uses, so raw
    // content keys like "core_verbs" never reach the reader.
    const topicCounts: Record<string, number> = {};
    for (const q of allQuestions) {
      if (userData.solvedQuestionIds.includes(q.id) && q.topic) {
        const label = getTopicLabel(copy, q.topic);
        topicCounts[label] = (topicCounts[label] || 0) + 1;
      }
    }
    const topicBreakdown: TopicProgressItem[] = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }));

    const levelQuestionIds = getQuestionsByLevel(userData.level).map((q) => q.id);

    content = (
      <ProgressScreen
        copy={copy}
        locale={userData.locale}
        xp={userData.xp}
        streak={userData.streak}
        level={userData.level}
        gardenProgress={homeViewModel.gardenProgress}
        totalSolved={countMasteredWords(userData.learningProgress || {})}
        dueReviewCount={homeViewModel.reviewCount}
        seenWordCount={userData.solvedQuestionIds.filter((id) => levelQuestionIds.includes(id)).length}
        levelWordCount={levelQuestionIds.length}
        levelProgressList={levelProgressList}
        topicBreakdown={topicBreakdown}
        solvedQuestionIds={userData.solvedQuestionIds}
        lastActiveDate={userData.lastActiveDate}
        practiceHistory={userData.practiceHistory}
        unlockedBadges={userData.unlockedBadges}
        onPracticeWord={(q) => session.startPractice([q])}
        onBack={session.goToHome}
        onTabPress={handleTabPress}
        reduceMotion={userData.reduceMotion}
      />
    );
  } else if (session.screen === "practiceHome") {
    activeTab = "practice";
    content = (
      <PracticeHubScreen
        copy={copy}
        locale={userData.locale}
        level={userData.level}
        xp={userData.xp}
        streak={userData.streak}
        dueReviewCount={homeViewModel.reviewCount}
        practiceSessionSize={userData.practiceSessionSize}
        onPracticeSessionSizeChange={userProgress.setPracticeSessionSize}
        onStartDailyPractice={(reverseMode) => session.startPractice(undefined, reverseMode)}
        onStartReview={session.startReview}
        dueInSession={Math.min(homeViewModel.reviewCount, userData.practiceSessionSize)}
        totalDueCount={homeViewModel.reviewCount}
        onTabPress={handleTabPress}
      />
    );
  } else if (session.screen === "profile") {
    activeTab = "profile";
    content = (
      <ProfileScreen
        copy={copy}
        locale={userData.locale}
        level={userData.level}
        xp={userData.xp}
        streak={userData.streak}
        unlockedBadges={userData.unlockedBadges}
        soundEnabled={userData.soundEnabled}
        reduceMotion={userData.reduceMotion}
        notificationsEnabled={userData.notificationsEnabled}
        displayName={userData.displayName}
        avatarId={userData.avatarId}
        onSoundToggle={userProgress.setSoundEnabled}
        onReduceMotionToggle={userProgress.setReduceMotion}
        onNotificationToggle={userProgress.setNotificationsEnabled}
        onDisplayNameChange={userProgress.setDisplayName}
        onAvatarChange={userProgress.setAvatarId}
        onDataReset={userProgress.refresh}
        onRefresh={userProgress.refresh}
        onLocaleChange={setLocale}
        onChangeLevel={() => setLevelSwitcherOpen(true)}
        onBack={session.goToHome}
        onAccountPress={onAccountPress}
        onTabPress={handleTabPress}
      />
    );
  } else {
    activeTab = "garden";
    content = (
      <HomeScreen
        copy={copy}
        locale={userData.locale}
        viewModel={homeViewModel}
        activeTab="garden"
        onLevelPress={() => setLevelSwitcherOpen(true)}
        onQuestPress={() => session.startPractice()}
        onPracticePress={session.goToPracticeHome}
        onReviewPress={session.startReview}
        onWordPress={(wordData) => {
          const matchQ = allQuestions.find(
            (q) =>
              (q.word && q.word.toLowerCase() === wordData.word.toLowerCase()) ||
              (q.prompt && q.prompt.toLowerCase() === wordData.word.toLowerCase())
          );
          if (matchQ) {
            session.startPractice([matchQ]);
          } else {
            session.startPractice();
          }
        }}
        onTabPress={handleTabPress}
        onRefresh={userProgress.refresh}
        reduceMotion={userData.reduceMotion}
        showGardenExplainer={!userData.hasSeenGardenExplainer}
        onDismissGardenExplainer={markGardenExplainerSeen}
      />
    );
  }
  return (
    <>
      <GlobalAppLayout
        topBarProps={topBarProps}
        copy={copy}
        activeTab={activeTab}
        dueReviewCount={homeViewModel.reviewCount}
        onTabPress={handleTabPress}
      >
        {content}
      </GlobalAppLayout>

      <LevelSwitcherModal
        copy={copy}
        visible={levelSwitcherOpen}
        currentLevel={userData.level}
        learningProgress={userData.learningProgress || {}}
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
