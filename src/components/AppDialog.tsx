import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";

interface DialogAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface DialogIcon {
  name: React.ComponentProps<typeof Ionicons>["name"];
  /** primary = plum brand tint (default). success = existing semantic success token, for confirmation/notice dialogs. */
  tone?: "primary" | "success";
}

interface Props {
  visible: boolean;
  title: string;
  message: string;
  primaryAction: DialogAction;
  secondaryAction?: DialogAction;
  onRequestClose: () => void;
  reduceMotion?: boolean;
  /** Small single-icon affordance above the title. Optional — most dialogs don't need one. */
  icon?: DialogIcon;
}

/**
 * Branded replacement for the native Alert.alert() confirm/notice dialogs
 * (CD-001). Follows the same overlay/card/Modal pattern already used by
 * LevelPromotionModal and PlaceholderTabModal — not a new visual language.
 */
export function AppDialog({
  visible,
  title,
  message,
  primaryAction,
  secondaryAction,
  onRequestClose,
  reduceMotion = false,
  icon,
}: Props) {
  if (!visible) return null;

  const isSuccessIcon = icon?.tone === "success";

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onRequestClose}
      accessibilityViewIsModal={true}
    >
      <View style={S.overlay}>
        <View
          style={S.card}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {icon && (
            <View
              style={[S.iconCircle, isSuccessIcon && S.iconCircleSuccess]}
              accessible={false}
              importantForAccessibility="no"
            >
              <Ionicons
                name={icon.name}
                size={26}
                color={isSuccessIcon ? C.success : C.primary}
              />
            </View>
          )}

          <Text style={S.title}>{title}</Text>
          <Text style={S.message}>{message}</Text>

          <View style={S.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={primaryAction.label}
              style={({ pressed }) => [S.primaryBtn, pressed && S.pressed]}
              onPress={primaryAction.onPress}
            >
              <Text style={S.primaryTxt}>{primaryAction.label}</Text>
            </Pressable>

            {secondaryAction && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={secondaryAction.label}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [S.secondaryBtn, pressed && S.pressed]}
                onPress={secondaryAction.onPress}
              >
                <Text
                  style={[
                    S.secondaryTxt,
                    secondaryAction.destructive && S.secondaryTxtDestructive,
                  ]}
                >
                  {secondaryAction.label}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(28, 27, 26, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.surface,
    borderRadius: radius.xl,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: C.line,
    elevation: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconCircleSuccess: {
    backgroundColor: C.successSoft,
  },
  title: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  message: {
    color: C.muted,
    fontSize: 14.5,
    lineHeight: 20,
  },
  actions: {
    width: "100%",
    gap: 8,
    marginTop: 14,
  },
  primaryBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: radius.button || radius.md,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: {
    color: C.white,
    fontWeight: "800",
    fontSize: 15.5,
  },
  secondaryBtn: {
    width: "100%",
    minHeight: 48,
    borderRadius: radius.button || radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  secondaryTxt: {
    color: C.ink,
    fontWeight: "700",
    fontSize: 14.5,
  },
  secondaryTxtDestructive: {
    color: C.attentionText,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
