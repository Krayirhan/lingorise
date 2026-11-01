import { StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Locale } from "../../../i18n/en";

interface Props {
  locale: Locale;
  completed: number;
  target: number;
}

export function DailyGoalProgress({ locale, completed, target }: Props) {
  const count = Math.max(0, Math.min(target, completed));
  const segmentCount = Math.max(1, Math.min(target, 30));

  return (
    <View accessibilityLabel={`${locale === "tr" ? "Bugünün hedefi" : "Today's goal"}: ${count} / ${target}`}>
      <View style={S.header}>
        <Text style={S.label}>{locale === "tr" ? "BUGÜNÜN HEDEFİ" : "TODAY’S GOAL"}</Text>
        <Text style={S.count}>{count} / {target} {locale === "tr" ? "kelime" : "words"}</Text>
      </View>
      <View style={S.meter}>
        {Array.from({ length: segmentCount }, (_, index) => (
          <View
            key={index}
            style={[S.segment, index < count && S.segmentComplete]}
          />
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { color: C.primary, fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  count: { color: C.ink, fontSize: 13, fontWeight: "700" },
  meter: { height: 10, flexDirection: "row", gap: 2, overflow: "hidden" },
  segment: { flex: 1, borderRadius: 4, backgroundColor: "#E8E3DA" },
  segmentComplete: { backgroundColor: C.primary },
});
