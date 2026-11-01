import { ScrollView, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { BadgeItem } from "./BadgeItem";
import { S } from "./BadgesCard.styles";
import { getBadgeItems } from "./badgeItems";

interface Props { copy: Copy; unlockedBadges: string[]; title?: string }

export function BadgesCard({ copy, unlockedBadges, title }: Props) {
  const badges = getBadgeItems(copy, unlockedBadges);
  return (
    <View style={S.section}>
      <Text accessibilityRole="header" style={S.badgesCardTitle}>{title || copy.home.badgesSection}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.scroller} contentContainerStyle={S.shelf}>
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} unlocked={unlockedBadges.includes(badge.id)} copy={copy} />
        ))}
      </ScrollView>
    </View>
  );
}
