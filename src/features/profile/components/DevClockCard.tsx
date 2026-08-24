import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { advanceDevClock, resetDevClock, getDevClockOffsetDays, todayISO } from "../../../utils/clock";

interface Props {
  /** Reloads user state from storage, re-running the daily-rollover check
      against the (now shifted) clock — without this, advancing the clock
      changes nothing visible until the next natural reload. */
  onRefresh?: () => void;
}

/**
 * Dev-only tool (roadmap Birim 4.1) for observing multi-day behavior —
 * rollover, mastery, garden growth, SRS scheduling — on a real device
 * without waiting for real days or needing device clock access. The
 * Android emulator used through this project's development refuses
 * `adb root` (production system image), which blocks changing the OS
 * clock entirely; this is the replacement.
 *
 * Never rendered in a release build: __DEV__ is checked both here and by
 * the caller, and advanceDevClock() is itself a no-op outside __DEV__.
 */
export function DevClockCard({ onRefresh }: Props) {
  const [offsetDays, setOffsetDays] = useState(getDevClockOffsetDays());

  if (!__DEV__) return null;

  const advance = (days: number) => {
    advanceDevClock(days);
    setOffsetDays(getDevClockOffsetDays());
    onRefresh?.();
  };

  const reset = () => {
    resetDevClock();
    setOffsetDays(getDevClockOffsetDays());
    onRefresh?.();
  };

  return (
    <View style={S.card}>
      <View style={S.headerRow}>
        <Ionicons name="time-outline" size={16} color={C.attentionText} />
        <Text style={S.headerTitle}>Dev — Zaman Kaydırma</Text>
      </View>
      <Text style={S.sub}>
        Bugün: {todayISO()} {offsetDays > 0 ? `(+${offsetDays} gün)` : ""}
      </Text>
      <View style={S.row}>
        <Pressable style={S.btn} onPress={() => advance(1)} accessibilityRole="button" accessibilityLabel="1 gün ilerlet">
          <Text style={S.btnTxt}>+1 gün</Text>
        </Pressable>
        <Pressable style={S.btn} onPress={() => advance(7)} accessibilityRole="button" accessibilityLabel="7 gün ilerlet">
          <Text style={S.btnTxt}>+7 gün</Text>
        </Pressable>
        <Pressable style={S.btn} onPress={() => advance(30)} accessibilityRole="button" accessibilityLabel="30 gün ilerlet">
          <Text style={S.btnTxt}>+30 gün</Text>
        </Pressable>
        <Pressable style={S.resetBtn} onPress={reset} accessibilityRole="button" accessibilityLabel="Zamanı sıfırla">
          <Text style={S.resetBtnTxt}>Sıfırla</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.attentionSoft,
    borderRadius: radius.card || 20,
    padding: 14,
    borderWidth: 1,
    borderColor: C.attentionBorder,
    gap: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { color: C.attentionText, fontSize: 13, fontWeight: "800" },
  sub: { color: C.attentionText, fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", gap: 6 },
  btn: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: C.attentionBorder },
  btnTxt: { color: C.attentionText, fontWeight: "700", fontSize: 12 },
  resetBtn: { minHeight: 40, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  resetBtnTxt: { color: C.attentionText, fontWeight: "600", fontSize: 11.5, textDecorationLine: "underline" },
});
