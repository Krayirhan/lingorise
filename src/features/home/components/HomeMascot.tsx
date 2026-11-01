import { Image, StyleSheet, View } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sprig = require("../../../../assets/sprig-mascot-idle-transparent.png");

/** The Sprig mascot standing on a soft patch of ground. */
export function HomeMascot() {
  return (
    <View accessible={false} pointerEvents="none" style={S.wrap}>
      <View style={S.ground} />
      <Image source={sprig} style={S.image} resizeMode="contain" />
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    width: 100,
    height: 125,
    marginLeft: "auto",
    marginRight: -4,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  ground: {
    position: "absolute",
    bottom: 4,
    width: 92,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(78, 125, 73, 0.16)",
  },
  image: {
    width: 96,
    height: 120,
  },
});
