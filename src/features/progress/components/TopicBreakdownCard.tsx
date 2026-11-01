import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { TopicProgressItem } from "../progress.types";
import { fonts, typeScale } from "../../../theme/typography";

interface Props {
  copy: Copy;
  topicBreakdown: TopicProgressItem[];
}

/** Topics as one compact list; the topic being worked on is marked, locked ones carry a lock. */
export function TopicBreakdownCard({ copy, topicBreakdown }: Props) {
  const [expanded, setExpanded] = useState(false);
  const currentId = topicBreakdown.find((item) => item.state === "in_progress" || item.state === "assessment_due" || item.state === "available")?.topicId;
  const currentIndex = topicBreakdown.findIndex((item) => item.topicId === currentId);
  const visibleCount = Math.max(4, currentIndex + 1);
  const visibleTopics = expanded ? topicBreakdown : topicBreakdown.slice(0, visibleCount);

  return (
    <View style={S.section}>
      <Text accessibilityRole="header" style={S.title}>{copy.progress.topicsHeader}</Text>

      <View style={S.list}>
        {visibleTopics.map((item, index) => {
          const percent = item.total > 0 ? Math.min(100, Math.round((item.seen / item.total) * 100)) : 0;
          const isLocked = item.state === "locked";
          const isCurrent = item.topicId === currentId;
          const isMastered = item.state === "mastered" || item.state === "completed";
          const count = item.state === "assessment_due" ? "Kontrol" : `${item.seen} / ${item.total}`;
          return (
            <View
              key={item.topicId}
              accessible
              accessibilityLabel={`${item.topic}, ${item.objective}, ${count}`}
              style={[S.row, index > 0 && S.divider]}
            >
              <View style={S.nameRow}>
                <Ionicons
                  name={isLocked ? "lock-closed-outline" : isMastered ? "flower-outline" : "leaf-outline"}
                  size={16}
                  color={isLocked ? C.muted : C.success}
                />
                <Text numberOfLines={1} style={[S.topicName, isLocked && S.lockedText]}>{item.topic}</Text>
                {isCurrent && (
                  <View style={S.currentTag}>
                    <Text style={S.currentTagText}>{copy.progress.currentTopicTag}</Text>
                  </View>
                )}
                <Text style={[S.count, item.state === "assessment_due" && S.countDue]}>{count}</Text>
              </View>
              {!isLocked && (
                <View style={S.track}>
                  <View style={[S.fill, { width: `${percent}%` }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>
      {topicBreakdown.length > visibleCount && (
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={S.toggle}>
          <Text style={S.toggleText}>{expanded ? copy.progress.topicsShowLess : copy.progress.topicsShowAll}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={C.attentionText} />
        </Pressable>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  section: { gap: 6 },
  title: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
  list: {},
  row: { paddingVertical: 12, gap: 8 },
  divider: { borderTopWidth: 1, borderTopColor: C.line },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  topicName: { flex: 1, color: C.ink, fontFamily: fonts.display, fontSize: typeScale.card },
  lockedText: { color: C.muted },
  currentTag: { backgroundColor: C.successSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  currentTagText: { color: C.successText, fontSize: 11.5, fontWeight: "700" },
  count: { color: C.muted, fontSize: typeScale.caption, fontWeight: "600" },
  countDue: { color: C.attentionText },
  track: { height: 5, borderRadius: 3, backgroundColor: C.lineSoft, overflow: "hidden", marginLeft: 24 },
  fill: { height: 5, borderRadius: 3, backgroundColor: C.success },
  toggle: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
  toggleText: { color: C.attentionText, fontFamily: fonts.bodyBold, fontSize: 13 },
});
