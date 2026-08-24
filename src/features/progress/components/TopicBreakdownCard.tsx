import { StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { TopicProgressItem } from "../progress.types";

interface Props {
  copy: Copy;
  topicBreakdown: TopicProgressItem[];
}

export function TopicBreakdownCard({ copy, topicBreakdown }: Props) {
  return (
    <View style={S.card}>
      <Text style={S.title}>{copy.progress?.topicsHeader || "Konu Yetkinliği"}</Text>

      <View style={S.grid}>
        {topicBreakdown.map((item) => (
          <View key={item.topic} style={S.chip}>
            <Text style={S.topicName}>{item.topic}</Text>
            <View style={S.countBadge}>
              <Text style={S.countBadgeTxt}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: C.line, gap: 10 },
  title: { color: C.ink, fontSize: 15, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: C.canvas, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: C.line, gap: 6 },
  topicName: { color: C.ink, fontSize: 12, fontWeight: "700" },
  countBadge: { backgroundColor: C.primarySoft, paddingHorizontal: 5, paddingVertical: 1, borderRadius: radius.xs },
  countBadgeTxt: { color: C.primary, fontSize: 10, fontWeight: "800" },
});
