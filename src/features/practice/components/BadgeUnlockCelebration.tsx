import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";

const BADGES: Record<string, { titleTr: string; titleEn: string; icon: keyof typeof Ionicons.glyphMap }> = {
  badge_first_step: { titleTr: "İlk Adım", titleEn: "First Step", icon: "leaf" },
  badge_quick_grow: { titleTr: "Hızlı İlerleme", titleEn: "Quick Grow", icon: "flash" },
  badge_garden_lover: { titleTr: "Kelime Sever", titleEn: "Garden Lover", icon: "flower" },
  badge_streak_3: { titleTr: "3 Gün Seri", titleEn: "3 Day Streak", icon: "flame" },
  // Roadmap Birim 11.1/11.2: this key used to be "badge_review_master" here
  // while badges.ts actually emits "badge_master_review" — the mismatch
  // meant this celebration silently never fired for the badge (this lookup
  // always missed, `badge` stayed undefined, and the effect below returns
  // early). Fixed to match the id badges.ts actually produces.
  badge_master_review: { titleTr: "Kararlı Öğrenci", titleEn: "Committed Learner", icon: "ribbon" },
};

/** badge_level_a1_complete → "A1"; every level shares one dynamic entry
    rather than six near-duplicate static ones. */
export function levelCompleteBadgeTitle(badgeId: string, locale: "tr" | "en"): string | null {
  const match = /^badge_level_([a-z0-9]+)_complete$/.exec(badgeId);
  if (!match) return null;
  const level = match[1].toUpperCase();
  return locale === "tr" ? `${level} Tamamlandı` : `${level} Completed`;
}

interface Props {
  badgeId?: string;
  locale: "tr" | "en";
  reduceMotion?: boolean;
  onDismiss: () => void;
}

export function BadgeUnlockCelebration({ badgeId, locale, reduceMotion = false, onDismiss }: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dynamicLevelTitle = badgeId ? levelCompleteBadgeTitle(badgeId, locale) : null;
  const badge = badgeId
    ? BADGES[badgeId] || (dynamicLevelTitle ? { titleTr: dynamicLevelTitle, titleEn: dynamicLevelTitle, icon: "trophy" as const } : undefined)
    : undefined;

  useEffect(() => {
    if (!badge) return;
    scale.setValue(reduceMotion ? 1 : 0.7);
    opacity.setValue(0);
    const entrance = reduceMotion
      ? Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true })
      : Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 130, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]);
    entrance.start();
    const timer = setTimeout(onDismiss, 2600);
    return () => clearTimeout(timer);
  }, [badgeId, badge, onDismiss, opacity, reduceMotion, scale]);

  if (!badge) return null;
  const title = locale === "tr" ? badge.titleTr : badge.titleEn;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <View style={S.backdrop} pointerEvents="box-none">
        <Animated.View style={[S.card, { opacity, transform: [{ scale }] }]}>
          <View style={S.icon}><Ionicons name={badge.icon} size={40} color={C.primary} /></View>
          <Text style={S.overline}>{locale === "tr" ? "YENİ ROZET!" : "NEW BADGE!"}</Text>
          <Text style={S.title}>{title}</Text>
          <Text style={S.copy}>{locale === "tr" ? "Harika iş! Koleksiyonuna eklendi." : "Great work! Added to your collection."}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={locale === "tr" ? "Rozeti kapat" : "Dismiss badge"} onPress={onDismiss} style={S.button}>
            <Text style={S.buttonText}>{locale === "tr" ? "Harika!" : "Nice!"}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(28, 35, 30, 0.38)", padding: 28 },
  card: { width: "100%", maxWidth: 340, alignItems: "center", borderRadius: radius.card || 22, backgroundColor: C.surface, padding: 28, shadowColor: "#172018", shadowOpacity: 0.22, shadowRadius: 20, elevation: 12 },
  icon: { width: 86, height: 86, borderRadius: 43, alignItems: "center", justifyContent: "center", backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.primaryBorder, marginBottom: 14 },
  overline: { color: C.primary, fontSize: 12, letterSpacing: 1.3, fontWeight: "800" },
  title: { color: C.ink, fontSize: 26, fontWeight: "800", marginTop: 5 },
  copy: { color: C.muted, fontSize: 14, textAlign: "center", lineHeight: 20, marginTop: 8 },
  button: { marginTop: 20, backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.md },
  buttonText: { color: C.surface, fontWeight: "800", fontSize: 15 },
});
