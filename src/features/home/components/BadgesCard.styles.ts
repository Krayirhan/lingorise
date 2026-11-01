import { StyleSheet } from "react-native";
import { C } from "../../../theme/colors";
import { fonts, typeScale } from "../../../theme/typography";

export const S = StyleSheet.create({
  section: { gap: 10 },
  badgesCardTitle: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section },
  scroller: { marginHorizontal: -20 },
  shelf: { paddingHorizontal: 20, gap: 12 },
  badgeItem: { width: 108, alignItems: "center", gap: 4 },
  medallion: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  // Wax-seal look: a filled disc with an inner ring.
  medallionUnlocked: { backgroundColor: C.success, borderColor: C.successText },
  innerRing: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderRadius: 32, borderWidth: 1 },
  innerRingUnlocked: { borderColor: "rgba(251, 247, 240, 0.6)" },
  innerRingLocked: { borderColor: C.line, borderStyle: "dashed" },
  medallionLocked: { backgroundColor: C.canvasWarm, borderColor: C.line },
  lock: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeItemName: { color: C.ink, fontFamily: fonts.display, fontSize: 13, textAlign: "center", marginTop: 4 },
  badgeUnlockedStatus: { color: C.successText, fontFamily: fonts.bodyBold, fontSize: 11, textAlign: "center" },
  badgeLockedStatus: { color: C.muted, fontFamily: fonts.bodyMedium, fontSize: 11, textAlign: "center" },
  badgeCondition: { color: C.muted, fontSize: 11.5, textAlign: "center", lineHeight: 15 },
});
