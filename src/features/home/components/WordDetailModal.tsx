import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { RecommendedWordData } from "../home.types";
import { speechService } from "../../../services/speechService";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { getTopicLabel } from "../topicLabel";

interface Props {
  copy: Copy;
  wordData: RecommendedWordData | null;
  visible: boolean;
  onPracticeWord: (wordData: RecommendedWordData) => void;
  onClose: () => void;
  reduceMotion?: boolean;
}

export function WordDetailModal({ copy, wordData, visible, onPracticeWord, onClose, reduceMotion }: Props) {
  if (!visible || !wordData) return null;

  const handleAudio = () => {
    speechService.speak(wordData.pronunciation || wordData.word, { language: "en-US", rate: 0.85 });
  };

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.card}>
          <View style={S.topRow}>
            <View style={S.badge}><Text style={S.badgeTxt}>{wordData.level} · {getTopicLabel(copy, wordData.topic)}</Text></View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
              style={S.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={C.muted} />
            </Pressable>
          </View>

          <View style={S.wordRow}>
            <View style={S.wordInfo}>
              <Text style={S.word}>{wordData.word}</Text>
              {wordData.phonetic && <Text style={S.phonetic}>{wordData.phonetic}</Text>}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home?.wordDetailListen || "Dinle"}
              style={({ pressed }) => [S.audioBtn, pressed && S.audioBtnPre]}
              onPress={handleAudio}
            >
              <Ionicons name="volume-medium" size={22} color={C.primary} />
            </Pressable>
          </View>

          <View style={S.meaningBox}>
            <Text style={S.meaningTitle}>Türkçe Karşılığı</Text>
            <Text style={S.meaningTxt}>“{wordData.meaning}”</Text>
          </View>

          {wordData.exampleSentence && (
            <View style={S.exampleBox}>
              <Text style={S.exampleTitle}>{copy.home?.wordDetailExample || "Cümle içi kullanım"}</Text>
              {wordData.exampleTranslation && <Text style={S.exampleTr}>{wordData.exampleTranslation}</Text>}
              <Text style={S.exampleEn}>{wordData.exampleSentence}</Text>
            </View>
          )}

          <View style={S.actions}>
            <PrimaryButton label={copy.home?.wordDetailPracticeBtn || "Bu Kelimeyi Çalış"} onPress={() => { onClose(); onPracticeWord(wordData); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(28, 27, 26, 0.5)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  card: { width: "100%", maxWidth: 380, backgroundColor: C.surface, borderRadius: radius.xl, padding: 22, gap: 14, borderWidth: 1, borderColor: C.line, elevation: 6 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { backgroundColor: C.primarySoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.xs },
  badgeTxt: { color: C.primary, fontSize: 11, fontWeight: "800" },
  closeBtn: { padding: 4 },
  wordRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordInfo: { flex: 1, gap: 2 },
  word: { color: C.ink, fontSize: 26, fontWeight: "800" },
  phonetic: { color: C.muted, fontSize: 13, fontStyle: "italic" },
  audioBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },
  audioBtnPre: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  meaningBox: { backgroundColor: C.canvas, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: C.line, gap: 2 },
  meaningTitle: { color: C.muted, fontSize: 11, fontWeight: "700" },
  meaningTxt: { color: C.primary, fontSize: 16, fontWeight: "800" },
  exampleBox: { backgroundColor: C.rewardSoft, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: C.rewardBorder, gap: 2 },
  exampleTitle: { color: C.rewardText, fontSize: 11, fontWeight: "800" },
  exampleEn: { color: C.muted, fontSize: 12, fontStyle: "italic" },
  exampleTr: { color: C.ink, fontSize: 13.5, fontWeight: "700" },
  actions: { marginTop: 4 },
});
