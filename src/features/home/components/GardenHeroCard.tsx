import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { GardenProgress } from "../../../types/user";
import { LevelCode } from "../../../types/content";
import { PracticeState } from "../home.types";

const sprig = require("../../../../assets/sprig-mascot-idle-transparent.png");

interface Props {
  copy: Copy;
  level: LevelCode;
  masteredWords: number;
  stageName: string;
  gardenProgress: GardenProgress;
  unitNumber?: number;
  unitCount?: number;
  unitLearned?: number;
  unitTotal?: number;
  practiceState?: PracticeState;
  practiceCompletedCount?: number;
  practiceTargetCount?: number;
  dailyXpEarned?: number;
  dailyXpTarget?: number;
  isDailyCompleted?: boolean;
  onPress: () => void;
  onViewProgress?: () => void;
  onPracticeAgain?: () => void;
  showGardenExplainer?: boolean;
  onDismissGardenExplainer?: () => void;
}

export function GardenHeroCard({
  copy,
  level,
  masteredWords,
  stageName,
  gardenProgress,
  unitNumber = 1,
  unitCount = 1,
  unitLearned = 0,
  unitTotal = 0,
  practiceState = "not_started",
  practiceCompletedCount = 0,
  practiceTargetCount = 20,
  dailyXpEarned = 0,
  dailyXpTarget = 0,
  isDailyCompleted = false,
  onPress,
  onViewProgress,
  onPracticeAgain,
  showGardenExplainer = false,
  onDismissGardenExplainer,
}: Props) {
  // Determine resolved state
  const isCompleted = practiceState === "completed" || isDailyCompleted;
  const isInProgress = practiceState === "in_progress" && !isCompleted;

  // Dynamic progress bar color based on percentage
  const stagePercent = gardenProgress.stageProgressPercent;
  // Growth is growth. Early progress is not a warning, so the bar keeps one
  // positive colour instead of shading from amber to green.
  const progressFillColor = "#7CC47F";

  // Mascot speech text
  const mascotPrompt = isCompleted
    ? copy.home?.mascotPromptDone || "Bugün harika ilerledin! 👏"
    : isInProgress
      ? `${practiceCompletedCount}/${practiceTargetCount} Harika gidiyorsun! 🌱`
      : copy.home?.mascotPromptReady || "Hazırsan başlayalım! 🌱";

  return (
    <View style={S.card}>
      {/* Top Header & Mascot */}
      <View style={S.top}>
        <View style={S.copy}>
          {isCompleted ? (
            <View style={S.completedTag}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={S.completedTagTxt}>
                {(copy.home?.heroCompletedEarned || "+{xp} XP kazandın 🎉").replace(
                  "{xp}",
                  String(dailyXpEarned)
                )}
              </Text>
            </View>
          ) : (
            <View style={S.chip}>
              <Text style={S.chipText}>
                {level} ·{" "}
                {(copy.home?.unitLabel || "Bölüm {current}/{total}")
                  .replace("{current}", String(unitNumber))
                  .replace("{total}", String(unitCount))}
              </Text>
            </View>
          )}

          <Text style={S.title}>
            {isCompleted
              ? copy.home?.heroCompletedTitle || "Bugünün pratiği tamamlandı"
              : copy.home?.heroNotStarted || "Günün Pratiği"}
          </Text>

          <Text style={S.meta}>
            {isCompleted
              ? copy.home?.heroCompletedSubtitle || `${practiceTargetCount} kelimenin tamamını bitirdin.`
              : isInProgress
                ? `${practiceCompletedCount} / ${practiceTargetCount} kelime tamamlandı`
                : `Bölümde ${unitLearned}/${unitTotal} kelime · +${dailyXpTarget} XP`}
          </Text>
        </View>

        <View style={S.mascotWrap}>
          <View style={S.speechBubble}>
            <Text
              style={S.speechText}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              // adjustsFontSizeToFit only shrinks on LINE overflow, not on a
              // single word breaking mid-character — a broken word can still
              // fit inside numberOfLines without ever triggering the shrink.
              // Capping how far this small fixed-width bubble grows with the
              // system font size (roadmap 18-srs-flow-hardening.md ACC-001,
              // dynamic-type pass) keeps "Hazırsan başlayalım!" whole at large
              // accessibility text sizes; it still scales, just less than 1:1
              // — the same information is also in the card's own headline.
              maxFontSizeMultiplier={1.3}
            >
              {mascotPrompt}
            </Text>
          </View>
          <Image source={sprig} style={S.mascot} resizeMode="contain" />
        </View>
      </View>

      {/* Dynamic XP Progress Bar - ONLY shown when NOT completed */}
      {!isCompleted && (
        <View style={S.progressSection}>
          {/* This is a DIFFERENT tracker than "Bölümde X/Y" above — that one
              is this level's current unit; this one is every word learned
              across ALL levels, permanently. Both use the same 30-word
              denominator on purpose (roadmap 18-srs-flow-hardening.md) so
              they read as related, not as two conflicting counters — but an
              explicit label is still what actually tells them apart. */}
          <Text style={S.stageLabel}>{copy.home?.gardenStageLabel || "BAHÇE EVRESİ"}</Text>
          <View style={S.growthTrack}>
            <View
              style={[
                S.fill,
                {
                  width: `${Math.min(100, Math.max(0, stagePercent))}%`,
                  backgroundColor: progressFillColor,
                },
              ]}
            />
          </View>
          <View style={S.progressMetrics}>
            <Text style={S.metricsLeft}>
              {(copy.home?.gardenMasteredMetric || "{mastered} / {target} kelime")
                .replace("{mastered}", String(Math.max(0, masteredWords - gardenProgress.stageStartWords)))
                .replace(
                  "{target}",
                  String(gardenProgress.nextStageThresholdWords - gardenProgress.stageStartWords)
                )}
            </Text>
            <Text style={S.metricsRight}>{stageName}</Text>
          </View>

          {showGardenExplainer && (
            <View style={S.explainerRow}>
              <Ionicons name="information-circle-outline" size={14} color="#C5B2BD" />
              <Text style={S.explainerTxt}>
                {copy.home?.gardenExplainerTip ||
                  "Bahçen HER seviyede öğrendiğin kelimelerle büyür — bir seviyeyi bitirmek onu tek başına ilerletmez."}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={onDismissGardenExplainer}
              >
                <Ionicons name="close" size={14} color="#C5B2BD" />
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* CTA Action Buttons */}
      {isCompleted ? (
        <View style={S.completedActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.home?.heroCompletedCta || "Bugünkü özeti gör"}
            style={({ pressed }) => [S.ctaBtn, S.ctaBtnCompleted, pressed && S.pressed]}
            onPress={onViewProgress || onPress}
          >
            <Text style={S.ctaBtnCompletedTxt}>
              {copy.home?.heroCompletedCta || "Bugünkü özeti gör →"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.home?.heroPracticeAgain || "Tekrar pratik yap"}
            accessibilityHint="Bugünün pratiğini baştan tekrar başlatır"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [S.againBtn, pressed && S.pressed]}
            onPress={onPracticeAgain || onPress}
          >
            <Ionicons name="refresh" size={13} color="#E5D7E0" />
            <Text style={S.againBtnTxt}>
              {copy.home?.heroPracticeAgain || "Tekrar pratik yap"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isInProgress ? "Pratiğe devam et" : "Pratiğe başla"}
          style={({ pressed }) => [S.ctaBtn, pressed && S.pressed]}
          onPress={onPress}
        >
          <Text style={S.ctaBtnTxt}>
            {isInProgress
              ? copy.home?.continuePractice || "Devam et →"
              : copy.home?.start || "Bugün başla →"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: "#482639",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#2A1420",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
    gap: 12,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 70,
  },
  copy: {
    flex: 1,
    paddingRight: 8,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  completedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(76, 175, 80, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.35)",
  },
  completedTagTxt: {
    color: "#81C784",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  meta: {
    color: "#E5D7E0",
    marginTop: 3,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 19,
  },
  mascotWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 16,
    minWidth: 90,
  },
  speechBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    position: "absolute",
    top: -14,
    right: 0,
    minWidth: 95,
    maxWidth: 155,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  speechText: {
    color: C.primary,
    fontSize: 9.5,
    fontWeight: "800",
    lineHeight: 12.5,
    textAlign: "center",
  },
  mascot: {
    width: 72,
    height: 78,
    marginTop: 4,
    transform: [{ translateX: -6 }, { translateY: 6 }],
  },
  progressSection: {
    gap: 5,
  },
  stageLabel: {
    color: "#C5B2BD",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  growthTrack: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  progressMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricsLeft: {
    color: "#E5D7E0",
    fontSize: 12,
    fontWeight: "700",
  },
  metricsRight: {
    color: "#C5B2BD",
    fontSize: 11,
    fontWeight: "600",
  },
  explainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  explainerTxt: {
    flex: 1,
    color: "#C5B2BD",
    fontSize: 10.5,
    lineHeight: 14,
  },
  ctaBtn: {
    backgroundColor: C.reward,
    height: 48,
    minHeight: 48,
    borderRadius: radius.button || 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaBtnTxt: {
    color: C.ink,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  completedActions: {
    gap: 8,
    alignItems: "center",
  },
  ctaBtnCompleted: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowOpacity: 0,
    elevation: 0,
    width: "100%",
  },
  ctaBtnCompletedTxt: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  againBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  againBtnTxt: {
    color: "#E5D7E0",
    fontSize: 12,
    fontWeight: "600",
  },
});
