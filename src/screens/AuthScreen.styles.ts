import { StyleSheet } from "react-native";
import { C, radius } from "../theme/colors";

export const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  brandHeader: {
    justifyContent: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  backBtnTxt: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  introRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    gap: 12,
  },
  introCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: C.ink,
    fontSize: 27,
    fontWeight: "700",
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "400",
  },
  mascot: {
    width: 68,
    height: 72,
    marginTop: -4,
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.attentionSoft,
    borderWidth: 1,
    borderColor: C.attentionBorder,
    borderRadius: radius.md || 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    color: C.attentionText,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  primaryBtn: {
    height: 52,
    minHeight: 52,
    borderRadius: radius.button || 18,
    backgroundColor: C.attentionStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnBusy: {
    opacity: 0.7,
  },
  primaryBtnTxt: {
    color: C.surface,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  termsText: {
    color: C.muted,
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  switchBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 8,
  },
  switchRegular: {
    color: C.muted,
    fontSize: 13.5,
    fontWeight: "500",
  },
  switchHighlight: {
    color: C.primary,
    fontWeight: "700",
  },
  guestBtn: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
  },
  guestTxt: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  forgotLink: {
    color: C.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },
});
