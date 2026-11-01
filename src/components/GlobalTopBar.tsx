import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, DevSettings, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Brand } from "./Brand";
import { C, radius } from "../theme/colors";
import { LevelCode } from "../domain/models/content";
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

  const courseName = locale === "tr" ? "İngilizce" : "English";

  return (
    <View style={S.hdr}>
      <View style={S.brandWrap}>
        <Brand size={25} />
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

        {/* Language & Level Pill Badge: [İNGİLİZCE · A1] */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${levelLabel}: ${level}, ${streak} ${streakLabel}`}
          accessibilityHint="Seviye seçicisini aç"
          style={({ pressed }) => [S.levelPill, pressed && S.btnPre]}
          onPress={onLevelPress}
        >
          <Text style={S.levelPillTxt}>
            {courseName} · {level}
          </Text>
          <Ionicons name="chevron-down" size={14} color={C.primary} />
        </Pressable>

        {/* Notification Bell Outline Icon */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === "tr" ? "Seviye ve bildirimler" : "Level and notifications"}
          style={({ pressed }) => [S.bellBtn, pressed && S.btnPre]}
          onPress={onLevelPress}
        >
          <Ionicons name="notifications-outline" size={22} color={C.primary} />
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
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 6,
    backgroundColor: C.canvas,
    minHeight: 50,
  },
  brandWrap: {
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  devBtn: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  btnPre: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 22,
    gap: 6,
  },
  levelPillTxt: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
});
