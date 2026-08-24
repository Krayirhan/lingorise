import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";
import { Level } from "../types/content";

export function LevelCard({ level, selected, onPress }: { level: Level; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${level.code}, ${level.title}, ${level.hint}`}
      accessibilityState={{ selected }}
    >
      <View style={[styles.badge, selected && styles.badgeSelected]}><Text style={styles.code}>{level.code}</Text></View>
      <View style={styles.copy}><Text style={styles.title}>{level.title}</Text><Text style={styles.hint}>{level.hint}</Text></View>
      <Ionicons name="chevron-forward" size={20} color="#A9A39A" importantForAccessibility="no" />
    </Pressable>
  );
}

const styles = StyleSheet.create({ card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center" }, selected: { borderColor: C.primary, backgroundColor: "#FBFAFF" }, badge: { width: 46, height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: "#F0F1F7" }, badgeSelected: { backgroundColor: C.primarySoft }, code: { color: C.primary, fontWeight: "800", fontSize: 16 }, copy: { flex: 1, marginLeft: spacing.md }, title: { color: C.ink, fontWeight: "800", fontSize: 15 }, hint: { color: C.muted, marginTop: spacing.xs, fontSize: 13 }, chevron: { color: C.faint, fontSize: 26 } });
import { Ionicons } from "@expo/vector-icons";
