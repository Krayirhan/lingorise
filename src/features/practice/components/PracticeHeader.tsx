import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  index: number;
  totalQuestions: number;
  isReviewMode: boolean;
  onBack: () => void;
}

export function PracticeHeader({ copy, index, totalQuestions, isReviewMode, onBack }: Props) {
  const isSingle = totalQuestions <= 1;
  const progressPercent = Math.min(Math.max(Math.round((totalQuestions > 0 ? (index + 1) / totalQuestions : 1) * 100), 0), 100);

  return (
    <View style={S.topNav}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.game?.backButton || "Ana sayfaya dön"}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={({ pressed }) => [S.backBtn, pressed && S.backBtnPre]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={20} color={C.ink} />
      </Pressable>

      <View style={S.progWrap}>
        <View style={S.progTrack}>
          <View style={[S.progFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={S.indWrap}>
        {isReviewMode ? (
          <View style={S.revBadge}>
            <Ionicons name="refresh" size={11} color={C.attentionText} style={S.icon} />
            <Text style={S.revText}>{copy.game?.reviewModeBadge || "Hata Tekrarı"}</Text>
          </View>
        ) : isSingle ? (
          <View style={S.qBadge}>
            <Ionicons name="play-circle-outline" size={11} color={C.primary} style={S.icon} />
            <Text style={S.qText}>{copy.game?.quickPractice || "Hızlı Pratik"}</Text>
          </View>
        ) : (
          <View style={S.cntBadge}>
            <Text style={S.cntCur}>{index + 1}</Text>
            <Text style={S.cntDiv}>/</Text>
            <Text style={S.cntTot}>{totalQuestions}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  topNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingTop: 6, paddingBottom: spacing.xs, paddingHorizontal: spacing.xl, minHeight: 52 },
  backBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.line },
  backBtnPre: { backgroundColor: C.lineSoft, transform: [{ scale: 0.96 }] },
  progWrap: { flex: 1, height: 24, justifyContent: "center", paddingHorizontal: 2 },
  progTrack: { width: "100%", height: 7, backgroundColor: C.line, borderRadius: radius.xs, overflow: "hidden" },
  progFill: { height: "100%", backgroundColor: C.primary, borderRadius: radius.xs },
  indWrap: { alignItems: "flex-end", justifyContent: "center", minWidth: 68 },
  revBadge: { flexDirection: "row", alignItems: "center", backgroundColor: C.attentionSoft, paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: radius.sm, borderWidth: 1, borderColor: C.attentionBorder },
  qBadge: { flexDirection: "row", alignItems: "center", backgroundColor: C.primarySoft, paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: radius.sm, borderWidth: 1, borderColor: C.primaryBorder },
  icon: { marginRight: 3 },
  revText: { color: C.attentionText, fontSize: 10.5, fontWeight: "800", letterSpacing: 0.3 },
  qText: { color: C.primary, fontSize: 10.5, fontWeight: "800", letterSpacing: 0.3 },
  cntBadge: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, paddingHorizontal: 8, paddingVertical: 3.5, borderRadius: radius.sm, borderWidth: 1, borderColor: C.line },
  cntCur: { color: C.primary, fontSize: 12.5, fontWeight: "800" },
  cntDiv: { color: C.faint, fontSize: 11, fontWeight: "700", marginHorizontal: 2 },
  cntTot: { color: C.muted, fontSize: 11.5, fontWeight: "700" },
});
