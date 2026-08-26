import { useEffect } from "react";
import { Alert, BackHandler, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Copy } from "../i18n/en";
import { MeaningMatchQuestion } from "../types/content";
import { SessionMode } from "../state/useAppSession";
import { C, radius, spacing } from "../theme/colors";
import { useSpeech } from "../features/practice/hooks/useSpeech";
import { usePracticeSession, AnswerQualityMeta } from "../features/practice/hooks/usePracticeSession";
import { usePracticeFeedback } from "../features/practice/hooks/usePracticeFeedback";
import { PracticeHeader } from "../features/practice/components/PracticeHeader";
import { WordPrompt } from "../features/practice/components/WordPrompt";
import { AnswerList } from "../features/practice/components/AnswerList";
import { FeedbackCard } from "../features/practice/components/FeedbackCard";
import { PracticeMascot } from "../features/practice/components/PracticeMascot";
import { PrimaryButton } from "../components/PrimaryButton";
import { SessionSummaryCard } from "../features/practice/components/SessionSummaryCard";
import { track } from "../services/telemetry";

interface Props {
  copy: Copy;
  question: MeaningMatchQuestion;
  index: number;
  totalQuestions: number;
  sessionMode: SessionMode;
  picked: string | null;
  submitted: boolean;
  isSessionCompleted?: boolean;
  sessionAnswers?: { questionId: string; isCorrect: boolean; xpEarned: number }[];
  onPick: (answer: string) => void;
  onCheck: (xpReward: number, quality: AnswerQualityMeta) => void;
  onRetry: () => void;
  onNext: () => void;
  onRemindLater?: (q: MeaningMatchQuestion) => void;
  onBack: () => void;
  soundEnabled?: boolean;
  reduceMotion?: boolean;
  /** True for a word the learner has repeatedly missed — see domain/learning/mastery.ts's isLeech. */
  isLeech?: boolean;
}

export function PracticeScreen({
  copy,
  question,
  index,
  totalQuestions,
  sessionMode,
  picked,
  submitted,
  isSessionCompleted = false,
  sessionAnswers = [],
  onPick,
  onCheck,
  onRetry,
  onNext,
  onRemindLater,
  onBack,
  soundEnabled = true,
  reduceMotion = false,
  isLeech = false,
}: Props) {
  const correctAnswer = question.meaning || question.answer || "";
  const wordPrompt = question.word || question.prompt || "";
  const isCorrect = submitted && picked === correctAnswer;
  const isLastQuestion = index + 1 >= totalQuestions;

  const speech = useSpeech(wordPrompt, question.pronunciation, soundEnabled, reduceMotion);
  const session = usePracticeSession(question, correctAnswer, onCheck, isLeech);
  const feedback = usePracticeFeedback(submitted, isCorrect, reduceMotion);

  const handleRequestExit = () => {
    if (isSessionCompleted) {
      onBack();
      return;
    }
    const title = copy.game?.exitConfirmTitle || "Pratikten çıkmak istiyor musun?";
    const msg = copy.game?.exitConfirmMessage || "Bu oturumdaki çözülmemiş sorular kaydedilmeyecek.";
    const trackAbandon = () =>
      track("session_abandoned", { questionsAnswered: sessionAnswers.length, questionsTotal: totalQuestions });
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${msg}`)) {
        trackAbandon();
        onBack();
      }
    } else {
      Alert.alert(title, msg, [
        { text: copy.game?.exitCancel || "Devam Et", style: "cancel" },
        {
          text: copy.game?.exitConfirm || "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            trackAbandon();
            onBack();
          },
        },
      ]);
    }
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleRequestExit();
      return true;
    });
    return () => sub.remove();
  }, [handleRequestExit]);

  // Physical / Web Keyboard Shortcuts
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const options = question.options ?? [question.meaning, ...question.wrongOptions];
      if (e.key === "1" && options[0]) {
        onPick(options[0]);
      } else if (e.key === "2" && options[1]) {
        onPick(options[1]);
      } else if (e.key === "3" && options[2]) {
        onPick(options[2]);
      } else if (e.key === "4" && options[3]) {
        onPick(options[3]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!submitted && picked) {
          session.handleCheck(picked, submitted);
        } else if (submitted) {
          onNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitted, picked, question, onPick, session, onNext]);

  if (isSessionCompleted) {
    const totalXp = sessionAnswers.reduce((acc, a) => acc + a.xpEarned, 0);
    const correctCount = sessionAnswers.filter((a) => a.isCorrect).length;
    const mistakesCount = sessionAnswers.filter((a) => !a.isCorrect).length;

    return (
      <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <View style={S.shell}>
          <ScrollView contentContainerStyle={S.summaryContent} showsVerticalScrollIndicator={false}>
            <SessionSummaryCard
              copy={copy}
              totalXpEarned={totalXp}
              totalQuestions={sessionAnswers.length || totalQuestions}
              correctCount={correctCount}
              mistakesCount={mistakesCount}
              onReturnHome={onBack}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <View style={S.shell}>
        <PracticeHeader
          copy={copy}
          index={index}
          totalQuestions={totalQuestions}
          isReviewMode={sessionMode === "REVIEW"}
          onBack={handleRequestExit}
        />

        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          <WordPrompt
            copy={copy}
            question={question}
            dynamicFontSize={28}
            isCompactScreen={false}
            showHint={session.showHint}
            onToggleHint={session.toggleHint}
            isLeech={isLeech}
            isSpeaking={speech.isSpeaking}
            audioPulse={speech.audioPulse}
            isMotionReduced={feedback.isMotionReduced}
            onToggleSpeech={speech.toggleSpeech}
            audioError={speech.audioError}
          />

          <AnswerList
            copy={copy}
            options={session.shuffledOptions}
            correctAnswer={correctAnswer}
            picked={picked}
            submitted={submitted}
            isChecking={session.isChecking}
            isMotionReduced={feedback.isMotionReduced}
            isCompactScreen={false}
            onPick={onPick}
          />

          {!submitted ? (
            <View style={S.ctaBox}>
              <PrimaryButton
                label={copy.game?.checkAnswer || "Cevabı Kontrol Et"}
                disabled={!picked}
                onPress={() => session.handleCheck(picked, submitted)}
              />
            </View>
          ) : (
            <FeedbackCard
              copy={copy}
              question={question}
              isCorrect={isCorrect}
              correctAnswer={correctAnswer}
              xpEarned={session.xpReward}
              isLastQuestion={isLastQuestion}
              onNext={onNext}
              onRetry={onRetry}
            />
          )}

          {submitted && (
            <PracticeMascot
              correct={isCorrect}
              isMotionReduced={feedback.isMotionReduced}
              leafAnim={feedback.leafAnim}
              mascotBounce={feedback.mascotBounce}
            />
          )}

          {onRemindLater && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.game?.remindLater || "Daha sonra hatırlat"}
              style={S.remindBtn}
              onPress={() => onRemindLater(question)}
            >
              <Ionicons name="bookmark-outline" size={14} color={C.primary} />
              <Text style={S.remindBtnTxt}>
                {copy.game?.remindLater || "Bu kelimeyi tekrar listeme ekle"}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.canvas },
  shell: { flex: 1, maxWidth: 580, width: "100%", alignSelf: "center" },
  content: { padding: spacing.xl, gap: 16, paddingBottom: 28 },
  summaryContent: { padding: spacing.xl, justifyContent: "center", minHeight: "85%" },
  ctaBox: { marginTop: 4 },
  remindBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md || 12,
    alignSelf: "center",
    marginTop: 4,
  },
  remindBtnTxt: {
    color: C.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },
});
