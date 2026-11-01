import { useCallback } from "react";
import { useApplication } from "../context/ApplicationContext";
import { englishSpeechText } from "../domain/speech/voice";

/** Speaks an English word (or its spoken pronunciation hint) through the app's speech service. */
export function useSpeakWord() {
  const { speechService } = useApplication();
  return useCallback((word: string, pronunciation?: string, rate = 0.9) => {
    speechService.speak(englishSpeechText(word, pronunciation), { language: "en-US", rate });
  }, [speechService]);
}
