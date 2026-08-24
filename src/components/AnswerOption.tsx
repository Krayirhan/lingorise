import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";

type Props = {
  label: string;
  selected: boolean;
  submitted?: boolean;
  isCorrectOption?: boolean;
  disabled?: boolean;
  reduceMotion?: boolean;
  selectedSuffix?: string;
  correctSuffix?: string;
  wrongSuffix?: string;
  revealedSuffix?: string;
  accessibilityHint?: string;
  onPress: () => void;
};

export function AnswerOption({
  label,
  selected,
  submitted = false,
  isCorrectOption = false,
  disabled = false,
  reduceMotion = false,
  selectedSuffix = ", seçildi",
  correctSuffix = ", doğru cevap",
  wrongSuffix = ", yanlış seçim",
  revealedSuffix = ", doğru karşılık bu seçenekti",
  accessibilityHint = "Cevap seçeneği",
  onPress,
}: Props) {
  const isCorrect = submitted && selected && isCorrectOption;
  const isWrong = submitted && selected && !isCorrectOption;
  const isRevealed = submitted && !selected && isCorrectOption;
  const isMuted = submitted && !selected && !isCorrectOption;
  const selectScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) { selectScale.setValue(1); return; }
    if (selected && !submitted) {
      selectScale.setValue(0.97);
      Animated.spring(selectScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    }
  }, [selected, submitted, reduceMotion, selectScale]);

  const a11yLabel = !submitted ? `${label}${selected ? selectedSuffix : ""}`
    : isCorrect ? `${label}${correctSuffix}` : isWrong ? `${label}${wrongSuffix}`
    : isRevealed ? `${label}${revealedSuffix}` : label;

  return (
    <Animated.View style={!reduceMotion ? { transform: [{ scale: selectScale }] } : undefined}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={a11yLabel}
        accessibilityHint={accessibilityHint}
        disabled={disabled}
        style={({ pressed }) => [
          S.opt,
          selected && !submitted && S.optSel,
          isCorrect && S.optCor,
          isWrong && S.optWro,
          isRevealed && S.optRev,
          isMuted && S.optMut,
          pressed && !disabled && S.optPre,
        ]}
        onPress={onPress}
      >
        <Text style={[S.lbl, selected && !submitted && S.lblSel, (isCorrect || isRevealed) && S.lblCor, isWrong && S.lblWro, isMuted && S.lblMut]}>
          {label}
        </Text>
        <View style={S.ind}>
          {submitted ? (
            isCorrect || isRevealed ? <Ionicons name="checkmark-circle" size={22} color={C.successText} />
            : isWrong ? <Ionicons name="close-circle" size={22} color={C.attentionText} />
            : <View style={S.rad} />
          ) : selected ? (
            <View style={S.radSel}><View style={S.dot} /></View>
          ) : (
            <View style={S.rad} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const S = StyleSheet.create({
  opt: { minHeight: 54, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  optPre: { backgroundColor: C.primarySubtle, transform: [{ scale: 0.99 }] },
  optSel: { backgroundColor: C.primarySubtle, borderColor: C.primary, borderWidth: 2 },
  optCor: { backgroundColor: C.successSoft, borderColor: C.success, borderWidth: 2 },
  optWro: { backgroundColor: C.attentionSoft, borderColor: C.attention, borderWidth: 2 },
  optRev: { backgroundColor: C.successSoft, borderColor: C.success, borderWidth: 1.5, borderStyle: "dashed" },
  optMut: { opacity: 0.45, backgroundColor: C.surface, borderColor: C.line },
  lbl: { flex: 1, color: C.ink, fontSize: 16, lineHeight: 22, fontWeight: "700" },
  lblSel: { color: C.primary, fontWeight: "800" },
  lblCor: { color: C.successText, fontWeight: "800" },
  lblWro: { color: C.attentionText, fontWeight: "800" },
  lblMut: { color: C.muted },
  ind: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  rad: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface },
  radSel: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.primary, backgroundColor: C.primarySubtle, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
});
