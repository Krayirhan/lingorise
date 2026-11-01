export interface SpeechVoice { identifier: string; language: string; quality: string }

/** Prefer a higher-quality voice in the requested locale; never select another language. */
export function selectSpeechVoice(voices: readonly SpeechVoice[], language: string): string | undefined {
  const requested = language.toLowerCase().replace(/_/g, "-");
  const primary = requested.split("-")[0];
  const matches = voices.filter((voice) => voice.identifier && voice.language.toLowerCase().replace(/_/g, "-").split("-")[0] === primary);
  const exact = matches.filter((voice) => voice.language.toLowerCase().replace(/_/g, "-") === requested);
  return exact.find((voice) => voice.quality === "Enhanced")?.identifier
    ?? exact[0]?.identifier
    ?? matches.find((voice) => voice.quality === "Enhanced")?.identifier
    ?? matches[0]?.identifier;
}

/** IPA is display text, not speech input. */
export function englishSpeechText(word: string, pronunciation?: string): string {
  const candidate = pronunciation?.trim();
  if (!candidate || /^[/[].*[/\]]$/.test(candidate) || /[\u0250-\u02af\u1d00-\u1d7fˈˌ]/u.test(candidate)) return word;
  return candidate;
}
