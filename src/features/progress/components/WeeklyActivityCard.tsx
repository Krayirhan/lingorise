import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { PracticeHistoryEntry } from "../../../types/user";

interface Props {
  copy: Copy;
  streak: number;
  lastActiveDate: string;
  practiceHistory?: PracticeHistoryEntry[];
}

export function WeeklyActivityCard({ copy, streak, lastActiveDate, practiceHistory = [] }: Props) {
  // Days of the current week (e.g., Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
  const days = [
    { label: "Pzt", dayNum: 1 },
    { label: "Sal", dayNum: 2 },
    { label: "Çar", dayNum: 3 },
    { label: "Per", dayNum: 4 },
    { label: "Cum", dayNum: 5 },
    { label: "Cmt", dayNum: 6 },
    { label: "Paz", dayNum: 0 },
  ];

  const todayIndex = new Date().getDay(); // 0 is Sunday
  // Map todayIndex to 0-6 where 0 is Monday
  const todayMapped = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <View style={S.card}>
      <View style={S.headerRow}>
        <View style={S.iconCircle}>
          <Ionicons name="calendar" size={18} color={C.primary} />
        </View>
        <View style={S.headerCopy}>
          <Text style={S.title}>{copy.progress?.weeklyTitle || "Haftalık Aktivite"}</Text>
          <Text style={S.subtitle}>
            {streak > 0
              ? `${streak} ${copy.progress?.streakDaysActive || "günlük seri devam ediyor!"}`
              : copy.progress?.streakStartPrompt || "Bugün pratik yaparak serini başlat!"}
          </Text>
        </View>
      </View>

      <View style={S.daysRow}>
        {days.map((d, index) => {
          const isToday = index === todayMapped;
          // Days within current streak ending today are marked active
          const daysAgo = todayMapped - index;
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          const dateKey = date.toISOString().slice(0, 10);
          const entry = practiceHistory.find((item) => item.date === dateKey);
          const isActive = Boolean(entry?.answers) || (daysAgo >= 0 && daysAgo < streak);

          return (
            <View key={d.label} style={S.dayCol}>
              <View
                style={[
                  S.dayPill,
                  isActive && S.dayPillActive,
                  isToday && S.dayPillToday,
                ]}
              >
                <Ionicons
                  name={isActive ? "leaf" : "ellipse-outline"}
                  size={14}
                  color={isActive ? (isToday ? C.rewardText : C.successText) : C.muted}
                />
              </View>
              <Text style={[S.dayLabel, isToday && S.dayLabelToday]}>{d.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={S.footerRow}>
        <View style={S.metric}>
          <Text style={S.metricVal}>{practiceHistory.reduce((sum, item) => sum + item.answers, 0)}</Text>
          <Text style={S.metricLbl}>{copy.progress?.dailyAvgTime || "Ort. Süre"}</Text>
        </View>
        <View style={S.metricDivider} />
        <View style={S.metric}>
          <Text style={S.metricVal}>+{practiceHistory.reduce((sum, item) => sum + item.xp, 0)} XP</Text>
          <Text style={S.metricLbl}>{copy.progress?.streakXpBonus || "Seri Bonusu"}</Text>
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "800",
  },
  subtitle: {
    color: C.muted,
    fontSize: 12.5,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.canvas,
    padding: 12,
    borderRadius: radius.md || 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
  },
  dayPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillActive: {
    backgroundColor: C.successSoft,
    borderColor: C.successBorder,
  },
  dayPillToday: {
    backgroundColor: C.rewardSoft,
    borderColor: C.rewardBorder,
  },
  dayLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  dayLabelToday: {
    color: C.primary,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 2,
  },
  metric: {
    alignItems: "center",
  },
  metricVal: {
    color: C.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  metricLbl: {
    color: C.muted,
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "600",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: C.line,
  },
});
