import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BackHandler, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";
import { ProfileScreenProps } from "../features/profile/profile.types";
import { ProfileStatsCard } from "../features/profile/components/ProfileStatsCard";
import { LanguageSettingsCard } from "../features/profile/components/LanguageSettingsCard";
import { AccountManagementCard } from "../features/profile/components/AccountManagementCard";
import { SoundAndMotionCard } from "../features/profile/components/SoundAndMotionCard";
import { DataManagementCard } from "../features/profile/components/DataManagementCard";
import { DevClockCard } from "../features/profile/components/DevClockCard";

export function ProfileScreen({
  copy,
  locale,
  level,
  xp,
  streak,
  unlockedBadges,
  soundEnabled = true,
  reduceMotion = false,
  notificationsEnabled = true,
  displayName = "LingoRise Bahçıvanı",
  avatarId = "sprig",
  onSoundToggle,
  onReduceMotionToggle,
  onNotificationToggle,
  onDisplayNameChange,
  onAvatarChange,
  onDataReset,
  onLocaleChange,
  onChangeLevel,
  onAccountPress,
  onRefresh,
}: ProfileScreenProps) {
  return (
    <View style={S.root}>
      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={S.titleRow}>
          <Text style={S.pageEyebrow}>{copy.profile?.pageEyebrow || "HESAP & AYARLAR"}</Text>
          <Text style={S.pageTitle}>{copy.profile?.headerTitle || "Profil"}</Text>
        </View>

        {/* Account & Cloud Sync Management Card */}
        <AccountManagementCard
          copy={copy}
          displayName={displayName}
          avatarId={avatarId}
          onDisplayNameChange={onDisplayNameChange}
          onAvatarChange={onAvatarChange}
          onOpenAuth={onAccountPress || (() => {})}
        />

        {/* User Stats Card */}
        <ProfileStatsCard
          copy={copy}
          level={level}
          xp={xp}
          streak={streak}
          onChangeLevel={onChangeLevel}
        />

        {/* Language Selection Card */}
        <LanguageSettingsCard
          copy={copy}
          locale={locale}
          onLocaleChange={onLocaleChange}
        />

        {/* Daily Reminders Toggle */}
        <View style={S.settingCard}>
          <View style={S.settingCopy}>
            <Text style={S.settingTitle}>{copy.profile?.remindersTitle || "Günlük Hatırlatıcılar"}</Text>
            <Text style={S.settingSub}>{copy.profile?.remindersSubtitle || "Her gün düzenli pratik için nazik bir bildirim al"}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onNotificationToggle}
            trackColor={{ false: C.line, true: C.primary }}
            thumbColor={C.white}
            accessibilityLabel={copy.profile?.remindersTitle || "Günlük Hatırlatıcılar"}
          />
        </View>

        {/* Sound & Animation Accessibility Card */}
        <SoundAndMotionCard
          copy={copy}
          soundEnabled={soundEnabled}
          reduceMotion={reduceMotion}
          onSoundToggle={onSoundToggle}
          onReduceMotionToggle={onReduceMotionToggle}
        />

        {/* Data & Privacy Card */}
        <DataManagementCard copy={copy} onDataReset={onDataReset} />

        {/* Dev-only: renders nothing in a release build */}
        <DevClockCard onRefresh={onRefresh} />

        {/* Badges Grid */}

        {/* About LingoRise Card */}
        <View style={S.aboutCard}>
          <Text style={S.aboutTitle}>{copy.profile?.aboutTitle || "LingoRise Hakkında"}</Text>
          <Text style={S.aboutBody}>{copy.profile?.aboutBody || "LingoRise, kelime öğrenimini yeşeren bir botanik alışkanlığa dönüştürür. Sürüm 0.1.0"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, maxWidth: 580, width: "100%", alignSelf: "center" },
  titleRow: { gap: 2, marginTop: 4, marginBottom: 4 },
  pageEyebrow: { color: C.primary, fontSize: 11.5, fontWeight: "800", letterSpacing: 1.2 },
  pageTitle: { color: C.ink, fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 16, paddingBottom: 28 },
  settingCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface, padding: 16, borderRadius: radius.lg || 18, borderWidth: 1, borderColor: C.line, gap: 10 },
  settingCopy: { flex: 1 },
  settingTitle: { color: C.ink, fontSize: 15, fontWeight: "800" },
  settingSub: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  aboutCard: { backgroundColor: C.surface, padding: 16, borderRadius: radius.lg || 18, borderWidth: 1, borderColor: C.line, gap: 6 },
  aboutTitle: { color: C.ink, fontSize: 14, fontWeight: "800" },
  aboutBody: { color: C.muted, fontSize: 12, lineHeight: 17 },
});
