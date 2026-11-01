import { StyleSheet } from "react-native";
import { C, radius } from "../theme/colors";

/** Styles for the shared auth field and status components, owned here so components/ does not depend on screens/. */
export const S = StyleSheet.create({
  backToLoginBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backToLoginTxt: {
    color: C.primary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },
  fieldGroup: {
    gap: 6,
  },
  hintText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
    paddingLeft: 2,
  },
  input: {
    flex: 1,
    height: 52,
    color: C.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrapError: {
    borderColor: C.attention,
    backgroundColor: C.attentionSoft,
  },
  label: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: C.successBorder,
    borderRadius: radius.card || 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  successTitle: {
    color: C.successText,
    fontSize: 18,
    fontWeight: "700",
  },
  successSubtitle: {
    color: C.muted,
    fontSize: 14,
  },
});
