import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../domain/models/content";
import { C } from "../../../theme/colors";
import { fonts, typeScale } from "../../../theme/typography";
import { LevelProgressItem } from "../progress.types";

interface Props {
  copy: Copy;
  level: LevelCode;
  levelProgressList: LevelProgressItem[];
}

/** A1 → C2 as one ruler: each level a segment filled by the share of its words seen. */
export function LevelRuler({ copy, level, levelProgressList }: Props) {
  const current = levelProgressList.find((item) => item.level === level);
  const currentPercent = current && current.total > 0 ? Math.round((current.seen / current.total) * 100) : 0;
  const percentLabel = current && current.seen > 0 && currentPercent === 0 ? "<%1" : `%${currentPercent}`;

  return (
    <View style={S.section}>
      <View style={S.header}>
        <Text accessibilityRole="header" style={S.title}>{copy.progress?.levelRulerTitle || "Seviye cetveli"}</Text>
        <Text style={S.caption}>{level} · {percentLabel}</Text>
      </View>

      <View style={S.ruler}>
        {levelProgressList.map((item) => {
          const isReady = item.isReady !== false;
          const percent = item.total > 0 ? Math.min(100, Math.round((item.seen / item.total) * 100)) : 0;
          const isCurrent = item.level === level;
          return (
            <View
              key={item.level}
              accessible
              accessibilityLabel={isReady
                ? `${item.level}, ${item.seen} / ${item.total}`
                : `${item.level}, ${copy.progress?.levelComingSoon || "Yakında"}`}
              style={S.segmentWrap}
            >
              <View style={[S.segment, !isReady && S.segmentSoon, isCurrent && S.segmentCurrent]}>
                {isReady && <View style={[S.fill, { width: `${percent}%` }]} />}
              </View>
              <View style={S.labelRow}>
                <Text style={[S.label, isCurrent && S.labelCurrent, !isReady && S.labelSoon]}>{item.level}</Text>
                {item.examPassed && <Ionicons name="checkmark-circle" size={12} color={C.successText} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  title: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
  caption: { color: C.successText, fontFamily: fonts.bodyBold, fontSize: 14 },
  ruler: { flexDirection: "row", gap: 4 },
  segmentWrap: { flex: 1, gap: 6 },
  segment: { height: 15, borderRadius: 4, backgroundColor: C.lineSoft, overflow: "hidden" },
  segmentCurrent: { borderWidth: 1, borderColor: C.success },
  segmentSoon: { backgroundColor: "transparent", borderWidth: 1, borderStyle: "dashed", borderColor: C.primaryBorder },
  fill: { height: "100%", backgroundColor: C.success },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  label: { color: C.ink, fontSize: 12, fontWeight: "600" },
  labelCurrent: { color: C.successText, fontWeight: "800" },
  labelSoon: { color: C.muted },
});
