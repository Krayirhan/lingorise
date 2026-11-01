import { ProfileScreen } from "../../screens/ProfileScreen";
import { MainRouteDependencies } from "../mainRoute.types";

export function ProfileRoute({ userData, copy, userProgress, setLocale, setLevelSwitcherOpen, onAccountPress, session, handleTabPress }: MainRouteDependencies) {
  return (
    <ProfileScreen
      copy={copy}
      locale={userData.locale}
      level={userData.level}
      xp={userData.xp}
      streak={userData.streak}
      unlockedBadges={userData.unlockedBadges}
      soundEnabled={userData.soundEnabled}
      reduceMotion={userData.reduceMotion}
      notificationsEnabled={userData.notificationsEnabled}
      displayName={userData.displayName}
      avatarId={userData.avatarId}
      onSoundToggle={userProgress.setSoundEnabled}
      onReduceMotionToggle={userProgress.setReduceMotion}
      onNotificationToggle={userProgress.setNotificationsEnabled}
      onDisplayNameChange={userProgress.setDisplayName}
      onAvatarChange={userProgress.setAvatarId}
      onDataReset={userProgress.reloadLocalOnly}
      onRefresh={userProgress.refresh}
      onLocaleChange={setLocale}
      onChangeLevel={() => setLevelSwitcherOpen(true)}
      onBack={session.goToHome}
      onAccountPress={onAccountPress}
      onTabPress={handleTabPress}
    />
  );
}
