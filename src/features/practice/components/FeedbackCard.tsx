import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { MeaningMatchQuestion } from "../../../types/content";

interface Props {
  copy: Copy;
  question: MeaningMatchQuestion;
  isCorrect: boolean;
  correctAnswer: string;
  xpEarned: number;
  isLastQuestion?: boolean;
  onNext: () => void;
  onRetry?: () => void;
}

export function FeedbackCard({ copy, question, isCorrect, correctAnswer, xpEarned, isLastQuestion = false, onNext, onRetry }: Props) {
  const nextLabel = isLastQuestion ? (copy.game?.finishSession || "Oturumu Tamamla") : (copy.game?.nextQuestion || "Devam Et →");

  return (
    <View style={[S.card, isCorrect ? S.cardCor : S.cardWro]}>
      <View style={S.top}>
        <View style={[S.iconWrap, isCorrect ? S.iconCor : S.iconWro]}>
          <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={24} color={isCorrect ? C.successText : C.attentionText} />
        </View>
        <View style={S.copy}>
          <Text style={[S.title, isCorrect ? S.titleCor : S.titleWro]}>
            {isCorrect ? (copy.game?.correctTitle || "Harika! Doğru cevap.") : (copy.game?.wrongTitle || "Tam olarak değil, ama öğreniyorsun!")}
          </Text>
          <Text style={S.sub}>
            {isCorrect ? `+${xpEarned} XP kazanıldı · Harika ilerliyorsun!` : `${copy.game?.revealedAnswer || "Doğru karşılık:"} "${correctAnswer}"`}
          </Text>
        </View>
      </View>

      {(question.exampleSentence || question.contextNote) && (
        <View style={S.learningBox}>
          {question.exampleSentence && (
            <View style={S.sentenceWrap}>
              <Text style={S.exampleTitle}>{copy.game?.exampleSentence || "Örnek Cümle"}</Text>
              <Text style={S.exampleEn}>{question.exampleSentence}</Text>
              {question.exampleTranslation && <Text style={S.exampleTr}>{question.exampleTranslation}</Text>}
            </View>
          )}
          {question.contextNote && !isCorrect && <Text style={S.contextNote}>💡 {question.contextNote}</Text>}
        </View>
      )}

      <View style={S.btnRow}>
        {!isCorrect && onRetry && (
          <View style={S.btnFlex}>
            <PrimaryButton label={copy.game?.retry || "Tekrar Dene"} variant="secondary" onPress={onRetry} />
          </View>
        )}
        <View style={S.btnFlex}>
          <PrimaryButton label={nextLabel} onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1.5, gap: 12, elevation: 4 },
  cardCor: { backgroundColor: C.successSoft, borderColor: C.successBorder },
  cardWro: { backgroundColor: C.attentionSoft, borderColor: C.attentionBorder },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  iconCor: { backgroundColor: C.successSoft },
  iconWro: { backgroundColor: C.attentionSoft },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "800", lineHeight: 20 },
  titleCor: { color: C.successText },
  titleWro: { color: C.attentionText },
  sub: { color: C.ink, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  learningBox: { backgroundColor: "rgba(255,255,255,0.75)", padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", gap: 4 },
  sentenceWrap: { gap: 2 },
  exampleTitle: { color: C.muted, fontSize: 10.5, fontWeight: "800", letterSpacing: 0.5 },
  exampleEn: { color: C.ink, fontSize: 13, fontWeight: "700" },
  exampleTr: { color: C.muted, fontSize: 11.5, fontStyle: "italic" },
  contextNote: { color: C.ink, fontSize: 11.5, fontWeight: "600", marginTop: 2 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 2 },
  btnFlex: { flex: 1 },
});
