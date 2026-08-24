import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, Platform, StyleSheet, View } from "react-native";
import { C, radius } from "../theme/colors";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: object;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = radius.sm || 8,
  style,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        S.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={S.cardSkeleton}>
      <View style={S.row}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={S.textCol}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={10} borderRadius={5} style={{ marginTop: 12 }} />
    </View>
  );
}

const S = StyleSheet.create({
  skeleton: {
    backgroundColor: C.line,
  },
  cardSkeleton: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 10,
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textCol: {
    flex: 1,
    gap: 4,
  },
});
