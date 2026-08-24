import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy, Locale } from "../../../i18n/en";
import { formatReviewsCount } from "../../../utils/formatters";

interface Props {
  copy: Copy;
  locale: Locale;
  dueReviewCount: number;
  onPress: () => void;
}

export function ReviewCard({ copy, locale, dueReviewCount, onPress }: Props) {
  // Strict rule: if no reviews due, do not render this card at all
  if (!dueReviewCount || dueReviewCount <= 0) {
    return null;
  }

  const isUrgent = dueReviewCount >= 10;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${copy.home?.reviewCardTitle || "Zorlandıklarını Tekrar Et"}, ${dueReviewCount} kelime bekliyor`}
      accessibilityHint="Hatalı soruların aralıklı tekrar oturumunu başlatır"
      style={({ pressed }) => [S.reviewCard, pressed && S.reviewPressed]}
      onPress={onPress}
    >
      <View style={[S.reviewCardIcon, isUrgent && S.reviewCardIconUrgent]}>
        <Ionicons
          name="refresh-circle"
          size={24}
          color={isUrgent ? C.attentionText : C.primary}
        />
      </View>

      <View style={S.reviewCardCopy}>
        <View style={S.reviewCardTitleRow}>
          <Text style={S.reviewCardTitle} numberOfLines={1}>
            {copy.home?.reviewCardTitle || "Zorlandıklarını Tekrar Et"}
          </Text>
          <View style={[S.reviewCountBadge, isUrgent && S.reviewCountBadgeUrgent]}>
            <Text style={S.reviewCountBadgeText}>
              {formatReviewsCount(dueReviewCount, locale)}
            </Text>
          </View>
        </View>
        <Text style={S.reviewCardSubtitle} numberOfLines={1}>
          {isUrgent
            ? `Bugün ${dueReviewCount} kelime tekrar bekliyor.`
            : copy.home?.reviewCardSubtitle || "Tekrar ederek kalıcı öğren"}
        </Text>
      </View>

      <View style={S.ctaPill}>
        <Text style={S.ctaPillTxt}>Tekrar et →</Text>
      </View>
    </Pressable>
  );
}

const S = StyleSheet.create({
  reviewCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  reviewCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reviewCardIconUrgent: {
    backgroundColor: "#FDEEE9",
  },
  reviewCardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  reviewCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  reviewCardTitle: {
    color: C.ink,
    fontWeight: "700",
    fontSize: 14,
    flexShrink: 1,
  },
  reviewCountBadge: {
    backgroundColor: C.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
    flexShrink: 0,
  },
  reviewCountBadgeUrgent: {
    backgroundColor: "#D32F2F",
  },
  reviewCountBadgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "700",
  },
  reviewCardSubtitle: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  ctaPill: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.xs,
    flexShrink: 0,
  },
  ctaPillTxt: {
    color: C.primary,
    fontSize: 11.5,
    fontWeight: "700",
  },
});

