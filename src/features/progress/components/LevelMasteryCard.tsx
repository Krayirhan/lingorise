import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { LevelProgressItem } from "../progress.types";

interface Props {
  copy: Copy;
  levelProgressList: LevelProgressItem[];
}

export function LevelMasteryCard({ copy, levelProgressList }: Props) {
  return (
    <View style={S.card}>
      <Text style={S.title}>{copy.progress?.levelsHeader || "Seviye Yetkinliği"}</Text>

      {levelProgressList.map((item) => {
        // A level without enough words is announced, not scored — showing
        // "0 / 5" would advertise a gap rather than describe progress.
        const isComingSoon = item.isReady === false;
        const seenPercent = item.total > 0 ? Math.round((item.seen / item.total) * 100) : 0;

        return (
          <View key={item.level} style={[S.levelRow, isComingSoon && S.levelRowSoon]}>
            <View style={S.tagWrap}>
              <View style={S.tag}><Text style={S.tagTxt}>{item.level}</Text></View>
              {isComingSoon ? (
                <Text style={S.soonTxt}>{copy.progress?.levelComingSoon || "Yakında"}</Text>
              ) : item.examPassed ? (
                <View style={S.examBadge}>
                  <Ionicons name="checkmark-circle" size={11} color={C.successText} />
                  <Text style={S.examBadgeTxt}>{copy.progress?.examPassedTag || "Sınav geçildi"}</Text>
                </View>
              ) : null}
            </View>

            {!isComingSoon && (
              <>
                {/* Coverage: moves the instant you practice — this is the
                    number a finished session should show up as. Level
                    completion itself is decided separately, by the exam
                    (badge above), not by this coverage number. */}
                <View style={S.metricRow}>
                  <Text style={S.metricLabel}>{copy.progress?.wordsSeenLabel || "Görülen"}</Text>
                  <Text style={S.metricValue}>{item.seen} / {item.total}</Text>
                </View>
                <View style={S.track}>
                  <View style={[S.fill, S.fillSeen, { width: `${seenPercent}%` }]} />
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: C.line, gap: 14 },
  title: { color: C.ink, fontSize: 15, fontWeight: "800", marginBottom: 2 },
  levelRow: { gap: 5 },
  levelRowSoon: { opacity: 0.6 },
  soonTxt: { color: C.faint, fontSize: 11, fontWeight: "700" },
  tagWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 1 },
  tag: { backgroundColor: C.primarySoft, paddingHorizontal: 7, paddingVertical: 1.5, borderRadius: radius.xs },
  tagTxt: { color: C.primary, fontSize: 10, fontWeight: "800" },
  examBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successSoft, paddingHorizontal: 7, paddingVertical: 1.5, borderRadius: radius.xs },
  examBadgeTxt: { color: C.successText, fontSize: 10, fontWeight: "800" },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { color: C.muted, fontSize: 10.5, fontWeight: "700", letterSpacing: 0.3 },
  metricValue: { color: C.ink, fontSize: 12.5, fontWeight: "800" },
  track: { height: 6, backgroundColor: C.line, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  fillSeen: { backgroundColor: C.primaryBorder },
});
