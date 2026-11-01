import { ScrollView, Text, View } from "react-native";
import { S } from "./ProfileScreen.styles";
import appConfig from "../../app.json";

import { ProfileScreenProps } from "../features/profile/profile.types";
import { LanguageSettingsCard } from "../features/profile/components/LanguageSettingsCard";
import { AccountManagementCard } from "../features/profile/components/AccountManagementCard";
import { SoundAndMotionCard } from "../features/profile/components/SoundAndMotionCard";
import { DataManagementCard } from "../features/profile/components/DataManagementCard";
import { DevClockCard } from "../features/profile/components/DevClockCard";
import { SettingsGroup } from "../features/profile/components/SettingsRow";

export function ProfileScreen({
  copy,
  locale,
  level,
  xp,
  streak,
  soundEnabled = true,
  reduceMotion = false,
  notificationsEnabled = true,
  displayName = "Lingterra Bahçıvanı",
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
          <Text style={S.pageEyebrow}>{copy.profile.pageEyebrow}</Text>
          <Text style={S.pageTitle}>{copy.profile.headerTitle}</Text>
        </View>

        {/* Identity, level and (for guests) the account-link hero card */}
        <AccountManagementCard
          copy={copy}
          displayName={displayName}
          avatarId={avatarId}
          onDisplayNameChange={onDisplayNameChange}
          onAvatarChange={onAvatarChange}
          onOpenAuth={onAccountPress || (() => {})}
          level={level}
          xp={xp}
          streak={streak}
          onChangeLevel={onChangeLevel}
        />

        <SettingsGroup title={copy.profile.preferencesSectionTitle}>
          <LanguageSettingsCard
            copy={copy}
            locale={locale}
            onLocaleChange={onLocaleChange}
          />
          <SoundAndMotionCard
            copy={copy}
            notificationsEnabled={notificationsEnabled}
            soundEnabled={soundEnabled}
            reduceMotion={reduceMotion}
            onNotificationToggle={onNotificationToggle}
            onSoundToggle={onSoundToggle}
            onReduceMotionToggle={onReduceMotionToggle}
          />
        </SettingsGroup>

        {/* Data & Privacy */}
        <DataManagementCard copy={copy} onDataReset={onDataReset} />

        {/* Dev-only: renders nothing in a release build */}
        <DevClockCard onRefresh={onRefresh} locale={locale} reduceMotion={reduceMotion} />

        {/* About Lingterra */}
        <View style={S.aboutCard}>
          <Text style={S.aboutTitle}>
            {copy.profile.aboutTitle} · {(copy.profile.versionLabel).replace("{version}", appConfig.expo.version)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
