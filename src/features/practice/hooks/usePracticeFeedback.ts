import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, Vibration } from "react-native";

export function usePracticeFeedback(answered: boolean, correct: boolean, forceReduceMotion?: boolean) {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const isMotionReduced = forceReduceMotion ?? systemReduceMotion;

  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const feedbackShake = useRef(new Animated.Value(0)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;

  // Accessibility reduce motion listener
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setSystemReduceMotion(enabled))
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      setSystemReduceMotion(enabled);
    });
    return () => {
      sub?.remove?.();
    };
  }, []);

  // Feedback animation triggers
  useEffect(() => {
    if (!answered) return;

    if (correct) {
      try {
        if (Platform.OS !== "web") Vibration.vibrate(45);
      } catch {}

      if (isMotionReduced) {
        feedbackAnim.setValue(1);
        feedbackShake.setValue(0);
        leafAnim.setValue(1);
        xpAnim.setValue(1);
        mascotBounce.setValue(0);
        return;
      }

      feedbackAnim.setValue(0);
      feedbackShake.setValue(0);
      leafAnim.setValue(0);
      xpAnim.setValue(0);
      mascotBounce.setValue(0);

      Animated.parallel([
        Animated.spring(feedbackAnim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(50),
          Animated.spring(leafAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(80),
          Animated.spring(xpAnim, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(40),
          Animated.sequence([
            Animated.timing(mascotBounce, { toValue: -7, duration: 140, useNativeDriver: true }),
            Animated.timing(mascotBounce, { toValue: 0, duration: 140, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    } else {
      try {
        if (Platform.OS !== "web") Vibration.vibrate([0, 35, 40, 35]);
      } catch {}

      if (isMotionReduced) {
        feedbackAnim.setValue(1);
        feedbackShake.setValue(0);
        return;
      }

      feedbackAnim.setValue(0);
      feedbackShake.setValue(0);

      Animated.parallel([
        Animated.spring(feedbackAnim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(feedbackShake, { toValue: -6, duration: 45, useNativeDriver: true }),
          Animated.timing(feedbackShake, { toValue: 6, duration: 45, useNativeDriver: true }),
          Animated.timing(feedbackShake, { toValue: -3, duration: 40, useNativeDriver: true }),
          Animated.timing(feedbackShake, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [answered, correct, isMotionReduced, feedbackAnim, feedbackShake, leafAnim, xpAnim, mascotBounce]);

  return {
    isMotionReduced,
    feedbackAnim,
    feedbackShake,
    leafAnim,
    xpAnim,
    mascotBounce,
  };
}
