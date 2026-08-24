import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  totalWords: number;
  solvedCount: number;
  onOpen: () => void;
}

export function WordNotebookCard({ copy, totalWords, solvedCount, onOpen }: Props) {
  const percent = totalWords > 0 ? Math.round((solvedCount / totalWords) * 100) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${copy.progress?.wordNotebookTitle || "Kelime Defteri"}, ${solvedCount}/${totalWords} kelime öğrenildi`}
      style={({ pressed }) => [S.card, pressed && S.pressed]}
      onPress={onOpen}
    >
      <View style={S.leftRow}>
        <View style={S.iconCircle}>
          <Ionicons name="book" size={22} color={C.primary} />
        </View>
        <View style={S.copy}>
          <Text style={S.title}>{copy.progress?.wordNotebookTitle || "Kelime Defteri"}</Text>
          <Text style={S.subtitle}>
            {solvedCount} / {totalWords} {copy.progress?.wordsLearnedSuffix || "kelime öğrenildi"} ({percent}%)
          </Text>
        </View>
      </View>

      <View style={S.actionPill}>
        <Text style={S.actionTxt}>{copy.progress?.exploreWordsBtn || "İncele"}</Text>
        <Ionicons name="chevron-forward" size={14} color={C.primary} />
      </View>
    </Pressable>
  );
}

const S = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: radius.card || 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: C.muted,
    fontSize: 12.5,
    fontWeight: "500",
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md || 12,
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  actionTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
