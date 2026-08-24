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
              {isComingSoon && <Text style={S.soonTxt}>{copy.progress?.levelComingSoon || "Yakında"}</Text>}
            </View>

            {!isComingSoon && (
              <>
                {/* Coverage: moves the instant you practice — this is the
                    number a finished session should show up as. */}
                <View style={S.metricRow}>
                  <Text style={S.metricLabel}>{copy.progress?.wordsSeenLabel || "Görülen"}</Text>
                  <Text style={S.metricValue}>{item.seen} / {item.total}</Text>
                </View>
                <View style={S.track}>
                  <View style={[S.fill, S.fillSeen, { width: `${seenPercent}%` }]} />
                </View>

                {/* Mastery: only counts recall confirmed on a separate day, so
                    it deliberately lags behind — that lag is what makes it mean
                    something. Shown as its own metric, not a footnote on the
                    number above. */}
                <View style={[S.metricRow, S.metricRowSecond]}>
                  <Text style={S.metricLabel}>{copy.progress?.wordsMasteredLabel || "Pekişen"}</Text>
                  <Text style={S.metricValueMuted}>{item.mastered} / {item.total} · %{item.percent}</Text>
                </View>
                <View style={S.track}>
                  <View style={[S.fill, { width: `${item.percent}%` }]} />
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
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricRowSecond: { marginTop: 4 },
  metricLabel: { color: C.muted, fontSize: 10.5, fontWeight: "700", letterSpacing: 0.3 },
  metricValue: { color: C.ink, fontSize: 12.5, fontWeight: "800" },
  metricValueMuted: { color: C.muted, fontSize: 11.5, fontWeight: "700" },
  track: { height: 6, backgroundColor: C.line, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, backgroundColor: C.primary, borderRadius: 3 },
  fillSeen: { backgroundColor: C.primaryBorder },
});
