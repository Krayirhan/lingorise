import { StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { WeekStripDay } from "../weekStripModel";
import { fonts } from "../../../theme/typography";

export function WeekStreakStrip({ copy, streak, days }: {
  copy: Copy; streak: number; days: WeekStripDay[];
}) {
  const activeCount = days.filter((day) => day.isActive).length;
  const label = copy.home.weekStripAccessibility
    .replace("{streak}", String(streak))
    .replace("{count}", String(activeCount));

  return (
    <View accessible accessibilityLabel={label} style={S.card}>
      <View style={S.streak}>
        <View style={S.streakBadge}>
          <Text style={S.streakCount}>{streak}</Text>
        </View>
        <Text numberOfLines={1} style={S.streakLabel}>{copy.home.streakDayLabel}</Text>
      </View>
      <View style={S.divider} />
      <View style={S.days}>
        {days.map((day) => (
          <View key={day.date} style={S.day}>
            <View style={[S.dot, day.isActive ? S.dotActive : day.isToday ? S.dotToday : null]} />
            <Text style={[S.dayLabel, day.isToday && S.dayLabelToday]}>{day.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  streak: { alignItems: "center", gap: 4, minWidth: 56 },
  streakBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.reward,
    alignItems: "center",
    justifyContent: "center",
  },
  streakCount: { color: C.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  streakLabel: { color: C.muted, fontFamily: fonts.bodySemi, fontSize: 11.5 },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: C.line },
  days: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: 6, minWidth: 28 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.faint,
  },
  dotActive: { backgroundColor: C.attentionStrong, borderColor: C.attentionStrong },
  dotToday: { borderColor: C.attentionStrong, borderWidth: 2 },
  dayLabel: { color: C.muted, fontFamily: fonts.bodyMedium, fontSize: 11.5 },
  dayLabelToday: { color: C.ink, fontFamily: fonts.bodyBold },
});
