import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";
import { Brand } from "./Brand";

export function AppHeader({ level, streak, onLevelPress }: { level: string; streak: number; onLevelPress: () => void }) {
  return <View style={styles.row}><Brand /><View style={styles.actions}><View style={styles.streak}><Text>🔥</Text><Text style={styles.streakText}>{streak}</Text></View><Pressable style={styles.level} onPress={onLevelPress}><Text style={styles.levelText}>{level}</Text><Text style={styles.arrow}>⌄</Text></Pressable></View></View>;
}

const styles = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, streak: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: C.streak, borderRadius: radius.sm, padding: spacing.md }, streakText: { color: C.ink, fontWeight: "800" }, level: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: radius.sm, padding: spacing.md }, levelText: { color: C.primary, fontWeight: "800" }, arrow: { color: C.muted } });
