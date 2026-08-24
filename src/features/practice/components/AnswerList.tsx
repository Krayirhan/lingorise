import { StyleSheet, View } from "react-native";
import { AnswerOption } from "../../../components/AnswerOption";
import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  options: string[];
  correctAnswer: string;
  picked: string | null;
  submitted: boolean;
  isChecking: boolean;
  isMotionReduced: boolean;
  isCompactScreen: boolean;
  onPick: (answer: string) => void;
}

export function AnswerList({
  copy,
  options,
  correctAnswer,
  picked,
  submitted,
  isChecking,
  isMotionReduced,
  isCompactScreen,
  onPick,
}: Props) {
  return (
    <View style={[S.options, isCompactScreen && S.optionsCompact]}>
      {options.map((item, index) => (
        <AnswerOption
          key={`${index}-${item}`}
          label={item}
          selected={picked === item}
          submitted={submitted}
          isCorrectOption={item === correctAnswer}
          disabled={submitted || isChecking}
          reduceMotion={isMotionReduced}
          selectedSuffix={copy.game?.optionSelectedSuffix || ", seçildi"}
          correctSuffix={copy.game?.optionCorrectSuffix || ", doğru cevap"}
          wrongSuffix={copy.game?.optionWrongSuffix || ", yanlış seçim"}
          revealedSuffix={copy.game?.optionRevealedSuffix || ", doğru karşılık bu seçenekti"}
          accessibilityHint={copy.game?.optionA11yHint || "Cevap seçeneği"}
          onPress={() => {
            if (!submitted && !isChecking) {
              onPick(item);
            }
          }}
        />
      ))}
    </View>
  );
}

const S = StyleSheet.create({
  options: { gap: 8 },
  optionsCompact: { gap: 6 },
});
