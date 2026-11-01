import { StyleSheet } from "react-native";
import { C, spacing } from "../../theme/colors";
import { fonts, typeScale } from "../../theme/typography";

export const homeStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  shell: {
    flex: 1,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 12,
  },
  intro: {
    marginTop: 2,
    gap: 4,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 120,
  },
  introCopy: {
    flex: 1,
    maxWidth: "72%",
    minWidth: 0,
    justifyContent: "center",
    gap: 6,
    paddingRight: 4,
  },
  greeting: {
    fontFamily: fonts.bodyBold,
    color: C.primary,
    fontSize: 11.5,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  title: {
    color: C.primary,
    fontFamily: fonts.display,
    fontSize: typeScale.display,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.body,
    color: C.ink,
    fontSize: 14.5,
    lineHeight: 20,
    marginTop: 0,
  },
  skills: {
    gap: 10,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: -4,
  },
  sectionTitle: {
    color: C.ink,
    fontFamily: fonts.display,
    fontSize: typeScale.section,
    letterSpacing: -0.2,
  },
  sectionLinkBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 6,
  },
  sectionLink: {
    fontFamily: fonts.bodyBold,
    color: C.attentionText,
    fontSize: 13,
  },
  gardenTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  gardenTipButton: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  gardenTipText: { flex: 1, color: C.primary, fontSize: 12, lineHeight: 17 },
});

