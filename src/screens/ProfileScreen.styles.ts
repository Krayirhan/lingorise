import { StyleSheet } from "react-native";
import { C } from "../theme/colors";
import { fonts } from "../theme/typography";

export const S = StyleSheet.create({
  root: { flex: 1, maxWidth: 580, width: "100%", alignSelf: "center" },
  titleRow: { gap: 4, marginTop: 4, marginBottom: 2 },
  pageEyebrow: { color: C.muted, fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 2 },
  pageTitle: { color: C.ink, fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 16, paddingBottom: 28 },
  aboutCard: { paddingHorizontal: 4, gap: 4, alignItems: "center" },
  aboutTitle: { color: C.muted, fontFamily: fonts.bodyMedium, fontSize: 12, textAlign: "center" },
});
