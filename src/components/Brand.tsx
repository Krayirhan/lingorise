import { Image, StyleSheet, Text, View } from "react-native";
import { C } from "../theme/colors";

const appIcon = require("../../assets/lingorise-app-icon.png");

interface BrandProps {
  size?: number;
}

export function Brand({ size = 23 }: BrandProps) {
  const iconSize = Math.round(size * 0.82);

  return (
    <View style={styles.container}>
      <Image
        source={appIcon}
        style={[styles.icon, { width: iconSize, height: iconSize, borderRadius: Math.round(iconSize * 0.26) }]}
        accessibilityLabel="LingoRise logosu"
        accessibilityIgnoresInvertColors
      />
      <Text style={[styles.logo, { fontSize: size - 2 }]} numberOfLines={1}>
        Lingo<Text style={styles.accent}>Rise</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  icon: {
    backgroundColor: C.surface,
  },
  logo: {
    fontSize: 27,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.4,
  },
  accent: {
    color: C.primary,
  },
});
