import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { C, radius, spacing } from "../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: Props) {
  const isDisabled = disabled || loading;
  const isSec = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isSec && styles.secButton,
        disabled && !loading && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isSec ? C.primary : C.white} />
      ) : (
        <Text style={[styles.label, isSec && styles.secLabel, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: C.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secButton: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.line,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    backgroundColor: C.disabledBg,
    borderWidth: 1,
    borderColor: C.disabledBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secLabel: {
    color: C.ink,
  },
  labelDisabled: {
    color: C.disabledText,
  },
});
