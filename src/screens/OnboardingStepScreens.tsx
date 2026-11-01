import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { Copy } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import { S } from "./OnboardingScreen.styles";
import { WelcomeStep } from "../features/onboarding/components/WelcomeStep";
import { GoalStep } from "../features/onboarding/components/GoalStep";
import { LevelStep } from "../features/onboarding/components/LevelStep";
import { ReadyStep } from "../features/onboarding/components/ReadyStep";

function StepCounter({ copy, step }: { copy: Copy; step: number }) {
  return <Text style={S.step} accessibilityLabel={`${copy.onboarding?.stepLabel || "Adım"} ${step} / 4`}>{step} / 4</Text>;
}

function BackButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={onPress}>
    <Text style={S.back}>‹ {label}</Text>
  </Pressable>;
}

export function WelcomeOnboardingPage({ copy, onStep }: { copy: Copy; onStep: (step: number) => void }) {
  return <SafeAreaView style={S.safe} edges={["top", "bottom"]}><StatusBar barStyle="dark-content" />
    <View style={S.page}><View style={S.header}><Brand /><StepCounter copy={copy} step={1} /></View>
      <WelcomeStep copy={copy} onNext={() => onStep(1)} onSkip={() => onStep(3)} />
    </View>
  </SafeAreaView>;
}

export function GoalOnboardingPage({ copy, goal, onStep, onGoalSelect, backLabel }: {
  copy: Copy; goal: 2 | 5 | 10 | 15; onStep: (step: number) => void;
  onGoalSelect?: (minutes: 2 | 5 | 10 | 15) => void; backLabel: string;
}) {
  return <SafeAreaView style={S.safe} edges={["top", "bottom"]}><StatusBar barStyle="dark-content" />
    <View style={S.page}><View style={S.header}><BackButton label={backLabel} onPress={() => onStep(0)} /><StepCounter copy={copy} step={2} /></View>
      <GoalStep copy={copy} selectedGoal={goal} onSelectGoal={(minutes) => onGoalSelect?.(minutes as 2 | 5 | 10 | 15)}
        onNext={() => onStep(2)} onSkip={() => onStep(3)} />
    </View>
  </SafeAreaView>;
}

export function LevelOnboardingPage({ copy, level, onStep, onLevel, backLabel }: {
  copy: Copy; level: LevelCode | null; onStep: (step: number) => void;
  onLevel: (level: LevelCode) => void; backLabel: string;
}) {
  return <SafeAreaView style={S.safe} edges={["top", "bottom"]}><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
      <View style={S.header}><BackButton label={backLabel} onPress={() => onStep(1)} /><StepCounter copy={copy} step={3} /></View>
      <LevelStep copy={copy} level={level} onLevel={onLevel} onComplete={() => onStep(3)} />
    </ScrollView>
  </SafeAreaView>;
}

export function ReadyOnboardingPage({ copy, notificationsEnabled, onStep, onNotificationToggle, onComplete, onOpenAuth, backLabel }: {
  copy: Copy; notificationsEnabled: boolean; onStep: (step: number) => void;
  onNotificationToggle?: (enabled: boolean) => void; onComplete: () => void;
  onOpenAuth?: () => void; backLabel: string;
}) {
  return <SafeAreaView style={S.safe} edges={["top", "bottom"]}><StatusBar barStyle="dark-content" />
    <View style={S.page}><View style={S.header}><BackButton label={backLabel} onPress={() => onStep(2)} /><StepCounter copy={copy} step={4} /></View>
      <ReadyStep copy={copy} notificationsEnabled={notificationsEnabled}
        onStartGuest={(enabled) => { onNotificationToggle?.(enabled); onComplete(); }}
        onCreateAccount={(enabled) => { onNotificationToggle?.(enabled); onComplete(); onOpenAuth?.(); }} />
    </View>
  </SafeAreaView>;
}
