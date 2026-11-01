import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { WritingCheck, WritingTask } from "../../../domain/learning/writing";
import { Copy, Locale } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { S } from "../practice.styles";

interface Props {
  copy: Copy; locale: Locale; task: WritingTask; status: "offered" | "open";
  response: string; result: WritingCheck | null; saving: boolean; saveError: boolean;
  onStart: () => void; onSkip: () => void; onChange: (value: string) => void; onSubmit: () => void;
}

export function ProductionForm({ copy, locale, task, status, response, result, saving, saveError, onStart, onSkip, onChange, onSubmit }: Props) {
  const checks = result ? [
    { ok: result.target === "found", label: result.target === "found" ? copy.game.writingTargetFound : copy.game.writingTargetUnknown },
    ...(result.phrase ? [{ ok: result.phrase === "found", label: result.phrase === "found" ? copy.game.writingPhraseFound : copy.game.writingPhraseUnknown }] : []),
    { ok: result.enoughWords, label: result.enoughWords ? copy.game.writingLengthDone : copy.game.writingLengthMissing.replace("{count}", String(task.minWords)) },
    { ok: result.punctuation, label: result.punctuation ? copy.game.writingPunctuationDone : copy.game.writingPunctuationMissing },
  ] : [];
  return (
    <View style={S.productionBox}>
      <View style={S.productionHeading}>
        <View style={S.productionIcon}><Ionicons name="create-outline" size={19} color={C.successText} /></View>
        <Text accessibilityRole="header" style={S.productionTitle}>{copy.game.writingOfferTitle}</Text>
      </View>
      {status === "offered" ? (
        <>
          <Text style={S.productionPrompt}>{copy.game.writingOfferBody}</Text>
          <PrimaryButton label={copy.game.writingStart} onPress={onStart} />
        </>
      ) : (
        <>
          <Text style={S.productionPrompt}>{task.instruction[locale]} {copy.game.productionInstruction.replace("{word}", task.target).replace("{count}", String(task.minWords))}</Text>
          {task.requiredPhrase?.length ? <Text style={S.productionPrompt}>{copy.game.productionPhrase.replace("{phrase}", task.requiredPhrase[0])}</Text> : null}
          <Text style={S.productionNote}>{copy.game.writingExample}: {task.example}</Text>
          <TextInput accessibilityLabel={copy.game.productionInputLabel} value={response} onChangeText={onChange}
            multiline maxLength={1000} placeholder={copy.game.productionPlaceholder} placeholderTextColor={C.muted} style={S.productionInput} />
          <PrimaryButton label={copy.game.productionCheck} disabled={!response.trim()} loading={saving} onPress={onSubmit} />
          {saveError && <Text accessibilityLiveRegion="polite" style={S.productionError}>{copy.game.writingSaveError}</Text>}
          {result && <View style={S.productionFeedback} accessibilityLiveRegion="polite">
            <Text style={S.productionScore}>{copy.game.productionChecks}</Text>
            {checks.map((check) => <View key={check.label} style={S.productionCheckRow}>
              <Ionicons name={check.ok ? "checkmark-circle" : "information-circle-outline"} size={17} color={check.ok ? C.successText : C.attentionText} />
              <Text style={S.productionFeedbackText}>{check.label}</Text>
            </View>)}
          </View>}
          <Text style={S.productionNote}>{copy.game.productionCheckNote}</Text>
          <Text style={S.productionNote}>{copy.game.writingLocalNote}</Text>
        </>
      )}
      <Pressable accessibilityRole="button" onPress={onSkip} style={S.writingSkip}>
        <Text style={S.writingSkipText}>{copy.game.writingSkip}</Text>
      </Pressable>
    </View>
  );
}
