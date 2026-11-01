import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";

const SIZE = 96;
const DOT = 8;
const MAX_DOTS = 30;

/** Today's words as seeds around a circle; one fills for each word answered. */
export function SeedRing({ completed, target }: { completed: number; target: number }) {
  const count = Math.max(1, Math.min(target, MAX_DOTS));
  const filled = target > 0 ? Math.round((Math.min(completed, target) / target) * count) : 0;
  const radius = SIZE / 2 - DOT;

  return (
    <View accessible={false} style={S.wrap}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        return (
          <View
            key={index}
            style={[
              S.dot,
              index < filled && S.dotFilled,
              {
                left: SIZE / 2 + radius * Math.cos(angle) - DOT / 2,
                top: SIZE / 2 + radius * Math.sin(angle) - DOT / 2,
              },
            ]}
          />
        );
      })}
      <View style={S.center}>
        <Ionicons name="leaf" size={16} color="#CFE3C4" />
        <Text style={S.count}>{Math.min(completed, target)}</Text>
        <Text style={S.total}>/ {target}</Text>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE },
  dot: {
    position: "absolute",
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: "rgba(251, 247, 240, 0.28)",
  },
  dotFilled: { backgroundColor: C.surface },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  count: { color: C.surface, fontFamily: fonts.bodyBold, fontSize: 30, lineHeight: 34 },
  total: { color: C.surface, fontFamily: fonts.bodySemi, fontSize: 13 },
});
