import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Brand } from "../../../components/Brand";
import { C, radius } from "../../../theme/colors";
import { LevelCode } from "../../../types/content";
import { formatDays } from "../../../utils/formatters";
import { Locale } from "../../../i18n/en";

interface Props {
  level: LevelCode;
  streak: number;
  locale: Locale;
  levelLabel?: string;
  streakLabel?: string;
  onLevelPress: () => void;
  onRefresh?: () => Promise<void>;
}

export function HomeHeader({
  level,
  streak,
  locale,
  levelLabel = "Seviye",
  streakLabel = "günlük çalışma serisi",
  onLevelPress,
  onRefresh,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={S.hdr}>
      <View style={S.brandWrap}>
        <Brand size={27} />
      </View>

      <View style={S.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="İlerlemeni yenile"
          accessibilityHint="Kayıtlı ilerleme ve günlük durumu yeniden yükler"
          style={({ pressed }) => [S.devBtn, pressed && S.btnPre]}
          disabled={refreshing || !onRefresh}
          onPress={async () => {
            if (!onRefresh || refreshing) return;
            try {
              setRefreshing(true);
              await onRefresh();
            } finally {
              setRefreshing(false);
            }
          }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <Ionicons name="refresh" size={15} color={C.primary} />
          )}
        </Pressable>

        {/* Streak Chip (Secondary Info) */}
        <View
          accessibilityRole="text"
          accessibilityLabel={`${streak} ${streakLabel}`}
          style={S.streak}
        >
          <Ionicons name="leaf" size={13} color={C.primary} />
          <Text style={S.streakTxt}>{formatDays(streak, locale)}</Text>
        </View>

        {/* Level Selector Chip [A1] Seviye ⌄ */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${levelLabel}: ${level}`}
          accessibilityHint="Seviye ve içerik filtresini değiştir"
          style={({ pressed }) => [S.level, pressed && S.btnPre]}
          onPress={onLevelPress}
        >
          <View style={S.levelBadge}>
            <Text style={S.levelBadgeTxt}>{level}</Text>
          </View>
          <Text style={S.levelTxt}>{levelLabel}</Text>
          <Ionicons name="chevron-down" size={12} color={C.muted} />
        </Pressable>

      </View>
    </View>
  );
}

const S = StyleSheet.create({
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 8
          : 12
        : 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: C.canvas,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    minHeight: 56,
  },
  brandWrap: {
    maxWidth: 130,
    marginRight: 16,
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  devBtn: {
    width: 32,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  btnPre: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.streak,
    paddingHorizontal: 9,
    minHeight: 44,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  streakTxt: {
    color: C.ink,
    fontSize: 11.5,
    fontWeight: "800",
  },
  level: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 8,
    minHeight: 44,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  levelBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeTxt: {
    color: C.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  levelTxt: {
    color: C.ink,
    fontSize: 11,
    fontWeight: "700",
  },
});
