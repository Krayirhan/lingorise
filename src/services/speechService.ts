import * as Speech from "expo-speech";

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
    try {
      const isSpeaking = await Speech.isSpeakingAsync().catch(() => false);
      if (isSpeaking) {
        await Speech.stop().catch(() => {});
      }

      Speech.speak(text, {
        language: options?.language || "en-US",
        rate: options?.rate || 0.85,
        pitch: options?.pitch || 1.0,
        onStart: options?.onStart,
        onDone: options?.onDone,
        onStopped: options?.onStopped,
        onError: (err) => {
          options?.onError?.(new Error(String(err)));
        },
      });
    } catch (err) {
      options?.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  },

  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch {}
  },

  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  },
};
