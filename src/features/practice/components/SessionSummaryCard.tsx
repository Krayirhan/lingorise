import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { PrimaryButton } from "../../../components/PrimaryButton";

interface Props {
  copy: Copy;
  totalXpEarned: number;
  totalQuestions: number;
  correctCount: number;
  mistakesCount: number;
  onReturnHome: () => void;
  /** Set for a level-completion exam (domain/learning/levelExam.ts) — swaps
   * the generic practice summary for a pass/fail result. */
  examResult?: { passed: boolean; passCount: number };
}

export function SessionSummaryCard({
  copy,
  totalXpEarned,
  totalQuestions,
  correctCount,
  mistakesCount,
  onReturnHome,
  examResult,
}: Props) {
  const accuracyPercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;

  const title = examResult
    ? examResult.passed
      ? copy.game?.examPassedTitle || "Sınavı Geçtin! 🎉"
      : copy.game?.examFailedTitle || "Bu Sefer Olmadı"
    : copy.game?.sessionSummaryTitle || "Pratik Tamamlandı!";

  const subtitle = examResult
    ? examResult.passed
      ? copy.game?.examPassedSubtitle || "Bu seviyeyi artık gerçekten biliyorsun."
      : (copy.game?.examFailedSubtitle || "En az {pass} doğru gerekiyor. İstediğin zaman tekrar deneyebilirsin.").replace(
          "{pass}",
          String(examResult.passCount)
        )
    : copy.game?.sessionSummarySubtitle || "Tebrikler! Günlük pratiğini başarıyla tamamladın.";

  return (
    <View style={S.card}>
      <View style={S.trophyCircle}>
        <Ionicons
          name={examResult && !examResult.passed ? "refresh-circle" : "trophy"}
          size={32}
          color={C.rewardText}
        />
      </View>

      <Text style={S.title}>{title}</Text>
      <Text style={S.sub}>{subtitle}</Text>

      <View style={S.statsRow}>
        <View style={S.statBox}>
          <Text style={S.statVal}>+{totalXpEarned}</Text>
          <Text style={S.statLbl}>XP</Text>
        </View>
        <View style={S.statDivider} />
        <View style={S.statBox}>
          <Text style={S.statVal}>{accuracyPercent}%</Text>
          <Text style={S.statLbl}>{copy.game?.accuracyLabel || "Başarı"}</Text>
        </View>
        <View style={S.statDivider} />
        <View style={S.statBox}>
          <Text style={S.statVal}>{correctCount}/{totalQuestions}</Text>
          <Text style={S.statLbl}>{copy.game?.learnedWordsLabel || "Doğru"}</Text>
        </View>
      </View>

      <View style={S.btnWrap}>
        <PrimaryButton
          label={copy.game?.returnHomeBtn || "Bahçeye Dön"}
          onPress={onReturnHome}
        />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.xl, padding: 22, alignItems: "center", gap: 12, borderWidth: 1, borderColor: C.line, elevation: 6 },
  trophyCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: C.rewardSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.rewardBorder, marginBottom: 2 },
  title: { color: C.ink, fontSize: 22, fontWeight: "800", textAlign: "center" },
  sub: { color: C.muted, fontSize: 13.5, textAlign: "center", lineHeight: 18, maxWidth: 280 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: C.canvas, width: "100%", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: C.line, marginTop: 4 },
  statBox: { alignItems: "center" },
  statVal: { color: C.primary, fontSize: 20, fontWeight: "800" },
  statLbl: { color: C.muted, fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: C.line },
  mistakeNote: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.attentionSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: C.attentionBorder },
  mistakeNoteTxt: { color: C.attentionText, fontSize: 12, fontWeight: "700", flex: 1 },
  btnWrap: { width: "100%", marginTop: 8 },
});
