import { StyleSheet } from "react-native";
import { C } from "../../theme/colors";
import { fonts, typeScale } from "../../theme/typography";

export const S = StyleSheet.create({
  root: { flex: 1, maxWidth: 580, width: "100%", alignSelf: "center" },
  titleRow: { gap: 4, marginTop: 4, marginBottom: 2 },
  pageEyebrow: { color: C.muted, fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 2 },
  pageTitle: { color: C.ink, fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  pageSubtitle: { color: C.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 20 },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 20, paddingBottom: 28 },
  analyticsRow: { flexDirection: "row", padding: 12, backgroundColor: C.surface, borderColor: C.line, borderWidth: 1, borderRadius: 12 },
  // Plain figures separated by hairlines, not three more cards.
  analyticsTile: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingHorizontal: 8,
  },
  analyticsDivider: { borderLeftWidth: 1, borderLeftColor: C.line },
  analyticsIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  analyticsValue: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.title, marginTop: 2 },
  analyticsLabel: { color: C.muted, fontFamily: fonts.body, fontSize: 12.5 },
  analyticsContext: { color: C.muted, fontFamily: fonts.body, fontSize: 11 },
  sectionTitle: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
});
