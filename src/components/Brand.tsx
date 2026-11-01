import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C } from "../theme/colors";
import { fonts } from "../theme/typography";

interface BrandProps {
  size?: number;
}

export function Brand({ size = 25 }: BrandProps) {
  const leafSize = Math.round(size * 0.92);

  return (
    <View style={styles.container} accessibilityLabel="Lingterra logosu">
      <View style={styles.leafMark}>
        <Ionicons
          name="leaf"
          size={leafSize}
          color={C.primary}
          style={styles.leafLeft}
        />
        <Ionicons
          name="leaf"
          size={Math.round(leafSize * 0.78)}
          color={C.growth}
          style={styles.leafRight}
        />
      </View>
      <Text style={[styles.logo, { fontSize: size }]} numberOfLines={1}>
        Lingterra
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  leafMark: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: -2,
  },
  leafLeft: {
    transform: [{ rotate: "-32deg" }, { scaleX: -1 }],
  },
  leafRight: {
    marginLeft: -8,
    transform: [{ rotate: "24deg" }],
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 25,
    color: C.primary,
    letterSpacing: -0.3,
  },
});
