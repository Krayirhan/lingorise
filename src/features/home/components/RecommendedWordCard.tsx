import { useApplication } from "../../../context/ApplicationContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { RecommendedWordData } from "../home.types";
import { fonts, typeScale } from "../../../theme/typography";
import { englishSpeechText } from "../../../domain/speech/voice";


interface Props {
  copy: Copy;
  recommendedWord: RecommendedWordData;
  onPress: () => void;
}

export function RecommendedWordCard({ copy, recommendedWord, onPress }: Props) {
  const application = useApplication();
  const { speechService } = application;

  const [isPlaying, setIsPlaying] = useState(false);

  if (!recommendedWord) return null;

  const accessibilityLabel = (copy.home?.recommendedWordAccessibility || "{word}: {meaning}")
    .replace("{word}", recommendedWord.word)
    .replace("{meaning}", recommendedWord.meaning);
  const handleAudio = (event: GestureResponderEvent) => {
    event?.stopPropagation?.();
    setIsPlaying(true);
    speechService.speak(englishSpeechText(recommendedWord.word, recommendedWord.pronunciation), {
      language: "en-US",
      rate: 0.9,
    });
    setTimeout(() => setIsPlaying(false), 1400);
  };

  const contextLine = recommendedWord.exampleTranslation
    ? `${recommendedWord.meaning} · ${recommendedWord.exampleTranslation}`
    : recommendedWord.meaning;

  return (
    <View style={S.section}>
      <View style={S.headerRow}>
        <Text style={S.header}>
          {copy.home?.recommendedHeader === "GÜNÜN KELİMESİ"
            ? "Günün Kelimesi"
            : copy.home?.recommendedHeader || "Günün Kelimesi"}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={copy.home?.recommendedWordDetailsHint || ""}
        style={({ pressed }) => [S.card, pressed && S.pressed]}
        onPress={onPress}
      >
        <View style={S.glyph}>
          <Ionicons name="leaf" size={26} color={C.success} />
        </View>

        <View style={S.wordCopy}>
          <Text style={S.eyebrow}>
            {recommendedWord.level} · {copy.home?.vocabulary ? copy.home.vocabulary.split(" ")[0].toUpperCase() : "KELİME"}
          </Text>
          <View style={S.wordLine}>
            <Text numberOfLines={1} style={S.word}>{recommendedWord.word}</Text>
            {recommendedWord.phonetic ? <Text style={S.phonetic}>{recommendedWord.phonetic}</Text> : null}
          </View>
          <Text numberOfLines={1} style={S.meaning}>{contextLine}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying
            ? copy.home?.playingAudio || "Çalınıyor"
            : copy.home?.listenAudioBtn || "Telaffuzu dinle"}
          style={({ pressed }) => [S.audioBtn, isPlaying && S.audioPlaying, pressed && S.audioPressed]}
          onPress={handleAudio}
        >
          <Ionicons name={isPlaying ? "volume-high-outline" : "volume-medium-outline"} size={22} color={C.primary} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const S = StyleSheet.create({
  section: {
    gap: 10,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  header: {
    color: C.primary,
    fontFamily: fonts.display,
    fontSize: typeScale.section,
  },
  seeAll: {
    color: C.attention,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  pressed: { opacity: 0.92 },
  glyph: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.successSoft, alignItems: "center", justifyContent: "center" },
  wordCopy: { flex: 1, minWidth: 0, justifyContent: "center", gap: 2 },
  eyebrow: {
    color: C.attention,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  wordLine: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 },
  word: { color: C.primary, fontFamily: fonts.display, fontSize: 22, lineHeight: 27 },
  phonetic: { color: C.muted, fontSize: 14.5 },
  meaning: { color: C.ink, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 18 },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.rewardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlaying: { backgroundColor: C.attentionSoft },
  audioPressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
});
