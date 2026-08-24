import { StyleSheet, Text, View } from "react-native";
import { LevelCard } from "../../../components/LevelCard";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { levels } from "../../../content/levels";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { LevelCode } from "../../../types/content";

interface Props {
  copy: Copy;
  level: LevelCode | null;
  onLevel: (level: LevelCode) => void;
  onComplete: () => void;
}

export function LevelStep({ copy, level, onLevel, onComplete }: Props) {
  return (
    <View style={S.container}>
      <Text style={S.eyebrow}>SEVİYENİ SEÇ</Text>
      <Text style={S.hero}>Yolculuğun nereden başlasın?</Text>
      <Text style={S.subtitle}>İlerledikçe seviyeni dilediğin zaman değiştirebilirsin.</Text>

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
          label={level ? `${level} seviyesinde başla` : "Seviye seç"}
          disabled={!level}
          onPress={onComplete}
        />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  eyebrow: { color: C.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  hero: { color: C.ink, fontSize: 30, lineHeight: 36, fontWeight: "800", marginTop: 4 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22 },
  levels: { gap: 8, marginTop: 6 },
  buttonWrapper: { marginTop: 14 },
});
