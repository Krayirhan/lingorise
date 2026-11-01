import { StyleSheet, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { fonts, typeScale } from "../../../theme/typography";
import { HeatmapDay, HeatmapWeek } from "../activityHeatmapModel";
import { formatTemplate } from "../../../utils/formatters";

interface Props {
  copy: Copy;
  weeks: HeatmapWeek[];
}

const SHADES: Record<HeatmapDay["intensity"], string> = {
  0: C.lineSoft,
  1: C.successBorder,
  2: "#86AF80",
  3: C.success,
};

/** Twelve weeks of practice as a calendar grid, one column per week. */
export function ActivityHeatmap({ copy, weeks }: Props) {
  const months = (copy.progress?.monthShort || "").split("|");
  const weekdays = (copy.progress?.weekdayInitials || "").split("|");
  const thisWeek = weeks[weeks.length - 1]?.days.filter((day) => day.intensity > 0).length ?? 0;
  const activeDays = weeks.flatMap((week) => week.days).filter((day) => day.intensity > 0).length;
  return (
    <View style={S.section}>
      <View style={S.header}>
        <Text accessibilityRole="header" style={S.title}>{copy.progress?.activityTitle || "Son 12 hafta"}</Text>
        <Text style={S.caption}>
          {formatTemplate(copy.progress?.activityCaption || "Bu hafta {count} gün pratik yaptın", { count: thisWeek })}
        </Text>
      </View>
      <View style={S.legend} accessibilityLabel={`${copy.progress.activityLess} – ${copy.progress.activityMore}`}>
        <Text style={S.legendText}>{copy.progress.activityLess}</Text>
        {([0, 1, 2, 3] as const).map((intensity) => (
          <View key={intensity} style={[S.legendCell, { backgroundColor: SHADES[intensity] }]} />
        ))}
        <Text style={S.legendText}>{copy.progress.activityMore}</Text>
      </View>

      <View
        accessible
        accessibilityLabel={formatTemplate(copy.progress?.activityAccessibility || "{count}", { count: activeDays })}
        style={S.body}
      >
        <View style={S.weekdayColumn}>
          <Text style={S.monthLabel}> </Text>
          {weekdays.map((initial, index) => (
            <Text key={index} style={S.weekday}>{index % 2 === 0 ? initial : ""}</Text>
          ))}
        </View>
        {weeks.map((week) => (
          <View key={week.days[0].date} style={S.column}>
            <Text numberOfLines={1} style={S.monthLabel}>{week.monthStart !== null ? months[week.monthStart] : " "}</Text>
            {week.days.map((day) => (
              <View
                key={day.date}
                style={[
                  S.cell,
                  { backgroundColor: day.isFuture ? "transparent" : SHADES[day.intensity] },
                  day.isToday && S.cellToday,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const CELL = 18;

const S = StyleSheet.create({
  section: { gap: 12 },
  header: { gap: 2 },
  title: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
  caption: { color: C.muted, fontSize: typeScale.caption },
  body: { flexDirection: "row", justifyContent: "space-between" },
  weekdayColumn: { gap: 4, marginRight: 4 },
  weekday: { height: CELL, lineHeight: CELL, color: C.muted, fontSize: 10.5, fontWeight: "600" },
  column: { width: CELL, gap: 4 },
  monthLabel: { height: 14, color: C.muted, fontSize: 10.5, fontWeight: "600", width: 30 },
  cell: { width: CELL, height: CELL, borderRadius: 4 },
  cellToday: { borderWidth: 2, borderColor: C.attentionStrong },
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
  legendText: { color: C.muted, fontFamily: fonts.body, fontSize: 11 },
});
