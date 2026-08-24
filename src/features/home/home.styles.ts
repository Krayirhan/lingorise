import { StyleSheet } from "react-native";
import { C, spacing } from "../../theme/colors";

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
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 16,
  },
  intro: {
    marginTop: 6,
    marginBottom: 6,
    gap: 4,
  },
  greeting: {
    color: C.primary,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  title: {
    color: C.ink,
    fontSize: 30,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "400",
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
    fontSize: 20,
    fontWeight: "700",
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
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});

