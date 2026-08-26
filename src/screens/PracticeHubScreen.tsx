import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, radius, spacing } from "../theme/colors";
import { Copy, Locale } from "../i18n/en";
import { LevelCode } from "../types/content";
import { HomeBottomNav } from "../features/home/components/HomeBottomNav";
import { HomeTab } from "../features/home/home.types";

const sprig = require("../../assets/sprig-mascot-idle-transparent.png");

interface Props {
  copy: Copy;
  locale: Locale;
  level: LevelCode;
  xp: number;
  streak: number;
  dueReviewCount: number;
  onStartDailyPractice: (reverseMode: boolean) => void;
  onStartReview: () => void;
  onTabPress: (tab: HomeTab) => void;
  practiceSessionSize: 5 | 10 | 20 | 30;
  onPracticeSessionSizeChange: (size: 5 | 10 | 20 | 30) => void;
}

export function PracticeHubScreen({
  copy,
  locale,
  level,
  xp,
  streak,
  dueReviewCount,
  onStartDailyPractice,
  onStartReview,
  practiceSessionSize,
  onPracticeSessionSizeChange,
}: Props) {
  const [reverseMode, setReverseMode] = useState(false);
  const streakText = `${streak} ${copy.game?.hubStreakSuffix || "gün seri"}`;

  // Review and new-word practice are fully separate, mandatory flows — as
  // long as anything is due, it always comes first, full stop. There is no
  // "mixed" or "tapered" state left to describe (roadmap
  // 18-srs-flow-hardening.md "pekişme" redesign, 2026-08-26).
  const hasMandatoryReview = dueReviewCount > 0;
  const estimatedMinutes = Math.max(1, Math.round(practiceSessionSize * 0.15));

  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

  const sessionSummary = hasMandatoryReview
    ? fill(copy.home?.practiceCardReviewOnly || "{reviews} kelime tekrar bekliyor", { reviews: dueReviewCount })
    : fill(copy.home?.practiceCardNewOnly || "{level} seviyesinden {fresh} yeni kelime", {
        level,
        fresh: practiceSessionSize,
      });

  return (
    <View style={S.shell}>
      <ScrollView
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={S.headerGroup}>
            <Text style={S.eyebrow}>
              {copy.game?.hubEyebrow || "PRATİK"}
            </Text>
            <Text style={S.title}>
              {copy.game?.hubTitle || "Bugün ne çalışmak istersin?"}
            </Text>
            <Text style={S.subtitle}>
              {copy.game?.hubSubtitle || "Sana en uygun pratiği seç."}
            </Text>
        </View>

        <View style={S.sessionSizeCard}>
          <Text style={S.sessionSizeTitle}>{copy.game?.hubSessionLength || "Oturum uzunluğu"}</Text>
          <View style={S.sessionSizeRow}>
            {([5, 10, 20, 30] as const).map((size) => (
              <Pressable key={size} accessibilityRole="button" accessibilityLabel={`${size} soru`} onPress={() => onPracticeSessionSizeChange(size)} style={[S.sessionSizeButton, practiceSessionSize === size && S.sessionSizeButtonActive]}>
                <Text style={[S.sessionSizeText, practiceSessionSize === size && S.sessionSizeTextActive]}>{size}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={S.sessionSizeHint}>{fill(copy.game?.hubSessionLengthHint || "Her pratikte {count} kelime gelir.", { count: practiceSessionSize })}</Text>

          {/* Directional mode only applies to new-word practice — while
              reviews are mandatory, starting one ignores this, so it stays
              hidden rather than offering a choice that does nothing. */}
          {!hasMandatoryReview && (
            <View style={S.modeRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: !reverseMode }}
                style={[S.modeButton, !reverseMode && S.modeButtonActive]}
                onPress={() => setReverseMode(false)}
              >
                <Text style={[S.modeButtonText, !reverseMode && S.modeButtonTextActive]}>
                  {copy.game?.hubModePickMeaning || "İngilizce → Türkçe"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: reverseMode }}
                style={[S.modeButton, reverseMode && S.modeButtonActive]}
                onPress={() => setReverseMode(true)}
              >
                <Text style={[S.modeButtonText, reverseMode && S.modeButtonTextActive]}>
                  {copy.game?.hubModePickWord || "Türkçe → İngilizce"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

          {/* User Status Mini-Stats Row */}
          <View style={S.statsRow}>
            <View style={S.statPill}>
              <Text style={S.statLvlBadge}>{level}</Text>
              <Text style={S.statPillTxt}>{copy.game?.hubLevelPrefix || "Seviye"}</Text>
            </View>
            <View style={S.statPill}>
              <Ionicons name="flash" size={13} color={C.rewardText} />
              <Text style={S.statPillTxt}>{xp} XP</Text>
            </View>
            <View style={S.statPill}>
              <Ionicons name="flame" size={13} color={C.attention} />
              <Text style={S.statPillTxt}>{streakText}</Text>
            </View>
            {dueReviewCount > 0 && (
              <View style={[S.statPill, S.statPillAttention]}>
                <Ionicons name="refresh" size={12} color={C.attentionText} />
                <Text style={S.statPillAttentionTxt}>{dueReviewCount}</Text>
              </View>
            )}
          </View>

          {/* Hero: whichever flow is actually available right now. While any
              review is due, it always wins — new words are a separate,
              locked flow below (roadmap 18-srs-flow-hardening.md "pekişme"
              redesign, 2026-08-26). */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasMandatoryReview
                ? `${copy.game?.hubReviewHeroTitle || "Önce tekrarların"}, ${sessionSummary}. ${copy.game?.hubReviewCta || "Tekrara başla"}`
                : `${copy.game?.hubHeroTitle || "Günün pratiği"}, ${level}, ${sessionSummary}. ${copy.game?.hubHeroCta || "Pratiğe başla"}`
            }
            style={({ pressed }) => [S.heroCard, pressed && S.cardPressed]}
            onPress={() => (hasMandatoryReview ? onStartReview() : onStartDailyPractice(reverseMode))}
          >
            <View style={S.heroTop}>
              <View style={S.heroCopy}>
                <View style={[S.recommendedBadge, hasMandatoryReview && S.requiredBadge]}>
                  <Text style={S.recommendedBadgeTxt}>
                    {hasMandatoryReview
                      ? copy.game?.hubBadgeRequired || "ÖNCE BU"
                      : copy.game?.hubBadgeRecommended || "ÖNERİLEN"}
                  </Text>
                </View>
                <Text style={S.heroTitle}>
                  {hasMandatoryReview
                    ? copy.game?.hubReviewHeroTitle || "Önce tekrarların"
                    : copy.game?.hubHeroTitle || "Günün pratiği"}
                </Text>
                <Text style={S.heroReason}>{sessionSummary}</Text>
                {!hasMandatoryReview && (
                  <Text style={S.heroMeta}>
                    {level} ·{" "}
                    {fill(copy.home?.practiceMetaEstimate || "{count} kelime · yaklaşık {minutes} dk", {
                      count: practiceSessionSize,
                      minutes: estimatedMinutes,
                    })}
                  </Text>
                )}
              </View>

              <Image source={sprig} style={S.heroMascot} resizeMode="contain" />
            </View>

            <View style={S.heroCtaBtn}>
              <Text style={S.heroCtaBtnTxt}>
                {hasMandatoryReview
                  ? copy.game?.hubReviewCta || "Tekrara başla →"
                  : copy.game?.hubHeroCta || "Pratiğe başla →"}
              </Text>
            </View>
          </Pressable>

          {/* New-word practice waits behind the review gate. Shown, not
              hidden — a locked door is more honest than a missing one. */}
          {hasMandatoryReview && (
            <View style={[S.optionCard, S.optionCardLocked]}>
              <View style={S.optionRow}>
                <View style={[S.optionIconCircle, S.iconCircleLocked]}>
                  <Ionicons name="lock-closed" size={20} color={C.muted} />
                </View>
                <View style={S.optionCopy}>
                  <Text style={S.optionTitle}>
                    {copy.home?.practiceLockedTitle || "Yeni kelimeler"}
                  </Text>
                  <Text style={S.optionSubtitle}>
                    {copy.home?.practiceLockedSubtitle || "Bugünkü tekrarları bitirince açılır"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
  );
}

const S = StyleSheet.create({
  shell: {
    flex: 1,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 16,
  },
  headerGroup: {
    gap: 4,
    marginTop: 4,
  },
  eyebrow: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: C.ink,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 33,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  subtitle: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.streak,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md || 14,
  },
  statLvlBadge: {
    backgroundColor: C.primarySoft,
    color: C.primary,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  statPillTxt: {
    color: C.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  statPillAttention: {
    backgroundColor: C.attentionSoft,
  },
  statPillAttentionTxt: {
    color: C.attentionText,
    fontSize: 12,
    fontWeight: "800",
  },
  heroCard: {
    backgroundColor: C.primary,
    borderRadius: radius.card || 20,
    padding: spacing.cardPad || 20,
    gap: 14,
    shadowColor: "#462A37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
    gap: 4,
  },
  recommendedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  recommendedBadgeTxt: {
    color: C.reward,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  requiredBadge: {
    backgroundColor: "rgba(255, 193, 122, 0.24)",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  heroReason: {
    color: "#EADFE5",
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "400",
  },
  heroMeta: {
    color: "#EADFE5",
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 2,
  },
  heroMascot: {
    width: 62,
    height: 68,
    marginTop: -2,
  },
  heroCtaBtn: {
    height: 52,
    minHeight: 52,
    backgroundColor: C.reward,
    borderRadius: radius.button || 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroCtaBtnTxt: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sessionSizeCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: radius.card || 20, padding: 14, gap: 10 },
  sessionSizeTitle: { color: C.ink, fontSize: 14, fontWeight: "800" },
  sessionSizeRow: { flexDirection: "row", gap: 8 },
  sessionSizeButton: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: C.canvas, borderWidth: 1, borderColor: C.line },
  sessionSizeButtonActive: { backgroundColor: C.primary, borderColor: C.primary },
  sessionSizeText: { color: C.ink, fontWeight: "800" },
  sessionSizeTextActive: { color: C.surface },
  sessionSizeHint: { color: C.muted, fontSize: 12 },
  modeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  modeButton: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: C.canvas, borderWidth: 1, borderColor: C.line },
  modeButtonActive: { backgroundColor: C.primarySoft, borderColor: C.primaryBorder },
  modeButtonText: { color: C.muted, fontWeight: "700", fontSize: 12.5 },
  modeButtonTextActive: { color: C.primary },
  optionCard: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  optionCardLocked: {
    backgroundColor: C.surface,
    borderColor: C.lineSoft,
    opacity: 0.7,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleLocked: {
    backgroundColor: C.lineSoft,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "700",
  },
  optionSubtitle: {
    color: C.muted,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "400",
  },
});
