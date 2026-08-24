import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { RecommendedWordData } from "../home.types";
import { speechService } from "../../../services/speechService";
import { getTopicLabel } from "../topicLabel";

interface Props {
  copy: Copy;
  recommendedWord: RecommendedWordData;
  onPress: () => void;
}

export function RecommendedWordCard({ copy, recommendedWord, onPress }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!recommendedWord) return null;

  const handleAudio = (e: any) => {
    e?.stopPropagation?.();
    setIsPlaying(true);
    speechService.speak(
      recommendedWord.pronunciation || recommendedWord.word,
      { language: "en-US", rate: 0.85 }
    );
    setTimeout(() => {
      setIsPlaying(false);
    }, 1400);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Günün kelimesi: ${recommendedWord.word}, Anlamı: ${recommendedWord.meaning}`}
      accessibilityHint="Bu kelimeyle pratik başlatır"
      style={({ pressed }) => [S.card, pressed && S.pressed]}
      onPress={onPress}
    >
      {/* Header with Word of Day & Badges */}
      <View style={S.hdr}>
        <View style={S.tag}>
          <Text style={S.tagTxt}>
            {copy.home?.recommendedHeader || "GÜNÜN KELİMESİ"}
          </Text>
        </View>
        <View style={S.metaRow}>
          <View style={S.typeTag}>
            <Text style={S.typeTxt}>
              {getTopicLabel(copy, recommendedWord.topic)}
            </Text>
          </View>
          <View style={S.lvlTag}>
            <Text style={S.lvlTxt}>{recommendedWord.level}</Text>
          </View>
        </View>
      </View>

      {/* Word & Phonetic Details */}
      <View style={S.body}>
        <View style={S.textGrp}>
          <View style={S.wordRow}>
            <Text style={S.word}>{recommendedWord.word}</Text>
            {recommendedWord.phonetic && (
              <Text style={S.pho}>{recommendedWord.phonetic}</Text>
            )}
          </View>
          <Text style={S.mean}>{recommendedWord.meaning}</Text>
        </View>

        {/* Example Sentence Section if Available */}
        {recommendedWord.exampleSentence ? (
          <View style={S.exampleBox}>
            {recommendedWord.exampleTranslation && (
              <Text style={S.exampleTr}>{recommendedWord.exampleTranslation}</Text>
            )}
            <Text style={S.exampleEn}>{recommendedWord.exampleSentence}</Text>
          </View>
        ) : (
          <View style={S.exampleBox}>
            <Text style={S.exampleTr}>“{recommendedWord.word}” kelimesini basit bir cümlede öğren ve kullan.</Text>
            <Text style={S.exampleEn}>Learn and use the word “{recommendedWord.word}” in a simple sentence.</Text>
          </View>
        )}
      </View>

      {/* Labeled Audio Playback Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.home?.listenAudioBtn || "Telaffuzu dinle"}
        style={({ pressed }) => [
          S.audioBtn,
          isPlaying && S.audioBtnPlaying,
          pressed && S.audioBtnPressed,
        ]}
        onPress={handleAudio}
      >
        <Ionicons
          name={isPlaying ? "volume-high" : "volume-medium"}
          size={18}
          color={isPlaying ? C.attentionText : C.primary}
        />
        <Text style={[S.audioBtnTxt, isPlaying && S.audioBtnTxtPlaying]}>
          {isPlaying
            ? copy.home?.playingAudio || "Çalınıyor..."
            : copy.home?.listenAudioBtn || "Telaffuzu dinle"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tagTxt: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeTag: {
    backgroundColor: C.canvas,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.xs,
  },
  typeTxt: {
    color: C.muted,
    fontSize: 10.5,
    fontWeight: "700",
  },
  lvlTag: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radius.xs,
  },
  lvlTxt: {
    color: C.primary,
    fontSize: 10.5,
    fontWeight: "700",
  },
  body: {
    gap: 10,
  },
  textGrp: {
    gap: 2,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  word: {
    color: C.ink,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  pho: {
    color: C.muted,
    fontSize: 13.5,
    fontStyle: "italic",
  },
  mean: {
    color: C.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  exampleBox: {
    backgroundColor: C.canvas,
    padding: 12,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    gap: 4,
  },
  exampleEn: {
    color: C.muted,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 17,
  },
  exampleTr: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19,
  },
  audioBtn: {
    minHeight: 46,
    borderRadius: radius.button || 16,
    backgroundColor: C.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  audioBtnPlaying: {
    backgroundColor: "#FCE1DC",
  },
  audioBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  audioBtnTxt: {
    color: C.primary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  audioBtnTxtPlaying: {
    color: C.attentionText,
  },
});

