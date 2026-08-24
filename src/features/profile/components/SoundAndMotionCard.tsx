import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  soundEnabled?: boolean;
  reduceMotion?: boolean;
  onSoundToggle?: (enabled: boolean) => void;
  onReduceMotionToggle?: (reduced: boolean) => void;
}

export function SoundAndMotionCard({
  copy,
  soundEnabled = true,
  reduceMotion = false,
  onSoundToggle,
  onReduceMotionToggle,
}: Props) {
  return (
    <View style={S.card}>
      <Text style={S.headerTitle}>{copy.profile?.soundAndMotionHeader || "Ses ve Animasyon"}</Text>

      {/* Sound Effects Toggle */}
      <View style={S.row}>
        <View style={S.copy}>
          <Text style={S.title}>{copy.profile?.soundEffectsTitle || "Ses Efektleri"}</Text>
          <Text style={S.sub}>{copy.profile?.soundEffectsSub || "Doğru ve yanlış cevap sesleri"}</Text>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={onSoundToggle}
          trackColor={{ false: C.line, true: C.primary }}
          thumbColor={C.white}
          accessibilityLabel={copy.profile?.soundEffectsTitle || "Ses Efektleri"}
        />
      </View>

      <View style={S.divider} />

      {/* Motion Reduction Toggle */}
      <View style={S.row}>
        <View style={S.copy}>
          <Text style={S.title}>{copy.profile?.reduceMotionTitle || "Hareketi Azalt"}</Text>
          <Text style={S.sub}>{copy.profile?.reduceMotionSub || "Gereksiz animasyonları kapat"}</Text>
        </View>
        <Switch
          value={reduceMotion}
          onValueChange={onReduceMotionToggle}
          trackColor={{ false: C.line, true: C.primary }}
          thumbColor={C.white}
          accessibilityLabel={copy.profile?.reduceMotionTitle || "Hareketi Azalt"}
        />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  headerTitle: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontSize: 14.5,
    fontWeight: "700",
  },
  sub: {
    color: C.muted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: C.lineSoft,
  },
});
