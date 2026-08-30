import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Copy } from "../../../i18n/en";
import { C, spacing } from "../../../theme/colors";

const mascot = require("../../../../assets/sprig-mascot.png");

interface Props {
  copy: Copy;
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ copy, onNext, onSkip }: Props) {
  return (
    <View style={S.container}>
      <View style={S.gardenArt} accessible={false} importantForAccessibility="no">
        <Image source={mascot} style={S.mascot} resizeMode="contain" accessible={false} importantForAccessibility="no" />
      </View>
      <Text style={S.eyebrow}>{copy.onboarding.welcomeKicker}</Text>
      <Text style={S.hero}>{copy.onboarding.welcomeTitle}</Text>
      <Text style={S.subtitle}>{copy.onboarding.welcomeBody}</Text>
      <View style={S.bottom}>
        <PrimaryButton label={copy.onboarding.start} onPress={onNext} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.onboarding.skip}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          onPress={onSkip}
        >
          <Text style={S.skip}>{copy.onboarding.skip}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
  gardenArt: { alignSelf: "center", width: 198, height: 198, borderRadius: 62, backgroundColor: C.canvasWarm, alignItems: "center", justifyContent: "center", marginTop: 26, overflow: "hidden" },
  mascot: { width: 194, height: 194 },
  eyebrow: { color: C.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginTop: 24 },
  hero: { color: C.ink, fontSize: 30, lineHeight: 36, fontWeight: "800", marginTop: 16 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 16 },
  bottom: { gap: 8, marginTop: "auto", paddingTop: 22 },
  skip: { textAlign: "center", color: C.muted, fontWeight: "700", padding: 6 },
});
