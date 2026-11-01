import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../domain/models/content";
import { PracticeState } from "../home.types";
import { createGardenHeroModel } from "../gardenHeroModel";
import { SeedRing } from "./SeedRing";
import { fonts } from "../../../theme/typography";

const removeTrailingArrow = (label: string) => label.replace(/\s*→\s*$/, "");

interface Props {
  copy: Copy;
  level: LevelCode;
  streak?: number;
  unitNumber?: number;
  unitCount?: number;
  practiceState?: PracticeState;
  practiceCompletedCount?: number;
  practiceTargetCount?: number;
  dailyXpEarned?: number;
  dailyXpTarget?: number;
  isDailyCompleted?: boolean;
  isLevelFullyLearned?: boolean;
  onPress: () => void;
  onViewProgress?: () => void;
  onPracticeAgain?: () => void;
  onGoToPracticeHub?: () => void;
}

export function GardenHeroCard({
  copy,
  level,
  unitNumber = 1,
  unitCount = 1,
  practiceState = "not_started",
  practiceCompletedCount = 0,
  practiceTargetCount = 20,
  dailyXpEarned = 0,
  dailyXpTarget = 0,
  isDailyCompleted = false,
  isLevelFullyLearned = false,
  onPress,
  onViewProgress,
  onPracticeAgain,
  onGoToPracticeHub,
}: Props) {
  const { isCompleted, isInProgress, isLevelDone, showPracticeAgain, onCtaPress } = createGardenHeroModel({
    practiceState, isDailyCompleted, isLevelFullyLearned, onPress, onViewProgress, onPracticeAgain, onGoToPracticeHub,
  });
  const unitLabel = (copy.home.unitLabel)
    .replace("{current}", String(unitNumber))
    .replace("{total}", String(unitCount));

  const title = isLevelDone
    ? copy.home.heroLevelDoneTitle
    : isCompleted
      ? copy.home.heroCompletedTitle
      : copy.home.heroNotStarted;
  const countLabel = `${practiceTargetCount} ${copy.home.wordCountSuffix}`;
  const reward = isCompleted ? dailyXpEarned : dailyXpTarget;
  const completedCount = isCompleted ? practiceTargetCount : Math.min(practiceCompletedCount, practiceTargetCount);

  const ctaLabel = isLevelDone
    ? copy.home.heroGoToPracticeHubCta
    : isCompleted
      ? copy.home.heroCompletedCta
      : isInProgress
        ? copy.home.continuePractice
        : copy.home.start;
  return (
    <View style={S.card}>
      {!isLevelDone && (
        <>
          <SeedRing completed={completedCount} target={practiceTargetCount} />
          <View style={S.divider} />
        </>
      )}

      <View style={S.body}>
        <Text style={S.eyebrow}>
          {isLevelDone
            ? copy.home.promotionEyebrow
            : isCompleted
              ? (copy.home.heroCompletedEarned).replace("{xp}", String(dailyXpEarned))
              : `${level} · ${unitLabel.toUpperCase()}`}
        </Text>
        <Text style={S.title}>{title}</Text>
        <Text style={S.subtitle}>
          {isLevelDone
            ? copy.home.heroLevelDoneSubtitle
            : `${countLabel} · +${reward} XP · 5 dk`}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={removeTrailingArrow(ctaLabel)}
          style={({ pressed }) => [S.cta, pressed && S.pressed]}
          onPress={onCtaPress}
        >
          <Ionicons name={isCompleted || isLevelDone ? "arrow-forward" : "play"} size={16} color={C.ink} />
          <Text numberOfLines={1} style={S.ctaText}>{removeTrailingArrow(ctaLabel)}</Text>
        </Pressable>

        {showPracticeAgain && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.home.heroPracticeAgain}
            style={S.againButton}
            onPress={onPracticeAgain || onPress}
          >
            <Ionicons name="refresh" size={14} color={C.surface} />
            <Text style={S.againText}>{copy.home.heroPracticeAgain}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.attentionStrong,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  divider: { width: 1, alignSelf: "stretch", backgroundColor: "rgba(251, 247, 240, 0.3)" },
  body: { flex: 1, minWidth: 0, gap: 3 },
  eyebrow: { color: C.surface, fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 0.8 },
  title: { color: C.surface, fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  subtitle: { color: C.surface, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  cta: {
    minHeight: 44,
    marginTop: 6,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: C.surface,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  ctaText: { color: C.ink, fontFamily: fonts.bodyBold, fontSize: 15, flexShrink: 1 },
  againButton: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 },
  againText: { color: C.surface, fontFamily: fonts.bodySemi, fontSize: 12.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
