import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BackHandler, Image, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, View } from "react-native";
import { C, radius, spacing } from "../theme/colors";

const mascot = require("../../assets/sprig-mascot.png");
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
          <View style={S.titleCopy}>
            <Text style={S.pageEyebrow}>{copy.profile?.pageEyebrow || "HESAP & AYARLAR"}</Text>
            <Text style={S.pageTitle}>{copy.profile?.headerTitle || "Profil"}</Text>
          </View>
          {/* Same brand mascot as onboarding, scaled down as a quiet
              brand-continuity signature (CD-003) — not a new dashboard section. */}
          <View style={S.titleMascotWrap} accessible={false} importantForAccessibility="no">
            <Image source={mascot} style={S.titleMascot} resizeMode="contain" accessible={false} importantForAccessibility="no" />
          </View>
        </View>

        {/* Identity group — who the learner is and how they're doing.
            Grouped under the account/sync eyebrow (previously defined in
            copy but never wired to a heading) so it visually reads as one
            "this is me" zone instead of two flat, equal-weight cards. */}
        <View style={S.group}>
          <Text style={S.groupLabel}>
            {copy.profile?.accountSectionTitle || "Hesap & Bulut Senkronizasyonu"}
          </Text>

          <AccountManagementCard
            copy={copy}
            displayName={displayName}
            avatarId={avatarId}
            onDisplayNameChange={onDisplayNameChange}
            onAvatarChange={onAvatarChange}
            onOpenAuth={onAccountPress || (() => {})}
          />

          <ProfileStatsCard
            copy={copy}
            level={level}
            xp={xp}
            streak={streak}
            onChangeLevel={onChangeLevel}
          />
        </View>

        {/* Preferences group — language, reminders, sound/motion are the
            three genuinely homogeneous toggles; grouping them under one
            eyebrow stops them reading as three unrelated flat cards. */}
        <View style={S.group}>
          <Text style={S.groupLabel}>
            {copy.profile?.preferencesSectionTitle || "Tercihler"}
          </Text>

          <LanguageSettingsCard
            copy={copy}
            locale={locale}
            onLocaleChange={onLocaleChange}
          />

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

          <SoundAndMotionCard
            copy={copy}
            soundEnabled={soundEnabled}
            reduceMotion={reduceMotion}
            onSoundToggle={onSoundToggle}
            onReduceMotionToggle={onReduceMotionToggle}
          />
        </View>

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
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 4 },
  titleCopy: { gap: 2 },
  titleMascotWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  titleMascot: { width: 50, height: 50 },
  pageEyebrow: { color: C.primary, fontSize: 11.5, fontWeight: "800", letterSpacing: 1.2 },
  pageTitle: { color: C.ink, fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 16, paddingBottom: 28 },
  group: { gap: 12 },
  groupLabel: { color: C.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1.1, marginLeft: 2 },
  settingCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface, padding: 16, borderRadius: radius.lg || 18, borderWidth: 1, borderColor: C.line, gap: 10 },
  settingCopy: { flex: 1 },
  settingTitle: { color: C.ink, fontSize: 15, fontWeight: "800" },
  settingSub: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  aboutCard: { backgroundColor: C.surface, padding: 16, borderRadius: radius.lg || 18, borderWidth: 1, borderColor: C.line, gap: 6 },
  aboutTitle: { color: C.ink, fontSize: 14, fontWeight: "800" },
  aboutBody: { color: C.muted, fontSize: 12, lineHeight: 17 },
});
