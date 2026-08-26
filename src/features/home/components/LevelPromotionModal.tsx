import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../types/content";
import { PromotionState } from "../../../domain/learning/promotion";
import { track } from "../../../services/telemetry";

interface Props {
  copy: Copy;
  level: LevelCode;
  promotion: PromotionState | null;
  visible: boolean;
  onAdvance: (next: LevelCode) => void;
  onDismiss: () => void;
  reduceMotion?: boolean;
}

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );

/**
 * The moment a level is genuinely consolidated. When the next level is not
 * ready yet it says so plainly instead of promoting someone into an empty
 * catalogue.
 */
export function LevelPromotionModal({ copy, level, promotion, visible, onAdvance, onDismiss, reduceMotion }: Props) {
  const shownForLevelRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visible || !promotion) return;
    if (shownForLevelRef.current === level) return;
    shownForLevelRef.current = level;
    track("level_promotion_shown", {
      level,
      nextLevelReady: promotion.isNextLevelReady,
    });
  }, [visible, promotion, level]);

  if (!visible || !promotion) return null;

  const canAdvance = Boolean(promotion.nextLevel && promotion.isNextLevelReady);
  const nextLevel = promotion.nextLevel;

  const handleAdvance = (targetLevel: LevelCode) => {
    track("level_promotion_advanced", { fromLevel: level, toLevel: targetLevel });
    onAdvance(targetLevel);
  };

  return (
    <Modal
      visible
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onDismiss}
      accessibilityViewIsModal={true}
    >
      <View style={S.overlay}>
        <View
          style={S.card}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <View style={S.crest} accessible={false} importantForAccessibility="no">
            <Ionicons name="ribbon" size={30} color={C.reward} />
          </View>

          <Text style={S.eyebrow}>{copy.home?.promotionEyebrow || "SEVİYE TAMAMLANDI"}</Text>
          <Text style={S.title}>
            {fill(copy.home?.promotionTitle || "{level} seviyesini tamamladın", { level })}
          </Text>
          <Text style={S.body}>
            {fill(copy.home?.promotionSubtitleExam || "{level} tamamlama sınavını geçtin — bu seviyeyi artık gerçekten biliyorsun.", {
              level,
            })}
          </Text>

          {!canAdvance && nextLevel && (
            <View style={S.soonBox}>
              <Text style={S.soonTitle}>
                {fill(copy.home?.promotionSoonTitle || "{level} henüz hazırlanıyor", { level: nextLevel })}
              </Text>
              <Text style={S.soonBody}>
                {fill(
                  copy.home?.promotionSoonBody ||
                    "Yeni kelimeler ekleniyor. Bu sırada {current} kelimelerini taze tut — tekrarların devam ediyor.",
                  { current: level }
                )}
              </Text>
            </View>
          )}

          <View style={S.actions}>
            {canAdvance && nextLevel ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={fill(copy.home?.promotionNextCta || "{level} ile devam et →", { level: nextLevel })}
                  style={({ pressed }) => [S.primaryBtn, pressed && S.pressed]}
                  onPress={() => handleAdvance(nextLevel)}
                >
                  <Text style={S.primaryTxt}>
                    {fill(copy.home?.promotionNextCta || "{level} ile devam et →", { level: nextLevel })}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={fill(copy.home?.promotionStayCta || "{level} seviyesinde kal", { level })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [S.ghostBtn, pressed && S.pressed]}
                  onPress={onDismiss}
                >
                  <Text style={S.ghostTxt}>
                    {fill(copy.home?.promotionStayCta || "{level} seviyesinde kal", { level })}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.home?.promotionSoonCta || "Anladım"}
                style={({ pressed }) => [S.primaryBtn, pressed && S.pressed]}
                onPress={onDismiss}
              >
                <Text style={S.primaryTxt}>{copy.home?.promotionSoonCta || "Anladım"}</Text>
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
    backgroundColor: "rgba(28, 27, 26, 0.62)",
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
    alignItems: "center",
    elevation: 8,
  },
  crest: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: C.rewardSoft,
    borderWidth: 1,
    borderColor: C.rewardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  eyebrow: { color: C.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: C.ink, fontSize: 22, fontWeight: "700", textAlign: "center", letterSpacing: -0.3 },
  body: { color: C.muted, fontSize: 14.5, lineHeight: 20, textAlign: "center" },
  soonBox: {
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    padding: 14,
    gap: 4,
    marginTop: 6,
    width: "100%",
  },
  soonTitle: { color: C.ink, fontSize: 14, fontWeight: "700" },
  soonBody: { color: C.muted, fontSize: 13, lineHeight: 18 },
  actions: { width: "100%", gap: 8, marginTop: 12, alignItems: "center" },
  primaryBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: radius.button || 16,
    backgroundColor: C.reward,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTxt: { color: C.ink, fontWeight: "800", fontSize: 15.5 },
  ghostBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12 },
  ghostTxt: { color: C.muted, fontWeight: "700", fontSize: 13.5 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
