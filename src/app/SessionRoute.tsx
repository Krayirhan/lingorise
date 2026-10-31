import { ReactElement } from "react";
import { Application } from "../application/createApplication";
import { MeaningMatchQuestion } from "../domain/models/content";
import { UserData } from "../domain/models/user";
import { shouldOfferWriting } from "../domain/learning/writing";
import { Copy } from "../i18n/en";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PracticeScreen } from "../screens/PracticeScreen";
import { useAppSession } from "../state/useAppSession";
import { useUserProgress } from "../state/useUserProgress";
import { BadgeUnlockCelebration } from "../features/practice/components/BadgeUnlockCelebration";

interface Props {
  application: Application;
  session: ReturnType<typeof useAppSession>;
  userData: UserData;
  userProgress: ReturnType<typeof useUserProgress>;
  copy: Copy;
  recordAnswer: ReturnType<typeof useUserProgress>["recordAnswer"];
  bookmarkQuestion: ReturnType<typeof useUserProgress>["bookmarkQuestion"];
  onAccountPress?: () => void;
}

export function SessionRoute({ application, session, userData, userProgress, copy, recordAnswer, bookmarkQuestion, onAccountPress }: Props): ReactElement | null {
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
        onLevel={level => { if (level) userProgress.setLevel(level); }}
        onComplete={() => { userProgress.completeOnboarding(); session.goToHome(); }}
        onOpenAuth={onAccountPress}
        onBack={session.goToHome}
      />
    );
  }

  if (session.screen !== "practice" || !session.currentQuestion) return null;

  const question: MeaningMatchQuestion = session.currentQuestion;
  const correctAnswer = question.meaning || question.answer || "";
  return (
    <>
      <PracticeScreen
        copy={copy}
        question={question}
        index={session.currentIndex}
        totalQuestions={session.sessionQuestions.length || 1}
        sessionMode={session.sessionMode}
        locale={userData.locale}
        writingOffer={session.writingOffer}
        onWritingOfferChange={session.setWritingOffer}
        picked={session.picked}
        submitted={session.submitted}
        isSessionCompleted={session.isSessionCompleted}
        sessionAnswers={session.sessionAnswers}
        onPick={session.setPicked}
        onCheck={(xpReward, quality) => {
          const pickedAnswer = session.picked || "";
          const actualXpEarned = application.calculateAnswerXp(userData, question, pickedAnswer, xpReward, session.sessionMode);
          session.recordSessionStep(pickedAnswer === correctAnswer, actualXpEarned);
          recordAnswer(question, pickedAnswer, xpReward, session.sessionMode, quality);
          const englishWord = question.mode === "PICK_THE_WORD" ? question.meaning : question.word;
          if (shouldOfferWriting(application.writing.getTask(question.id), { id: question.id, level: question.level, word: englishWord }, session.sessionMode, pickedAnswer === correctAnswer, Boolean(session.writingOffer))) {
            session.setWritingOffer({ questionId: question.id, status: "offered" });
          }
          session.setSubmitted(true);
        }}
        onRetry={session.resetQuestionState}
        onNext={session.nextQuestion}
        onRemindLater={item => bookmarkQuestion(item.id)}
        onBack={session.goToHome}
        soundEnabled={userData.soundEnabled}
        reduceMotion={userData.reduceMotion}
      />
      <BadgeUnlockCelebration
        badgeId={userProgress.badgeUnlockQueue[0]}
        locale={userData.locale}
        reduceMotion={userData.reduceMotion}
        onDismiss={userProgress.dismissBadgeUnlock}
      />
    </>
  );
}
