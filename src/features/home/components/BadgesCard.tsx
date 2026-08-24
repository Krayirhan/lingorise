import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  unlockedBadges: string[];
  title?: string;
}

export function BadgesCard({ copy, unlockedBadges, title }: Props) {
  const badgesList: {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    name: string;
    conditionKey:
      | "badgeConditionFirstStep"
      | "badgeConditionQuickGrow"
      | "badgeConditionGardenLover"
      | "badgeConditionStreak3"
      | "badgeConditionMasterReview";
    defaultCondition: string;
  }[] = [
    {
      id: "badge_first_step",
      icon: "leaf",
      name: "İlk Adım",
      conditionKey: "badgeConditionFirstStep",
      defaultCondition: "1 alıştırma tamamla",
    },
    {
      id: "badge_quick_grow",
      icon: "flash",
      name: "Hızlı İlerleme",
      conditionKey: "badgeConditionQuickGrow",
      defaultCondition: "160 XP topla",
    },
    {
      id: "badge_garden_lover",
      icon: "flower",
      name: "Kelime Sever",
      conditionKey: "badgeConditionGardenLover",
      defaultCondition: "5 kelime öğren",
    },
    {
      id: "badge_streak_3",
      icon: "flame",
      name: "3 Gün Seri",
      conditionKey: "badgeConditionStreak3",
      defaultCondition: "3 gün üst üste çalış",
    },
    {
      id: "badge_master_review",
      icon: "ribbon",
      name: "Usta Tekrarcı",
      conditionKey: "badgeConditionMasterReview",
      defaultCondition: "25 kelimeyi pekiştir",
    },
  ];

  // Level-completion badges (roadmap Birim 11.3) are dynamic — one per level
  // actually earned — rather than pre-listed as locked placeholders for
  // levels that may not even have content yet.
  const levelBadges = unlockedBadges
    .filter((id) => /^badge_level_[a-z0-9]+_complete$/.test(id))
    .map((id) => {
      const level = id.replace("badge_level_", "").replace("_complete", "").toUpperCase();
      return {
        id,
        icon: "trophy" as keyof typeof Ionicons.glyphMap,
        name: (copy.home?.badgeLevelCompleteName || "{level} Tamamlandı").replace("{level}", level),
        condition: (copy.home?.badgeConditionLevelComplete || "{level} seviyesini bitirdin").replace("{level}", level),
      };
    });

  return (
    <View style={S.badgesCard}>
      <View style={S.hdr}>
        <Text style={S.badgesCardTitle}>
          {title || copy.home?.badgesSection || "Bahçe Rozetleri"}
        </Text>
      </View>

      <View style={S.badgesGrid}>
        {[
          ...badgesList.map((b) => ({ id: b.id, icon: b.icon, name: b.name, condition: copy.home?.[b.conditionKey] || b.defaultCondition })),
          ...levelBadges,
        ].map((b) => {
          const unlocked = unlockedBadges.includes(b.id);
          const condition = b.condition;

          return (
            <View
              key={b.id}
              style={[S.badgeItem, unlocked ? S.badgeItemUnlocked : S.badgeItemLocked]}
              accessibilityRole="text"
              accessibilityLabel={`${b.name}, ${condition}, ${unlocked ? (copy.home?.badgeStatusUnlocked || "Kazandın") : (copy.home?.badgeStatusLocked || "Kilitli")}`}
            >
              <View
                style={[
                  S.badgeIconCircle,
                  unlocked ? S.badgeIconUnlocked : S.badgeIconLockedCircle,
                ]}
              >
                <Ionicons
                  name={b.icon}
                  size={20}
                  color={unlocked ? C.primary : C.muted}
                />
              </View>

              <Text style={S.badgeItemName} numberOfLines={1}>
                {b.name}
              </Text>

              <Text style={S.badgeCondition} numberOfLines={2}>
                {condition}
              </Text>

              <View
                style={[
                  S.statusBadge,
                  unlocked ? S.statusBadgeUnlocked : S.statusBadgeLocked,
                ]}
              >
                <Text
                  style={[
                    S.statusBadgeTxt,
                    unlocked ? S.statusBadgeTxtUnlocked : S.statusBadgeTxtLocked,
                  ]}
                >
                  {unlocked
                    ? copy.home?.badgeStatusUnlocked || "Kazandın"
                    : copy.home?.badgeStatusLocked || "Hedef"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  badgesCard: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: spacing.cardPad || 20,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgesCardTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgeItem: {
    alignItems: "center",
    // A fixed basis (not flex:1) so the collection can grow past 4-5 items —
    // level-completion badges (roadmap Birim 11.3) are unbounded — without
    // every card getting squeezed thinner as more are earned.
    width: "31%",
    flexGrow: 1,
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.miniCard || 16,
    borderWidth: 1,
  },
  badgeItemUnlocked: {
    backgroundColor: C.primarySubtle,
    borderColor: C.primaryBorder,
  },
  badgeItemLocked: {
    backgroundColor: C.canvas,
    borderColor: C.lineSoft,
  },
  badgeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  badgeIconUnlocked: {
    backgroundColor: C.primarySoft,
    borderWidth: 1.5,
    borderColor: C.primaryBorder,
  },
  badgeIconLockedCircle: {
    backgroundColor: C.lineSoft,
  },
  badgeItemName: {
    color: C.ink,
    fontSize: 11.5,
    fontWeight: "700",
    textAlign: "center",
  },
  badgeCondition: {
    color: C.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 13,
    minHeight: 26,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  statusBadgeUnlocked: {
    backgroundColor: C.primarySoft,
  },
  statusBadgeLocked: {
    backgroundColor: C.lineSoft,
  },
  statusBadgeTxt: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  statusBadgeTxtUnlocked: {
    color: C.primary,
  },
  statusBadgeTxtLocked: {
    color: C.muted,
  },
});
