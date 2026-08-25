import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { S } from "../screens/AuthScreen.styles";

interface AuthTextFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  hasError: boolean;
  hintText?: string;
  labelAccessory?: React.ReactNode;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  keyboardType?: "default" | "email-address";
  rightAccessory?: React.ReactNode;
}

/**
 * The icon + labeled input + inline error-tint wrapper used by every
 * AuthScreen field (name/email/password) — extracted so the three fields no
 * longer each hand-roll the same markup (roadmap 18-srs-flow-hardening.md
 * ARCH-003).
 */
export function AuthTextField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  hasError,
  hintText,
  labelAccessory,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  rightAccessory,
}: AuthTextFieldProps) {
  return (
    <View style={S.fieldGroup}>
      <View style={S.labelRow}>
        <Text style={S.label}>{label}</Text>
        {labelAccessory}
      </View>
      <View style={[S.inputWrap, hasError && S.inputWrapError]}>
        <Ionicons name={icon} size={18} color={hasError ? C.attention : C.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.faint}
          style={S.input}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={accessibilityLabel}
        />
        {rightAccessory}
      </View>
      {hintText && <Text style={S.hintText}>{hintText}</Text>}
    </View>
  );
}

/** The small eye-icon toggle rendered inside the password field's input wrapper. */
export function PasswordVisibilityToggle({
  visible,
  onToggle,
  showLabel,
  hideLabel,
}: {
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? hideLabel : showLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={S.eyeBtn}
      onPress={onToggle}
    >
      <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={19} color={C.muted} />
    </Pressable>
  );
}
