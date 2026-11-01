import { useApplication } from "../context/ApplicationContext";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "../theme/colors";
import { Copy, Locale } from "../i18n/en";
import { MeaningMatchQuestion } from "../domain/models/content";
import { SessionMode } from "../state/useAppSession";
import { useSpeech } from "../features/practice/hooks/useSpeech";
import { usePracticeSession, AnswerQualityMeta } from "../features/practice/hooks/usePracticeSession";
import { usePracticeFeedback } from "../features/practice/hooks/usePracticeFeedback";
import { usePracticeExit } from "../features/practice/hooks/usePracticeExit";

import { ActiveSessionState } from "../domain/models/user";
import { AppDialog } from "../components/AppDialog";
import { PracticeHeader } from "../features/practice/components/PracticeHeader";
import { S } from "../features/practice/practice.styles";
import { evaluateWriting, isWritingTaskReady, WritingCheck } from "../domain/learning/writing";
import { ProductionForm } from "../features/practice/components/ProductionForm";
import { CompletedPracticeSummary, PracticeQuestionContent, usePracticeKeyboardShortcuts } from "./PracticeScreenParts";

interface Props {
  copy: Copy;
  question: MeaningMatchQuestion;
  index: number;
  totalQuestions: number;
  sessionMode: SessionMode;
  locale: Locale;
  writingOffer?: ActiveSessionState["writingOffer"];
  onWritingOfferChange: (offer: ActiveSessionState["writingOffer"]) => void;
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
}

export function PracticeScreen({
  copy,
  question,
  index,
  totalQuestions,
  sessionMode,
  locale,
  writingOffer,
  onWritingOfferChange,
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
}: Props) {
  const application = useApplication();

  const correctAnswer = question.meaning || question.answer || "";
  const wordPrompt = question.word || question.prompt || "";
  const isCorrect = submitted && picked === correctAnswer;
  const isLastQuestion = index + 1 >= totalQuestions;

  const englishWord = question.mode === "PICK_THE_WORD" ? question.meaning : wordPrompt;
  const speech = useSpeech(englishWord, question.pronunciation, soundEnabled, reduceMotion);
  const session = usePracticeSession(question, correctAnswer, onCheck);
  const feedback = usePracticeFeedback(submitted, isCorrect, reduceMotion);
  const [productionResponse, setProductionResponse] = useState("");
  const [productionResult, setProductionResult] = useState<WritingCheck | null>(null);
  const [writingSaving, setWritingSaving] = useState(false);
  const [writingSaveError, setWritingSaveError] = useState(false);
  const task = application.writing.getTask(question.id);
  const activeOffer = submitted && isCorrect && sessionMode === "PRACTICE" && writingOffer?.questionId === question.id && writingOffer.status !== "done" && isWritingTaskReady(task, question.id, question.level, englishWord) ? writingOffer : undefined;

  useEffect(() => {
    setProductionResponse("");
    setProductionResult(null);
    setWritingSaveError(false);
  }, [question.id]);

  const submitProduction = async () => {
    if (!task || !productionResponse.trim() || writingSaving) return;
    setProductionResult(evaluateWriting(task, productionResponse));
    setWritingSaving(true);
    const saved = await application.data.saveWritingAttempt({ questionId: question.id, response: productionResponse.trim(), createdAt: Date.now() });
    setWritingSaveError(!saved);
    setWritingSaving(false);
  };

  const exit = usePracticeExit({ copy, completed: isSessionCompleted, answeredCount: sessionAnswers.length,
    totalQuestions, onBack, isExam: sessionMode === "EXAM" });

  const advance = () => {
    if (activeOffer) onWritingOfferChange({ ...activeOffer, status: "done" });
    onNext();
  };
  usePracticeKeyboardShortcuts({ question, submitted, picked, onPick, onNext: advance, canAdvance: !activeOffer, handleCheck: session.handleCheck });

  if (isSessionCompleted) return <CompletedPracticeSummary copy={copy} sessionMode={sessionMode} answers={sessionAnswers} totalQuestions={totalQuestions} onBack={onBack} />;

  const recordedCurrentAnswer = [...sessionAnswers].reverse().find((answer) => answer.questionId === question.id);
  const displayedXpEarned = recordedCurrentAnswer?.xpEarned ?? session.xpReward;

  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <View style={S.shell}>
        <PracticeHeader
          copy={copy}
          index={index}
          totalQuestions={totalQuestions}
          isExamMode={sessionMode === "EXAM"}
          onBack={exit.requestExit}
        />

        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          <PracticeQuestionContent
            copy={copy} question={question} session={session} speech={speech} feedback={feedback}
            correctAnswer={correctAnswer} picked={picked} submitted={submitted} isCorrect={isCorrect}
            isLastQuestion={isLastQuestion} displayedXpEarned={displayedXpEarned}
            writingContent={activeOffer && task ? <ProductionForm copy={copy} locale={locale} task={task} status={activeOffer.status as "offered" | "open"}
              response={productionResponse} result={productionResult} saving={writingSaving} saveError={writingSaveError}
              onStart={() => onWritingOfferChange({ ...activeOffer, status: "open" })}
              onSkip={() => onWritingOfferChange({ ...activeOffer, status: "done" })}
              onChange={(value) => { setProductionResponse(value); setProductionResult(null); setWritingSaveError(false); }}
              onSubmit={() => { void submitProduction(); }} /> : null}
            onPick={onPick} onNext={advance} onRetry={onRetry} onRemindLater={onRemindLater}
            sessionMode={sessionMode} onCheckAnswer={() => session.handleCheck(picked, submitted)}
          />
        </ScrollView>
      </View>

      <AppDialog
        visible={exit.dialogVisible}
        title={exit.title}
        message={exit.message}
        appearance="session"
        icon={{ name: sessionMode === "EXAM" ? "school-outline" : "leaf-outline" }}
        primaryAction={{
          label: sessionMode === "EXAM" ? copy.game.examExitCancel : copy.game.exitCancel,
          onPress: exit.cancelExit,
        }}
        secondaryAction={{
          label: sessionMode === "EXAM" ? copy.game.examExitConfirm : copy.game.exitConfirm,
          onPress: exit.confirmExit,
          destructive: true,
        }}
        onRequestClose={exit.cancelExit}
        reduceMotion={reduceMotion}
      />
    </SafeAreaView>
  );
}
