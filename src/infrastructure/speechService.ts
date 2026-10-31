import * as Speech from "expo-speech";
import { selectSpeechVoice } from "../domain/speech/voice";

const selectedVoices = new Map<string, string>();
let speechRequest = 0;

export interface SpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

export const speechService = {
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    const request = ++speechRequest;
    try {
      const isSpeaking = await Speech.isSpeakingAsync().catch(() => false);
      if (isSpeaking) {
        await Speech.stop().catch(() => { });
      }
      if (request !== speechRequest) return;
      const language = options?.language || "en-US";
      let voice = selectedVoices.get(language);
      if (!voice) {
        const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
        voice = selectSpeechVoice(voices, language);
        if (voice) selectedVoices.set(language, voice);
      }
      if (request !== speechRequest) return;
      const speakWithVoice = (selected?: string) => Speech.speak(text, {
        language,
        voice: selected,
        rate: options?.rate ?? 0.9,
        pitch: options?.pitch ?? 1.0,
        onStart: () => { if (request === speechRequest) options?.onStart?.(); },
        onDone: () => { if (request === speechRequest) options?.onDone?.(); },
        onStopped: () => { if (request === speechRequest) options?.onStopped?.(); },
        onError: (err) => {
          if (request !== speechRequest) return;
          if (selected) {
            selectedVoices.delete(language);
            try { speakWithVoice(); } catch (fallbackError) { options?.onError?.(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))); }
          } else {
            options?.onError?.(new Error(String(err)));
          }
        },
      });
      speakWithVoice(voice);
    } catch (err) {
      options?.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  },

  async stop(): Promise<void> {
    speechRequest++;
    try {
      await Speech.stop();
    } catch { }
  },

  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  },
};
