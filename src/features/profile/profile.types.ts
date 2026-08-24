import { Copy, Locale } from "../../i18n/en";
import { LevelCode } from "../../types/content";

export interface ProfileScreenProps {
  copy: Copy;
  locale: Locale;
  level: LevelCode;
  xp: number;
  streak: number;
  unlockedBadges: string[];
  soundEnabled?: boolean;
  reduceMotion?: boolean;
  notificationsEnabled?: boolean;
  displayName?: string;
  avatarId?: string;
  onSoundToggle?: (enabled: boolean) => void;
  onReduceMotionToggle?: (reduced: boolean) => void;
  onNotificationToggle?: (enabled: boolean) => void;
  onDisplayNameChange?: (name: string) => void;
  onAvatarChange?: (avatarId: string) => void;
  onDataReset?: () => void;
  onLocaleChange: (locale: Locale) => void;
  onChangeLevel: () => void;
  onBack: () => void;
  onAccountPress?: () => void;
  onTabPress?: (tab: "garden" | "practice" | "progress" | "profile") => void;
}
