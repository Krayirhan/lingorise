import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { S } from "../screens/AuthScreen.styles";

/** The post-submit success / reset-email-sent state, extracted out of AuthScreen's form-rendering responsibility. */
export function AuthSuccessPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={S.successBox} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={32} color={C.success} />
      <Text style={S.successTitle}>{title}</Text>
      <Text style={S.successSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function AuthResetSentPanel({
  title,
  subtitle,
  backToLoginLabel,
  onBackToLogin,
}: {
  title: string;
  subtitle: string;
  backToLoginLabel: string;
  onBackToLogin: () => void;
}) {
  return (
    <View style={S.successBox} accessibilityLiveRegion="polite">
      <Ionicons name="mail" size={32} color={C.primary} />
      <Text style={S.successTitle}>{title}</Text>
      <Text style={S.successSubtitle}>{subtitle}</Text>
      <Pressable style={S.backToLoginBtn} onPress={onBackToLogin}>
        <Text style={S.backToLoginTxt}>{backToLoginLabel}</Text>
      </Pressable>
    </View>
  );
}
