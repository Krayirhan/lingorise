import { BackHandler, Platform } from "react-native";
import { useEffect } from "react";
import { Copy } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import {
  GoalOnboardingPage,
  LevelOnboardingPage,
  ReadyOnboardingPage,
  WelcomeOnboardingPage,
} from "./OnboardingStepScreens";

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
  copy, step, level, dailyGoalMinutes = 5, notificationsEnabled = true,
  onStep, onLevel, onGoalSelect, onNotificationToggle, onComplete, onOpenAuth, onBack,
}: Props) {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 0) onStep(step - 1);
      else onBack();
      return true;
    });
    return () => subscription.remove();
  }, [step, onStep, onBack]);

  const backLabel = copy.auth?.backBtn || "Geri";
  if (step === 0) return <WelcomeOnboardingPage copy={copy} onStep={onStep} />;
  if (step === 1) return <GoalOnboardingPage copy={copy} goal={dailyGoalMinutes} onStep={onStep}
    onGoalSelect={onGoalSelect} backLabel={backLabel} />;
  if (step === 2) return <LevelOnboardingPage copy={copy} level={level} onStep={onStep}
    onLevel={onLevel} backLabel={backLabel} />;
  return <ReadyOnboardingPage copy={copy} notificationsEnabled={notificationsEnabled} onStep={onStep}
    onNotificationToggle={onNotificationToggle} onComplete={onComplete} onOpenAuth={onOpenAuth} backLabel={backLabel} />;
}
