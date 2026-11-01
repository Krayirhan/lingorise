import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { S } from "../progressScreen.styles";

/**
 * Accuracy, answers and streak. Words seen is left to the notebook below, so
 * the same number is not shown twice on the screen.
 */
export function ProgressAnalyticsCard({ copy, accuracy, answered, streak }: {
  copy: Copy; accuracy: number; answered: number; streak: number;
}) {
  const tiles: { id: string; icon: keyof typeof Ionicons.glyphMap; tint: string; value: string; label: string }[] = [
    { id: "accuracy", icon: "locate-outline", tint: C.successSoft, value: answered ? `%${accuracy}` : "—", label: copy.progress?.accuracyLabel || "Doğruluk" },
    { id: "answers", icon: "chatbubble-outline", tint: C.attentionSoft, value: String(answered), label: copy.progress?.answersLabel || "Toplam cevap" },
    { id: "streak", icon: "flame-outline", tint: C.rewardSoft, value: String(streak), label: copy.progress?.dayStreakLabel || "Gün seri" },
  ];

  return (
    <View style={S.analyticsRow}>
      {tiles.map((tile, index) => (
        <View key={tile.id} accessible accessibilityLabel={`${tile.value} ${tile.label}`} style={[S.analyticsTile, index > 0 && S.analyticsDivider]}>
          <View style={[S.analyticsIcon, { backgroundColor: tile.tint }]}>
            <Ionicons name={tile.icon} size={18} color={C.primary} />
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={S.analyticsValue}>{tile.value}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={S.analyticsLabel}>{tile.label}</Text>
          {tile.id === "accuracy" && answered > 0 && (
            <Text style={S.analyticsContext}>{copy.progress.accuracyContext.replace("{count}", String(answered))}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
