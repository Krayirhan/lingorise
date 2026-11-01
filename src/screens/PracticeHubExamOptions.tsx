import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { C } from "../theme/colors";
import { Copy } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import { S } from "./PracticeHubScreen.styles";
import { formatTemplate } from "../utils/formatters";

interface Props { copy: Copy; level: LevelCode; isExamPassed: boolean; showExamOptionCard: boolean; onStartExam: () => void }
export function PracticeHubExamOptions({ copy, level, isExamPassed, showExamOptionCard, onStartExam }: Props) {
  return (
    <>
          {/* Level completion is a single deliberate exam, not something that
              accumulates from resurfaced words over days (roadmap
              18-srs-flow-hardening.md "sınav" redesign). Hidden when the hero
              above is already the exam entry point, to avoid the same CTA twice. */}
          {showExamOptionCard && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isExamPassed
                  ? `${level} ${copy.game.examCardPassedTitle}`
                  : `${level} ${copy.game.examCardTitle}`
              }
              style={({ pressed }) => [S.optionCard, pressed && S.cardPressed]}
              onPress={onStartExam}
            >
              <View style={[S.optionIconCircle, isExamPassed ? S.iconCircleSuccess : S.iconCircleAttention]}>
                <Ionicons
                  name={isExamPassed ? "checkmark-circle" : "leaf"}
                  size={22}
                  color={C.successText}
                />
              </View>

              <View style={S.optionCopy}>
                <Text style={S.optionTitle}>
                  {formatTemplate(copy.game.examCardTitle, { level })}
                </Text>
                <Text style={S.optionSubtitle}>
                  {isExamPassed
                    ? copy.game.examCardPassedSubtitle
                    : copy.game.examCardSubtitle}
                </Text>
                <View style={S.optionLink}>
                  <Text style={S.optionLinkTxt}>
                    {isExamPassed
                      ? copy.game.examCardRetakeCta
                      : copy.game.examCardCta}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={C.attentionText} />
                </View>
              </View>

            </Pressable>
          )}
    </>
  );
}

