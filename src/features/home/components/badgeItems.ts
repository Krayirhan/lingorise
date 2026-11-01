import { Ionicons } from "@expo/vector-icons";
import { Copy } from "../../../i18n/en";

type ConditionKey = "badgeConditionFirstStep" | "badgeConditionQuickGrow" | "badgeConditionGardenLover" | "badgeConditionStreak3" | "badgeConditionMasterReview";
export interface BadgeItemData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  condition: string;
}

const fixedBadges: Array<Omit<BadgeItemData, "condition"> & { conditionKey: ConditionKey; defaultCondition: string }> = [
  { id: "badge_first_step", icon: "leaf", name: "İlk Adım", conditionKey: "badgeConditionFirstStep", defaultCondition: "1 alıştırma tamamla" },
  { id: "badge_quick_grow", icon: "flash", name: "Hızlı İlerleme", conditionKey: "badgeConditionQuickGrow", defaultCondition: "160 XP topla" },
  { id: "badge_garden_lover", icon: "flower", name: "Kelime Sever", conditionKey: "badgeConditionGardenLover", defaultCondition: "5 kelime öğren" },
  { id: "badge_streak_3", icon: "flame", name: "3 Gün Seri", conditionKey: "badgeConditionStreak3", defaultCondition: "3 gün üst üste çalış" },
  { id: "badge_master_review", icon: "ribbon", name: "Kararlı Öğrenci", conditionKey: "badgeConditionMasterReview", defaultCondition: "2 seviye sınavını geç" },
];

export function getBadgeItems(copy: Copy, unlockedBadges: string[]): BadgeItemData[] {
  const regular = fixedBadges.map(badge => ({
    id: badge.id,
    icon: badge.icon,
    name: badge.name,
    condition: copy.home?.[badge.conditionKey] || badge.defaultCondition,
  }));
  const levelBadges = unlockedBadges
    .filter(id => /^badge_level_[a-z0-9]+_complete$/.test(id))
    .map(id => {
      const level = id.replace("badge_level_", "").replace("_complete", "").toUpperCase();
      return {
        id,
        icon: "trophy" as keyof typeof Ionicons.glyphMap,
        name: (copy.home.badgeLevelCompleteName).replace("{level}", level),
        condition: (copy.home.badgeConditionLevelComplete).replace("{level}", level),
      };
    });
  return [...regular, ...levelBadges];
}
