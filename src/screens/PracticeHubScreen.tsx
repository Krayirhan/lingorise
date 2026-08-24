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
  onStartDailyPractice: () => void;
  onStartReview: () => void;
  onTabPress: (tab: HomeTab) => void;
  practiceSessionSize: 5 | 10 | 20 | 30;
  onPracticeSessionSizeChange: (size: 5 | 10 | 20 | 30) => void;
  /** How many of today's session are overdue reviews rather than new words. */
  dueInSession: number;
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
  dueInSession,
}: Props) {
  const streakText = `${streak} ${copy.game?.hubStreakSuffix || "gün seri"}`;

  // The card describes the session that will actually be built, instead of a
  // fixed "2 min · +40 XP" that no longer matched anything.
  const freshInSession = Math.max(0, practiceSessionSize - dueInSession);
  const estimatedMinutes = Math.max(1, Math.round(practiceSessionSize * 0.15));

  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

  const sessionSummary =
    dueInSession > 0 && freshInSession > 0
      ? fill(copy.game?.hubSessionMixed || copy.home?.practiceCardSubtitle || "{reviews} tekrar ve {fresh} yeni kelime", {
          reviews: dueInSession,
          fresh: freshInSession,
        })
      : dueInSession > 0
        ? fill(copy.home?.practiceCardReviewOnly || "{reviews} kelime tekrar bekliyor", { reviews: dueInSession })
        : fill(copy.home?.practiceCardNewOnly || "{level} seviyesinden {fresh} yeni kelime", {
            level,
            fresh: freshInSession,
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

          {/* Recommended Daily Practice Hero Card (Mor #6B4355 Zemin & Altın Sarı CTA) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.game?.hubHeroTitle || "Günün pratiği"}, ${level}, ${sessionSummary}. ${copy.game?.hubHeroCta || "Pratiğe başla"}`}
            style={({ pressed }) => [
              S.heroCard,
              pressed && S.cardPressed,
            ]}
            onPress={onStartDailyPractice}
          >
            <View style={S.heroTop}>
              <View style={S.heroCopy}>
                <View style={S.recommendedBadge}>
                  <Text style={S.recommendedBadgeTxt}>
                    {copy.game?.hubBadgeRecommended || "ÖNERİLEN"}
                  </Text>
                </View>
                <Text style={S.heroTitle}>
                  {copy.game?.hubHeroTitle || "Günün pratiği"}
                </Text>
                <Text style={S.heroReason}>{sessionSummary}</Text>
                <Text style={S.heroMeta}>
                  {level} ·{" "}
                  {fill(copy.home?.practiceMetaEstimate || "{count} kelime · yaklaşık {minutes} dk", {
                    count: practiceSessionSize,
                    minutes: estimatedMinutes,
                  })}
                </Text>
              </View>

              <Image source={sprig} style={S.heroMascot} resizeMode="contain" />
            </View>

            {/* Primary Gold CTA */}
            <View style={S.heroCtaBtn}>
              <Text style={S.heroCtaBtnTxt}>
                {copy.game?.hubHeroCta || "Pratiğe başla →"}
              </Text>
            </View>
          </Pressable>

          {/* The header only earns its place when something follows it. */}
          {dueReviewCount > 0 && (
            <View style={S.sectionHdr}>
              <Text style={S.sectionTitle}>
                {copy.game?.hubSectionOther || "Diğer seçenekler"}
              </Text>
            </View>
          )}

          {/* Show review only after the user has actually made a mistake. */}
          {dueReviewCount > 0 && <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.game?.hubReviewTitle || "Hatalarını tekrar et"}. ${dueReviewCount > 0 ? dueReviewCount + " " + (copy.game?.hubReviewDueSubtitle || "kelime bekliyor") : (copy.game?.hubReviewEmptyTitle || "Hata tekrarı yok")}`}
            style={({ pressed }) => [
              S.optionCard,
              dueReviewCount === 0 && S.optionCardEmpty,
              pressed && S.cardPressed,
            ]}
            onPress={onStartReview}
          >
            <View style={S.optionRow}>
              <View
                style={[
                  S.optionIconCircle,
                  dueReviewCount > 0 ? S.iconCircleAttention : S.iconCircleSuccess,
                ]}
              >
                <Ionicons
                  name={dueReviewCount > 0 ? "refresh-circle" : "checkmark-circle"}
                  size={24}
                  color={dueReviewCount > 0 ? C.attentionText : C.successText}
                />
              </View>

              <View style={S.optionCopy}>
                <Text style={S.optionTitle}>
                  {copy.game?.hubReviewTitle || "Hatalarını tekrar et"}
                </Text>
                <Text style={S.optionSubtitle}>
                  {dueReviewCount > 0
                    ? `${dueReviewCount} ${copy.game?.hubReviewDueSubtitle || "kelime tekrar bekliyor. Unutmadan önce yeniden çalış."}`
                    : copy.game?.hubReviewEmptySubtitle || "Şimdilik tüm kelimelerin güncel."}
                </Text>
              </View>
            </View>

            <View style={S.secondaryBtn}>
              <Text style={S.secondaryBtnTxt}>
                {dueReviewCount > 0
                  ? copy.game?.hubReviewCta || "Tekrara başla"
                  : copy.game?.hubReviewEmptyCta || "Yeni pratik seç"}
              </Text>
            </View>
          </Pressable>}

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
  sectionHdr: {
    marginTop: 4,
  },
  sessionSizeCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: radius.card || 20, padding: 14, gap: 10 },
  sessionSizeTitle: { color: C.ink, fontSize: 14, fontWeight: "800" },
  sessionSizeRow: { flexDirection: "row", gap: 8 },
  sessionSizeButton: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: C.canvas, borderWidth: 1, borderColor: C.line },
  sessionSizeButtonActive: { backgroundColor: C.primary, borderColor: C.primary },
  sessionSizeText: { color: C.ink, fontWeight: "800" },
  sessionSizeTextActive: { color: C.surface },
  sessionSizeHint: { color: C.muted, fontSize: 12 },
  sectionTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  optionCard: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  optionCardEmpty: {
    backgroundColor: C.surface,
    borderColor: C.lineSoft,
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
  iconCircleAttention: {
    backgroundColor: C.attentionSoft,
  },
  iconCircleSuccess: {
    backgroundColor: C.successSoft,
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
  secondaryBtn: {
    minHeight: 44,
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primaryBorder,
    borderRadius: radius.miniCard || 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryBtnTxt: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
