import { Image, StyleSheet, Text, View } from "react-native";
import { LevelCard } from "../../../components/LevelCard";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { levels } from "../../../content/levels";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { LevelCode } from "../../../types/content";

const mascot = require("../../../../assets/sprig-mascot.png");

interface Props {
  copy: Copy;
  level: LevelCode | null;
  onLevel: (level: LevelCode) => void;
  onComplete: () => void;
}

export function LevelStep({ copy, level, onLevel, onComplete }: Props) {
  const startButtonLabel = level
    ? `${level} · ${copy.onboarding?.start || "Hemen Başla"}`
    : (copy.onboarding?.chooseLevel || "Seviye seç");

  return (
    <View style={S.container}>
      {/* Same brand mascot as step 1/4, scaled down so it doesn't compete
          with the level list below (CD-003 continuity). */}
      <View style={S.gardenArt} accessible={false} importantForAccessibility="no">
        <Image source={mascot} style={S.mascot} resizeMode="contain" accessible={false} importantForAccessibility="no" />
      </View>

      <Text style={S.eyebrow}>{copy.onboarding?.journey || "İNGİLİZCE YOLCULUĞUN"}</Text>
      <Text style={S.hero}>{copy.onboarding?.levelTitle || "Başlangıç noktanı bul."}</Text>
      <Text style={S.subtitle}>{copy.onboarding?.levelBody || "Sana uygun seviyeyi seç. İstediğin zaman değiştirebilirsin."}</Text>

      <View style={S.levels}>
        {levels.map((item) => (
          <LevelCard
            key={item.code}
            level={item}
            selected={level === item.code}
            onPress={() => onLevel(item.code)}
          />
        ))}
      </View>

      <View style={S.buttonWrapper}>
        <PrimaryButton
          label={startButtonLabel}
          disabled={!level}
          onPress={onComplete}
        />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  gardenArt: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: C.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mascot: { width: 78, height: 78 },
  eyebrow: { color: C.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  hero: { color: C.ink, fontSize: 30, lineHeight: 36, fontWeight: "800", marginTop: 4 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22 },
  levels: { gap: 8, marginTop: 6 },
  buttonWrapper: { marginTop: 14 },
});
