import { ReactNode, useEffect } from "react";
import { BackHandler, Platform, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Copy } from "../i18n/en";
import { MeaningMatchQuestion } from "../domain/models/content";
import { SessionMode } from "../state/useAppSession";
import { C } from "../theme/colors";
import { useSpeech } from "../features/practice/hooks/useSpeech";
import { usePracticeSession } from "../features/practice/hooks/usePracticeSession";
import { usePracticeFeedback } from "../features/practice/hooks/usePracticeFeedback";
import { WordPrompt } from "../features/practice/components/WordPrompt";
import { AnswerList } from "../features/practice/components/AnswerList";
import { FeedbackCard } from "../features/practice/components/FeedbackCard";
import { PracticeMascot } from "../features/practice/components/PracticeMascot";
import { PrimaryButton } from "../components/PrimaryButton";
import { SessionSummaryCard } from "../features/practice/components/SessionSummaryCard";
import { S } from "../features/practice/practice.styles";
import { summarizeSession } from "../domain/practice/sessionSummary";
import { getRetryAction } from "../domain/practice/sessionControls";

export function CompletedPracticeSummary({ copy, sessionMode, answers, totalQuestions, onBack }: {
  copy: Copy;
  sessionMode: SessionMode;
  answers: { questionId: string; isCorrect: boolean; xpEarned: number }[];
  totalQuestions: number;
  onBack: () => void;
}) {
  const summary = summarizeSession(sessionMode, answers, totalQuestions);
  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <View style={S.shell}>
        <ScrollView contentContainerStyle={S.summaryContent} showsVerticalScrollIndicator={false}>
          <SessionSummaryCard copy={copy} {...summary} onReturnHome={onBack} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function usePracticeKeyboardShortcuts({ question, submitted, picked, onPick, onNext, canAdvance, handleCheck }: {
  question: MeaningMatchQuestion;
  submitted: boolean;
  picked: string | null;
  onPick: (answer: string) => void;
  onNext: () => void;
  canAdvance: boolean;
  handleCheck: (answer: string | null, isSubmitted: boolean) => void;
}) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && (target.isContentEditable || target.closest('button, a, [role="button"]')))) return;
      if (submitted && !canAdvance) return;
      const options = question.options ?? [question.meaning, ...question.wrongOptions];
      const selectedOption = options[Number(event.key) - 1];
      if (/^[1-4]$/.test(event.key) && selectedOption) onPick(selectedOption);
      else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!submitted && picked) handleCheck(picked, submitted);
        else if (submitted && canAdvance) onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitted, picked, question, onPick, handleCheck, onNext, canAdvance]);
}

interface PracticeQuestionContentProps {
  copy: Copy; question: MeaningMatchQuestion; session: ReturnType<typeof usePracticeSession>;
  speech: ReturnType<typeof useSpeech>; feedback: ReturnType<typeof usePracticeFeedback>;
  correctAnswer: string; picked: string | null; submitted: boolean; isCorrect: boolean;
  isLastQuestion: boolean; displayedXpEarned: number; writingContent?: ReactNode;
  onPick: (answer: string) => void; onNext: () => void; onRetry: () => void;
  onRemindLater?: (question: MeaningMatchQuestion) => void;
  sessionMode: SessionMode; onCheckAnswer: () => void;
}

export function PracticeQuestionContent({ copy, question, session, speech, feedback, correctAnswer, picked, submitted, isCorrect,
  isLastQuestion, displayedXpEarned, writingContent,
  onPick, onNext, onRetry, onRemindLater,
  sessionMode, onCheckAnswer }: PracticeQuestionContentProps) {
  return (
    <>
      <WordPrompt copy={copy} question={question} dynamicFontSize={28} isCompactScreen={false}
        showHint={session.showHint} onToggleHint={session.toggleHint} isSpeaking={speech.isSpeaking}
        audioPulse={speech.audioPulse} isMotionReduced={feedback.isMotionReduced}
        onToggleSpeech={speech.toggleSpeech} audioError={speech.audioError} />
      <AnswerList copy={copy} options={session.shuffledOptions} correctAnswer={correctAnswer} picked={picked}
        submitted={submitted} isChecking={session.isChecking} isMotionReduced={feedback.isMotionReduced}
        isCompactScreen={false} onPick={onPick} />
      {!submitted ? (
        <View style={S.ctaBox}>
          <PrimaryButton label={copy.game?.checkAnswer || "Cevabı Kontrol Et"} disabled={!picked} onPress={onCheckAnswer} />
        </View>
      ) : (
        <FeedbackCard copy={copy} question={question} isCorrect={isCorrect} correctAnswer={correctAnswer}
          xpEarned={displayedXpEarned} isLastQuestion={isLastQuestion} onNext={onNext}
          onRetry={getRetryAction(sessionMode, onRetry)}>{writingContent}</FeedbackCard>
      )}
      {submitted && <PracticeMascot correct={isCorrect} isMotionReduced={feedback.isMotionReduced}
        leafAnim={feedback.leafAnim} mascotBounce={feedback.mascotBounce} />}
      {onRemindLater && <Pressable accessibilityRole="button" accessibilityLabel={copy.game?.remindLater || "Daha sonra hatırlat"}
        style={S.remindBtn} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }} onPress={() => onRemindLater(question)}>
        <Ionicons name="bookmark-outline" size={14} color={C.primary} />
        <Text style={S.remindBtnTxt}>{copy.game?.remindLater || "Bu kelimeyi tekrar listeme ekle"}</Text>
      </Pressable>}
    </>
  );
}

