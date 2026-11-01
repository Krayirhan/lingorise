import { Switch } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { SettingsRow } from "./SettingsRow";

interface Props {
  copy: Copy;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  reduceMotion?: boolean;
  onNotificationToggle?: (enabled: boolean) => void;
  onSoundToggle?: (enabled: boolean) => void;
  onReduceMotionToggle?: (reduced: boolean) => void;
}

const trackColor = { false: C.line, true: C.attentionStrong };

/** Reminder, sound and motion toggles as rows of the preferences group. */
export function SoundAndMotionCard({
  copy,
  notificationsEnabled = true,
  soundEnabled = true,
  reduceMotion = false,
  onNotificationToggle,
  onSoundToggle,
  onReduceMotionToggle,
}: Props) {
  return (
    <>
      <SettingsRow
        icon="notifications-outline"
        tint={C.attentionSoft}
        title={copy.profile.remindersTitle}
        right={
          <Switch
            value={notificationsEnabled}
            onValueChange={onNotificationToggle}
            trackColor={trackColor}
            thumbColor={C.surface}
            accessibilityLabel={copy.profile.remindersTitle}
          />
        }
      />
      <SettingsRow
        icon="volume-medium-outline"
        tint={C.rewardSoft}
        title={copy.profile.soundEffectsTitle}
        right={
          <Switch
            value={soundEnabled}
            onValueChange={onSoundToggle}
            trackColor={trackColor}
            thumbColor={C.surface}
            accessibilityLabel={copy.profile.soundEffectsTitle}
          />
        }
      />
      <SettingsRow
        icon="pulse-outline"
        tint={C.successSoft}
        title={copy.profile.reduceMotionTitle}
        right={
          <Switch
            value={reduceMotion}
            onValueChange={onReduceMotionToggle}
            trackColor={trackColor}
            thumbColor={C.surface}
            accessibilityLabel={copy.profile.reduceMotionTitle}
          />
        }
      />
    </>
  );
}
