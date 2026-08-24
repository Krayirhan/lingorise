import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";

export function QuestCard({ title, meta, onPress }: { title: string; meta: string; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}><View style={styles.icon}><Ionicons name="play-circle-outline" size={22} color={C.primary} /></View><View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.meta}>{meta}</Text></View><Ionicons name="chevron-forward" size={22} color={C.primary} /></Pressable>;
}

const styles = StyleSheet.create({ card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.line }, icon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" }, iconText: { color: C.primary, fontSize: 22 }, copy: { flex: 1, marginLeft: spacing.md, gap: spacing.xs }, title: { color: C.ink, fontWeight: "800", fontSize: 16 }, meta: { color: C.muted, fontSize: 13 }, arrow: { color: C.primary, fontSize: 29 } });
import { Ionicons } from "@expo/vector-icons";
