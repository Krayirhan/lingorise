import { Ionicons } from "@expo/vector-icons";
import { Animated, Image, StyleSheet, View } from "react-native";
import { C, radius } from "../../../theme/colors";

const sprigImage = require("../../../../assets/sprig-mascot-idle-transparent.png");

interface Props {
  correct: boolean;
  isMotionReduced: boolean;
  leafAnim: Animated.Value;
  mascotBounce: Animated.Value;
}

export function PracticeMascot({ correct, isMotionReduced, leafAnim, mascotBounce }: Props) {
  return (
    <View style={S.mascotSection}>
      <Animated.View
        style={[
          S.mascotCard,
          correct ? S.mascotCardCorrect : S.mascotCardWrong,
          !isMotionReduced && correct && { transform: [{ translateY: mascotBounce }] },
          !isMotionReduced && !correct && { transform: [{ rotate: "-3deg" }] },
        ]}
      >
        <Image source={sprigImage} style={S.feedbackMascot} resizeMode="contain" />
        {correct ? (
          <Animated.View
            style={[
              S.sproutLeafBadge,
              !isMotionReduced && {
                transform: [
                  {
                    scale: leafAnim.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [0, 1.25, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="leaf" size={11} color={C.successText} />
          </Animated.View>
        ) : (
          <View style={S.calmMascotBadge}>
            <Ionicons name="water-outline" size={10} color={C.attentionText} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const S = StyleSheet.create({
  mascotSection: { alignItems: "center", justifyContent: "center" },
  mascotCard: { width: 40, height: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", position: "relative", borderWidth: 1 },
  mascotCardCorrect: { backgroundColor: "#DFEEDB", borderColor: C.successBorder },
  mascotCardWrong: { backgroundColor: "#FBE6E2", borderColor: C.attentionBorder },
  feedbackMascot: { width: 34, height: 38 },
  sproutLeafBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.successSoft,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.successBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  calmMascotBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: C.attentionSoft,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.attentionBorder,
    alignItems: "center",
    justifyContent: "center",
  },
});
