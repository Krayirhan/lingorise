import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Copy } from "../../../i18n/en";
import { C, radius } from "../../../theme/colors";

const mascot = require("../../../../assets/sprig-mascot.png");

interface Props {
  copy: Copy;
  selectedGoal?: number;
  onSelectGoal?: (minutes: number) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function GoalStep({ copy, selectedGoal = 5, onSelectGoal, onNext, onSkip }: Props) {
  const [goal, setGoal] = useState<number>(selectedGoal);

  const goals = [
    {
      minutes: 2,
      title: copy.onboarding?.goal2minTitle || "Küçük Bir Işık",
      desc: copy.onboarding?.goal2minText || "Günde 2 dakika · +20 XP",
      icon: "sunny-outline" as const,
    },
    {
      minutes: 5,
      title: copy.onboarding?.goal5minTitle || "Düzenli Bir Filiz",
      desc: copy.onboarding?.goal5minText || "Günde 5 dakika · +40 XP",
      icon: "leaf-outline" as const,
    },
    {
      minutes: 10,
      title: copy.onboarding?.goal10minTitle || "Güçlü Bir Çiçeklenme",
      desc: copy.onboarding?.goal10minText || "Günde 10 dakika · +80 XP",
      icon: "flower-outline" as const,
    },
    {
      minutes: 15,
      title: copy.onboarding?.goal15minTitle || "Ulu Bir Bahçe",
      desc: copy.onboarding?.goal15minText || "Günde 15 dakika · +120 XP",
      icon: "earth-outline" as const,
    },
  ];

  const handlePick = (mins: number) => {
    setGoal(mins);
    if (onSelectGoal) onSelectGoal(mins);
  };

  return (
    <View style={S.container}>
      <Text style={S.eyebrow}>
        {copy.onboarding?.goalsKicker || "SANA ÖZEL"}
      </Text>
      <Text style={S.hero}>
        {copy.onboarding?.dailyGoalTitle || "Günlük hedefini belirle"}
      </Text>
      <Text style={S.subtitle}>
        {copy.onboarding?.dailyGoalSubtitle || "Küçük adımlarla kalıcı alışkanlık oluştur."}
      </Text>

      <View style={S.goalList}>
        {goals.map((g) => {
          const isSelected = goal === g.minutes;
          return (
            <Pressable
              key={g.minutes}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${g.title}, ${g.desc}`}
              style={[S.goal, isSelected && S.goalSelected]}
              onPress={() => handlePick(g.minutes)}
            >
              <View style={[S.iconCircle, isSelected && S.iconCircleSelected]} accessible={false} importantForAccessibility="no">
                <Ionicons
                  name={g.icon}
                  size={24}
                  color={isSelected ? C.primary : C.muted}
                />
              </View>
              <View style={S.goalCopy}>
                <Text style={[S.goalTitle, isSelected && S.goalTitleSelected]}>
                  {g.title}
                </Text>
                <Text style={S.goalText}>{g.desc}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color={C.primary} accessible={false} importantForAccessibility="no" />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={S.bottom}>
        <PrimaryButton
          label={copy.onboarding?.chooseLevel || "Seviyemi seç"}
          onPress={onNext}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.onboarding?.skip || "Şimdilik geç"}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          onPress={onSkip}
        >
          <Text style={S.skip}>{copy.onboarding?.skip || "Şimdilik geç"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
  eyebrow: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 12,
  },
  hero: {
    color: C.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 6,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14.5,
    lineHeight: 20,
    marginTop: 6,
  },
  goalList: { gap: 10, marginTop: 18 },
  goal: {
    backgroundColor: C.surface,
    borderRadius: radius.lg || 16,
    borderWidth: 1.5,
    borderColor: C.line,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalSelected: {
    borderColor: C.primary,
    backgroundColor: C.primarySoft,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: C.surface,
  },
  goalCopy: { flex: 1 },
  goalTitle: { color: C.ink, fontSize: 15, fontWeight: "700" },
  goalTitleSelected: { color: C.primary },
  goalText: { color: C.muted, marginTop: 2, fontSize: 12.5 },
  bottom: { gap: 8, marginTop: "auto", paddingTop: 20 },
  skip: { textAlign: "center", color: C.muted, fontWeight: "700", padding: 8 },
});

