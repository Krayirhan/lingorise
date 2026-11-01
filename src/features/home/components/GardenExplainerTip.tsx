import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { homeStyles as S } from "../home.styles";

export function GardenExplainerTip({ copy, onDismiss }: { copy: Copy; onDismiss?: () => void }) {
  return (
    <View style={S.gardenTip}>
      <Pressable accessibilityRole="button"
        accessibilityLabel={copy.home?.gardenExplainerShort || "Bahçe ilerlemesi hakkında bilgi"}
        style={S.gardenTipButton}
        onPress={() => Alert.alert(copy.home.gardenStageLabel, copy.home.gardenExplainerTip)}>
        <Ionicons name="information-circle-outline" size={17} color={C.primary} />
        <Text style={S.gardenTipText}>{copy.home.gardenExplainerShort}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
        hitSlop={8} onPress={onDismiss}>
        <Ionicons name="close" size={17} color={C.muted} />
      </Pressable>
    </View>
  );
}

