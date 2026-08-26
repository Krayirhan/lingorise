import { useEffect } from "react";
import { BackHandler, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { Copy } from "../i18n/en";
import { C, spacing } from "../theme/colors";
import { LevelCode } from "../types/content";
import { WelcomeStep } from "../features/onboarding/components/WelcomeStep";
import { GoalStep } from "../features/onboarding/components/GoalStep";
import { LevelStep } from "../features/onboarding/components/LevelStep";
import { ReadyStep } from "../features/onboarding/components/ReadyStep";

interface Props {
  copy: Copy;
  step: number;
  level: LevelCode | null;
  dailyGoalMinutes?: 2 | 5 | 10 | 15;
  notificationsEnabled?: boolean;
  onStep: (step: number) => void;
  onLevel: (level: LevelCode) => void;
  onGoalSelect?: (minutes: 2 | 5 | 10 | 15) => void;
  onNotificationToggle?: (enabled: boolean) => void;
  onComplete: () => void;
  onOpenAuth?: () => void;
  onBack: () => void;
}

export function OnboardingScreen({
  copy,
  step,
  level,
  dailyGoalMinutes = 5,
  notificationsEnabled = true,
  onStep,
  onLevel,
  onGoalSelect,
  onNotificationToggle,
  onComplete,
  onOpenAuth,
  onBack,
}: Props) {
  const TOTAL_STEPS = 4;

  useEffect(() => {
    if (Platform.OS === "android") {
      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (step > 0) {
          onStep(step - 1);
          return true;
        }
        onBack();
        return true;
      });
      return () => handler.remove();
    }
  }, [step, onStep, onBack]);

  const stepText = (current: number) => `${current} / ${TOTAL_STEPS}`;
  const stepA11y = (current: number) => `${copy.onboarding?.stepLabel || "Adım"} ${current} / ${TOTAL_STEPS}`;
  const backLabel = copy.auth?.backBtn || "Geri";

  if (step === 0) {
    return (
      <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <View style={S.page}>
          <View style={S.header}>
            <Brand />
            <Text style={S.step} accessibilityLabel={stepA11y(1)}>{stepText(1)}</Text>
          </View>
          <WelcomeStep
            copy={copy}
            onNext={() => onStep(1)}
            onSkip={() => onStep(TOTAL_STEPS - 1)}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <View style={S.page}>
          <View style={S.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onStep(0)}
            >
              <Text style={S.back}>‹ {backLabel}</Text>
            </Pressable>
            <Text style={S.step} accessibilityLabel={stepA11y(2)}>{stepText(2)}</Text>
          </View>
          <GoalStep
            copy={copy}
            selectedGoal={dailyGoalMinutes}
            onSelectGoal={(mins) => {
              if (onGoalSelect) onGoalSelect(mins as any);
            }}
            onNext={() => onStep(2)}
            onSkip={() => onStep(TOTAL_STEPS - 1)}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          <View style={S.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onStep(1)}
            >
              <Text style={S.back}>‹ {backLabel}</Text>
            </Pressable>
            <Text style={S.step} accessibilityLabel={stepA11y(3)}>{stepText(3)}</Text>
          </View>

          <LevelStep
            copy={copy}
            level={level}
            onLevel={onLevel}
            onComplete={() => onStep(3)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <View style={S.page}>
        <View style={S.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onStep(2)}
          >
            <Text style={S.back}>‹ {backLabel}</Text>
          </Pressable>
          <Text style={S.step} accessibilityLabel={stepA11y(4)}>{stepText(4)}</Text>
        </View>

        <ReadyStep
          copy={copy}
          notificationsEnabled={notificationsEnabled}
          onStartGuest={(notif) => {
            if (onNotificationToggle) onNotificationToggle(notif);
            onComplete();
          }}
          onCreateAccount={(notif) => {
            if (onNotificationToggle) onNotificationToggle(notif);
            onComplete();
            if (onOpenAuth) onOpenAuth();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.canvas },
  page: { flex: 1, padding: spacing.xl, paddingBottom: 24 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xl, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm, marginBottom: 10 },
  step: { color: C.primary, fontWeight: "800", fontSize: 13 },
  back: { color: C.ink, fontSize: 16, fontWeight: "700" },
});
