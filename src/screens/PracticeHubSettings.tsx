import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { S } from "./PracticeHubScreen.styles";
import { C } from "../theme/colors";
import { Copy } from "../i18n/en";
import { formatTemplate } from "../utils/formatters";

export type SessionSize = 5 | 10 | 20 | 30;
const SESSION_SIZES: SessionSize[] = [5, 10, 20, 30];

interface Props {
  copy: Copy;
  practiceSessionSize: SessionSize;
  onPracticeSessionSizeChange: (size: SessionSize) => void;
  /** True for Turkish → English, false for English → Turkish. */
  reverseMode: boolean;
  onReverseModeChange: (reverse: boolean) => void;
}

/**
 * Session length and direction. Secondary to the hero card above it (CD-002:
 * config used to lead the screen, ahead of the motivating hero).
 */
export function PracticeHubSettings({ copy, practiceSessionSize, onPracticeSessionSizeChange, reverseMode, onReverseModeChange }: Props) {
  return (
    <View style={S.settingsCard}>
      <View style={S.settingRow}>
        <View style={S.settingHead}>
          <View style={[S.settingIcon, { backgroundColor: C.attentionSoft }]}>
            <Ionicons name="time-outline" size={22} color={C.primary} />
          </View>
          <View style={S.settingCopy}>
            <Text style={S.settingTitle}>{copy.game.hubSessionLength}</Text>
            <Text style={S.settingHint}>{formatTemplate(copy.game.hubSessionLengthHint, { count: practiceSessionSize })}</Text>
          </View>
        </View>
        <View style={S.segment}>
          {SESSION_SIZES.map((size) => (
            <Pressable
              key={size}
              accessibilityRole="button"
              accessibilityLabel={formatTemplate(copy.game.hubSessionSizeOption, { count: size })}
              accessibilityState={{ selected: practiceSessionSize === size }}
              onPress={() => onPracticeSessionSizeChange(size)}
              style={[S.segmentItem, practiceSessionSize === size && S.segmentItemActive]}
            >
              <Text style={[S.segmentText, practiceSessionSize === size && S.segmentTextActive]}>{size}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[S.settingRow, S.settingRowDivider]}>
        <View style={S.settingHead}>
          <View style={[S.settingIcon, { backgroundColor: C.successSoft }]}>
            <Ionicons name="swap-horizontal" size={22} color={C.primary} />
          </View>
          <View style={S.settingCopy}>
            <Text style={S.settingTitle}>{copy.game.hubDirection}</Text>
            <Text style={S.settingHint}>{copy.game.hubDirectionHint}</Text>
          </View>
        </View>
        <View style={S.segment}>
          {[false, true].map((reverse) => (
            <Pressable
              key={String(reverse)}
              accessibilityRole="button"
              accessibilityState={{ selected: reverseMode === reverse }}
              style={[S.segmentItem, reverseMode === reverse && S.segmentItemActive]}
              onPress={() => onReverseModeChange(reverse)}
            >
              <Text style={[S.segmentText, reverseMode === reverse && S.segmentTextActive]}>
                {reverse ? copy.game.hubModePickWord : copy.game.hubModePickMeaning}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
