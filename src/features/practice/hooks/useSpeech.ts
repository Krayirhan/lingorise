import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, AppState, AppStateStatus } from "react-native";
import { useApplication } from "../../../context/ApplicationContext";
import { englishSpeechText } from "../../../domain/speech/voice";


export function useSpeech(wordPrompt: string, pronunciationText?: string, enabled = true, reduceMotion = false) {
  const application = useApplication();
  const { speechService } = application;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioPulse = useRef(new Animated.Value(1)).current;

  // Pulse animation loop
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (isSpeaking && !reduceMotion) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(audioPulse, {
            toValue: 1.1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(audioPulse, {
            toValue: 1.0,
            duration: 260,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      audioPulse.setValue(1);
    }
    return () => {
      pulseLoop?.stop();
    };
  }, [isSpeaking, reduceMotion, audioPulse]);

  // AppState background safety cleanup
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        speechService.stop();
        setIsSpeaking(false);
      }
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      sub.remove();
      speechService.stop();
    };
  }, []);

  // Cleanup on word change
  useEffect(() => {
    setIsSpeaking(false);
    setAudioError(false);
    return () => {
      speechService.stop();
    };
  }, [wordPrompt]);

  const toggleSpeech = useCallback(async () => {
    if (!enabled) return;
    if (isSpeaking) {
      await speechService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    setAudioError(false);
    await speechService.speak(englishSpeechText(wordPrompt, pronunciationText), {
      language: "en-US",
      rate: 0.9,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setAudioError(true);
      },
    });
  }, [enabled, isSpeaking, pronunciationText, wordPrompt]);

  const stopSpeech = useCallback(async () => {
    await speechService.stop();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    audioError,
    audioPulse,
    isEnabled: enabled,
    toggleSpeech,
    stopSpeech,
  };
}
