import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { S } from "./BadgesCard.styles";
import { BadgeItemData } from "./badgeItems";

export function BadgeItem({ badge, unlocked, copy }: { badge: BadgeItemData; unlocked: boolean; copy: Copy }) {
  return (
    <View
      style={S.badgeItem}
      accessibilityRole="text"
      accessibilityLabel={`${badge.name}, ${badge.condition}, ${unlocked ? (copy.home.badgeStatusUnlocked) : (copy.home.badgeStatusLocked)}`}
    >
      <View style={[S.medallion, unlocked ? S.medallionUnlocked : S.medallionLocked]}>
        <View style={[S.innerRing, unlocked ? S.innerRingUnlocked : S.innerRingLocked]} />
        <Ionicons name={badge.icon} size={28} color={unlocked ? C.surface : C.faint} />
        {!unlocked && (
          <View style={S.lock}>
            <Ionicons name="lock-closed" size={12} color={C.muted} />
          </View>
        )}
      </View>
      <Text style={S.badgeItemName} numberOfLines={2}>{badge.name}</Text>
      <Text style={unlocked ? S.badgeUnlockedStatus : S.badgeLockedStatus}>
        {unlocked ? (copy.home.badgeStatusUnlocked) : (copy.home.badgeStatusLocked)}
      </Text>
      <Text style={S.badgeCondition} numberOfLines={2}>{badge.condition}</Text>
    </View>
  );
}
