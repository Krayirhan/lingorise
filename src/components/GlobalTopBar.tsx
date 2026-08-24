import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, DevSettings, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Brand } from "./Brand";
import { C, radius } from "../theme/colors";
import { LevelCode } from "../types/content";
import { formatDays } from "../utils/formatters";
import { Locale } from "../i18n/en";

export interface GlobalTopBarProps {
  level: LevelCode;
  streak: number;
  locale: Locale;
  levelLabel?: string;
  streakLabel?: string;
  onLevelPress: () => void;
  onRefresh?: () => Promise<void>;
}

export function GlobalTopBar({
  level,
  streak,
  locale,
  levelLabel = "Seviye",
  streakLabel = "günlük çalışma serisi",
  onLevelPress,
  onRefresh,
}: GlobalTopBarProps) {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={S.hdr}>
      <View style={S.brandWrap}>
        <Brand size={23} />
      </View>

      <View style={S.actions}>
        {/* Dev reload button (only in dev mode) */}
        {__DEV__ && onRefresh && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Metro kodunu yeniden yükle"
            style={({ pressed }) => [S.devBtn, pressed && S.btnPre]}
            disabled={refreshing}
            onPress={async () => {
              if (refreshing) return;
              try {
                setRefreshing(true);
                DevSettings.reload();
              } finally {
                setRefreshing(false);
              }
            }}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Ionicons name="refresh" size={14} color={C.primary} />
            )}
          </Pressable>
        )}

        {/* 1. Streak Chip: Leaf icon + 3 gün */}
        <View
          accessibilityRole="text"
          accessibilityLabel={`${streak} ${streakLabel}`}
          style={S.streak}
        >
          <Ionicons name="leaf" size={13} color={C.primary} />
          <Text style={S.streakTxt}>{formatDays(streak, locale)}</Text>
        </View>

        {/* 2. Level Selector Chip: Compact [A1] ⌄ */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${levelLabel}: ${level}`}
          accessibilityHint="Seviye seçicisini aç"
          style={({ pressed }) => [S.level, pressed && S.btnPre]}
          onPress={onLevelPress}
        >
          <View style={S.levelBadge}>
            <Text style={S.levelBadgeTxt}>{level}</Text>
          </View>
          <Ionicons name="chevron-down" size={11} color={C.muted} />
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
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 6,
    backgroundColor: C.canvas,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    minHeight: 46,
  },
  brandWrap: {
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  devBtn: {
    width: 28,
    height: 32,
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
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 9,
    minHeight: 32,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  streakTxt: {
    color: C.ink,
    fontSize: 11.5,
    fontWeight: "800",
  },
  level: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 7,
    minHeight: 32,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  levelBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeTxt: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
  },
});
