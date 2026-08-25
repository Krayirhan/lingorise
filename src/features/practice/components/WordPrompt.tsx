import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { formatPartOfSpeech } from "../../../utils/formatters";
import { MeaningMatchQuestion } from "../../../types/content";

interface Props {
  copy: Copy;
  question: MeaningMatchQuestion;
  dynamicFontSize: number;
  isCompactScreen: boolean;
  showHint: boolean;
  onToggleHint: () => void;
  isSpeaking: boolean;
  audioPulse: Animated.Value;
  isMotionReduced: boolean;
  onToggleSpeech: () => void;
  audioError: boolean;
}

export function WordPrompt({
  copy,
  question,
  dynamicFontSize,
  isCompactScreen,
  showHint,
  onToggleHint,
  isSpeaking,
  audioPulse,
  isMotionReduced,
  onToggleSpeech,
  audioError,
}: Props) {
  const wordPrompt = question.word || question.prompt || "";
  const posLabel = formatPartOfSpeech(question.partOfSpeech, "tr");
  const isReversed = question.mode === "PICK_THE_WORD";
  const directionLabel = isReversed
    ? copy.game?.modeLabelReversed || "TÜRKÇE → İNGİLİZCE"
    : copy.game?.modeLabel || "İNGİLİZCE → TÜRKÇE";
  const instructionText = isReversed
    ? copy.game?.instructionReversed || "İngilizce kelimeyi bul."
    : copy.game?.instruction || "Türkçe karşılığını bul.";

  return (
    <View style={[S.card, isCompactScreen && S.cardCompact]}>
      <View style={S.metaRow}>
        <View style={S.tagsRow}>
          <View style={S.dirBadge}>
            <Text style={S.dirText}>{directionLabel}</Text>
          </View>
          {posLabel ? <View style={S.posBadge}><Text style={S.posText}>{posLabel}</Text></View> : null}
        </View>
        {question.hint && (
          <Pressable
            style={S.hintBtn}
            onPress={onToggleHint}
            accessibilityRole="button"
            accessibilityLabel={showHint ? (copy.game?.hintActive || "İpucu açık") : (copy.game?.hint || "İpucu")}
          >
            <Ionicons name="bulb-outline" size={13} color={showHint ? C.rewardText : C.muted} />
            <Text style={[S.hintTxt, showHint && S.hintTxtAct]}>{showHint ? (copy.game?.hintActive || "İpucu açık") : (copy.game?.hint || "İpucu")}</Text>
          </Pressable>
        )}
      </View>

      <View style={S.cntRow}>
        <View style={S.titleWrap}>
          <Text style={[S.title, { fontSize: dynamicFontSize, lineHeight: Math.round(dynamicFontSize * 1.14) }]} numberOfLines={1} adjustsFontSizeToFit>
            {wordPrompt}
          </Text>
          {question.phonetic && <Text style={S.pho}>{question.phonetic}</Text>}
        </View>
        <Animated.View style={!isMotionReduced && isSpeaking ? { transform: [{ scale: audioPulse }] } : undefined}>
          <Pressable
            style={({ pressed }) => [S.audioBtn, isSpeaking && S.audioBtnAct, pressed && S.audioBtnPre]}
            onPress={onToggleSpeech}
            accessibilityRole="button"
            accessibilityLabel={isSpeaking ? (copy.game?.playingAudio || "Seslendiriliyor...") : (copy.game?.listenTooltip || "Telaffuzu dinle")}
          >
            <Ionicons name={isSpeaking ? "volume-high" : "volume-medium"} size={19} color={isSpeaking ? C.white : C.primary} />
          </Pressable>
        </Animated.View>
      </View>

      {audioError && (
        <View style={S.errBox}>
          <Ionicons name="volume-mute-outline" size={13} color={C.attentionText} />
          <Text style={S.errTxt}>{copy.game?.audioErrorToast || "Ses servisine ulaşılamadı."}</Text>
        </View>
      )}

      {showHint && question.hint && (
        <View style={S.hintBox}>
          <Text style={S.hintBoxTxt}>{question.hint}</Text>
          <Text style={S.hintPen}>({copy.game?.hintPenaltyNotice || "İpucu kullanıldığı için -2 XP"})</Text>
        </View>
      )}

      <View style={S.div} />
      <View style={S.instRow}>
        <Ionicons name="help-circle-outline" size={13.5} color={C.muted} />
        <Text style={S.instTxt}>{instructionText}</Text>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: C.line },
  cardCompact: { padding: spacing.md },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagsRow: { flexDirection: "row", gap: 5, alignItems: "center" },
  dirBadge: { backgroundColor: C.attentionSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.xs, borderWidth: 1, borderColor: C.attentionBorder },
  dirText: { color: C.attention, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  posBadge: { backgroundColor: C.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs },
  posText: { color: C.primary, fontSize: 9, fontWeight: "800" },
  hintBtn: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.canvas, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs, borderWidth: 1, borderColor: C.line },
  hintTxt: { color: C.muted, fontSize: 9.5, fontWeight: "700" },
  hintTxtAct: { color: C.rewardText, fontWeight: "800" },
  cntRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginTop: 4 },
  titleWrap: { flex: 1 },
  title: { color: C.ink, fontWeight: "800", letterSpacing: -0.5 },
  pho: { color: C.muted, fontSize: 12, fontStyle: "italic", marginTop: 1 },
  audioBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.primaryBorder },
  audioBtnAct: { backgroundColor: C.primary, borderColor: C.primary },
  audioBtnPre: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  errBox: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.attentionSoft, padding: 6, borderRadius: radius.xs, marginTop: 6 },
  errTxt: { color: C.attentionText, fontSize: 11, fontWeight: "600", flex: 1 },
  hintBox: { backgroundColor: C.rewardSoft, padding: 8, borderRadius: radius.xs, marginTop: 6, borderWidth: 1, borderColor: C.rewardBorder },
  hintBoxTxt: { color: C.rewardText, fontSize: 12, fontWeight: "600" },
  hintPen: { color: C.rewardText, fontSize: 10, fontWeight: "700", marginTop: 2 },
  div: { height: 1, backgroundColor: C.lineSoft, marginVertical: 8 },
  instRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  instTxt: { color: C.muted, fontSize: 13, fontWeight: "600", flex: 1 },
});
