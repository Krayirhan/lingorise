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
  onStartDailyPractice: (reverseMode: boolean) => void;
  onTabPress: (tab: HomeTab) => void;
  practiceSessionSize: 5 | 10 | 20 | 30;
  onPracticeSessionSizeChange: (size: 5 | 10 | 20 | 30) => void;
  /** Whether the level has enough content to seat a 60-question exam. */
  isExamAvailable: boolean;
  /** Whether the current level's completion exam has already been passed. */
  isExamPassed: boolean;
  onStartExam: () => void;
  /** True once every word in the level is learned — the daily-practice CTA has nothing left to build a session from (CORE-004). */
  isLevelFullyLearned: boolean;
}

export function PracticeHubScreen({
  copy,
  locale,
  level,
  xp,
  streak,
  onStartDailyPractice,
  practiceSessionSize,
  onPracticeSessionSizeChange,
  isExamAvailable,
  isExamPassed,
  onStartExam,
  isLevelFullyLearned,
}: Props) {
  const [reverseMode, setReverseMode] = useState(false);
  const estimatedMinutes = Math.max(1, Math.round(practiceSessionSize * 0.15));

  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);

  // Once every word in the level is learned, the daily-practice hero has no
  // session left to build (CORE-004) — it must not stay a live, always-armed
  // CTA. When the exam is still pending, the hero itself becomes the exam
  // entry point (the strongest single next action); the "Diğer seçenekler"
  // exam card below is then redundant and hidden to avoid offering the same
  // action twice.
  const heroIsExamCta = isLevelFullyLearned && isExamAvailable && !isExamPassed;
  const showExamOptionCard = isExamAvailable && !heroIsExamCta;

  // Daily practice is always and only new words now — a word already met is
  // never shown here again (roadmap 18-srs-flow-hardening.md "sınav"
  // redesign, 2026-08-26). Finishing a level is decided separately, by the
  // completion exam below, not by resurfacing individual words over days.
  const sessionSummary = fill(copy.home?.practiceCardNewOnly || "{level} seviyesinden {fresh} yeni kelime", {
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

          {/* Recommended Daily Practice Hero Card — replaced by a level-complete
              state once there are no fresh words left to practice (CORE-004). */}
          {isLevelFullyLearned ? (
            <Pressable
              accessibilityRole="button"
              disabled={!heroIsExamCta}
              accessibilityState={{ disabled: !heroIsExamCta }}
              accessibilityLabel={`${fill(copy.game?.hubLevelDoneTitle || "{level} tamamlandı", { level })}. ${
                heroIsExamCta
                  ? copy.game?.examCardCta || "Sınava gir"
                  : isExamPassed
                    ? copy.game?.hubLevelDoneSubtitleExamPassed || ""
                    : copy.game?.hubLevelDoneSubtitleNoExam || ""
              }`}
              style={({ pressed }) => [S.heroCard, pressed && heroIsExamCta && S.cardPressed]}
              onPress={heroIsExamCta ? onStartExam : undefined}
            >
              <View style={S.heroTop}>
                <View style={S.heroCopy}>
                  <View style={S.recommendedBadge}>
                    <Text style={S.recommendedBadgeTxt}>
                      {copy.game?.hubBadgeRecommended || "ÖNERİLEN"}
                    </Text>
                  </View>
                  <Text style={S.heroTitle}>
                    {fill(copy.game?.hubLevelDoneTitle || "{level} tamamlandı!", { level })}
                  </Text>
                  <Text style={S.heroReason}>
                    {isExamPassed
                      ? copy.game?.hubLevelDoneSubtitleExamPassed || "Bu seviyedeki tüm kelimeleri öğrendin ve sınavını geçtin."
                      : isExamAvailable
                        ? copy.game?.hubLevelDoneSubtitleExamPending || "Bu seviyedeki tüm kelimeleri öğrendin. Şimdi sırada tamamlama sınavı var."
                        : copy.game?.hubLevelDoneSubtitleNoExam || "Bu seviyedeki tüm kelimeleri öğrendin. Tamamlama sınavı bu seviye için henüz hazır değil."}
                  </Text>
                </View>

                <Image source={sprig} style={S.heroMascot} resizeMode="contain" />
              </View>

              {heroIsExamCta && (
                <View style={S.heroCtaBtn}>
                  <Text style={S.heroCtaBtnTxt}>
                    {copy.game?.examCardCta || "Sınava gir"}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${copy.game?.hubHeroTitle || "Günün pratiği"}, ${level}, ${sessionSummary}. ${copy.game?.hubHeroCta || "Pratiğe başla"}`}
              style={({ pressed }) => [
                S.heroCard,
                pressed && S.cardPressed,
              ]}
              onPress={() => onStartDailyPractice(reverseMode)}
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
          )}

          {/* Session configuration — secondary to the hero CTA above (CD-002:
              config used to lead the screen, ahead of the motivating hero). */}
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

            {/* Directional Mode Switcher (EN -> TR / TR -> EN) */}
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
          </View>

          {/* Level completion is a single deliberate exam, not something that
              accumulates from resurfaced words over days (roadmap
              18-srs-flow-hardening.md "sınav" redesign). Hidden when the hero
              above is already the exam entry point, to avoid the same CTA twice. */}
          {showExamOptionCard && (
            <View style={S.sectionHdr}>
              <Text style={S.sectionTitle}>
                {copy.game?.hubSectionOther || "Diğer seçenekler"}
              </Text>
            </View>
          )}

          {showExamOptionCard && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isExamPassed
                  ? `${level} ${copy.game?.examCardPassedTitle || "tamamlama sınavı geçildi"}`
                  : `${level} ${copy.game?.examCardTitle || "tamamlama sınavı"}`
              }
              style={({ pressed }) => [S.optionCard, pressed && S.cardPressed]}
              onPress={onStartExam}
            >
              <View style={S.optionRow}>
                <View style={[S.optionIconCircle, isExamPassed ? S.iconCircleSuccess : S.iconCircleAttention]}>
                  <Ionicons
                    name={isExamPassed ? "checkmark-circle" : "school"}
                    size={24}
                    color={isExamPassed ? C.successText : C.attentionText}
                  />
                </View>

                <View style={S.optionCopy}>
                  <Text style={S.optionTitle}>
                    {fill(copy.game?.examCardTitle || "{level} tamamlama sınavı", { level })}
                  </Text>
                  <Text style={S.optionSubtitle}>
                    {isExamPassed
                      ? copy.game?.examCardPassedSubtitle || "Geçtin — istersen tekrar deneyebilirsin."
                      : copy.game?.examCardSubtitle || "60 soru, seviyenin her yerinden. 50 doğru = seviye tamamlandı."}
                  </Text>
                </View>
              </View>

              <View style={S.secondaryBtn}>
                <Text style={S.secondaryBtnTxt}>
                  {isExamPassed
                    ? copy.game?.examCardRetakeCta || "Tekrar dene"
                    : copy.game?.examCardCta || "Sınava gir"}
                </Text>
              </View>
            </Pressable>
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
  sectionTitle: {
    color: C.ink,
    fontSize: 18,
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
