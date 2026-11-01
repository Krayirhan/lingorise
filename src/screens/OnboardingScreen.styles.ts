import { StyleSheet } from "react-native";
import { C } from "../theme/colors";
import { spacing } from "../theme/colors";

export const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.canvas },
  page: { flex: 1, padding: spacing.xl, paddingBottom: 24 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xl, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm, marginBottom: 10 },
  step: { color: C.primary, fontWeight: "800", fontSize: 13 },
  back: { color: C.ink, fontSize: 16, fontWeight: "700" },
})
