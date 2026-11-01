import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { fonts, typeScale } from "../../../theme/typography";
import { HerbariumSlot } from "../hooks/useProgressVisuals";

interface Props {
  copy: Copy;
  unitNumber: number;
  slots: HerbariumSlot[];
  onSeeAll: () => void;
}

/**
 * The current unit as a specimen sheet: one slot per word, filled with a leaf
 * once the word is learned, so every practice session visibly changes it.
 */
export function HerbariumGrid({ copy, unitNumber, slots, onSeeAll }: Props) {
  const learned = slots.filter((slot) => slot.learned).length;
  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

  return (
    <View style={S.sheet}>
      <View style={S.header}>
        <Text accessibilityRole="header" style={S.title}>
          {fill(copy.progress?.herbariumTitle || "Bölüm {unit} herbaryumu", { unit: unitNumber })}
        </Text>
        <Text style={S.count}>
          {fill(copy.progress?.herbariumCount || "{learned} / {total} kelime", { learned, total: slots.length })}
        </Text>
      </View>

      <View style={S.grid}>
        {slots.map((slot) =>
          slot.learned ? (
            <View key={slot.id} accessible accessibilityLabel={`${slot.word}, ${slot.meaning}`} style={[S.slot, S.slotFilled]}>
              <Ionicons name="leaf" size={22} color={C.success} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={S.word}>{slot.word}</Text>
              <Text numberOfLines={1} style={S.meaning}>{slot.meaning}</Text>
            </View>
          ) : (
            <View key={slot.id} accessible={false} style={[S.slot, S.slotEmpty]}>
              <Ionicons name="leaf-outline" size={16} color={C.primaryBorder} />
            </View>
          ),
        )}
      </View>

      <Pressable accessibilityRole="button" style={({ pressed }) => [S.link, pressed && S.pressed]} onPress={onSeeAll}>
        <Text style={S.linkText}>{copy.progress?.seeAllWords || "Tüm kelimeleri gör"}</Text>
        <Ionicons name="chevron-forward" size={16} color={C.attentionText} />
      </Pressable>
    </View>
  );
}

const S = StyleSheet.create({
  sheet: { gap: 12 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  title: { flexShrink: 1, color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
  count: { color: C.muted, fontSize: typeScale.caption, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  slot: {
    width: "18%",
    minHeight: 62,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  slotFilled: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.successBorder, gap: 2 },
  slotEmpty: { backgroundColor: C.lineSoft, borderWidth: 1, borderColor: C.line },
  word: { color: C.ink, fontFamily: fonts.display, fontSize: 13 },
  meaning: { color: C.muted, fontSize: 10.5 },
  link: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", minHeight: 44, gap: 2 },
  linkText: { color: C.attentionText, fontSize: typeScale.body, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
