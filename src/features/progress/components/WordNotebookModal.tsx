import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { allQuestions } from "../../../content/questions";
import { LevelCode, MeaningMatchQuestion } from "../../../types/content";
import { speechService } from "../../../services/speechService";
import { Copy } from "../../../i18n/en";
import { C, radius, spacing } from "../../../theme/colors";

interface Props {
  copy: Copy;
  visible: boolean;
  solvedQuestionIds: string[];
  onClose: () => void;
  onPracticeWord?: (question: MeaningMatchQuestion) => void;
  reduceMotion?: boolean;
}

const LEVELS: (LevelCode | "ALL")[] = ["ALL", "A1", "A2", "B1", "B2", "C1", "C2"];

export function WordNotebookModal({
  copy,
  visible,
  solvedQuestionIds,
  onClose,
  onPracticeWord,
  reduceMotion,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelCode | "ALL">("ALL");

  const filtered = allQuestions.filter((q) => {
    const word = (q.word || q.prompt || "").toLowerCase();
    const meaning = (q.meaning || q.answer || "").toLowerCase();
    const searchMatch =
      !query.trim() ||
      word.includes(query.toLowerCase().trim()) ||
      meaning.includes(query.toLowerCase().trim());
    const levelMatch =
      selectedLevel === "ALL" || q.level === selectedLevel;
    return searchMatch && levelMatch;
  });

  const handleSpeak = (q: MeaningMatchQuestion) => {
    const word = q.pronunciation || q.word || q.prompt || "";
    speechService.speak(word, { language: "en-US", rate: 0.85 });
  };

  return (
    <Modal visible={visible} animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose}>
      <SafeAreaView style={S.safe}>
        <View style={S.shell}>
          {/* Header */}
          <View style={S.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
              style={S.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={C.ink} />
            </Pressable>
            <Text style={S.headerTitle}>
              {copy.progress?.wordNotebookTitle || "Kelime Defteri"}
            </Text>
            <View style={S.badgeCount}>
              <Text style={S.badgeCountTxt}>{filtered.length}</Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={S.searchBox}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput
              style={S.searchInput}
              placeholder={
                copy.progress?.searchWordPlaceholder ||
                "Kelime veya Türkçe anlam ara..."
              }
              placeholderTextColor={C.muted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={16} color={C.muted} />
              </Pressable>
            )}
          </View>

          {/* Level Filter Chips */}
          <View style={S.levelFilters}>
            {LEVELS.map((lvl) => {
              const isSel = selectedLevel === lvl;
              return (
                <Pressable
                  key={lvl}
                  style={[S.filterChip, isSel && S.filterChipActive]}
                  onPress={() => setSelectedLevel(lvl)}
                >
                  <Text style={[S.filterChipTxt, isSel && S.filterChipTxtActive]}>
                    {lvl === "ALL" ? "Tümü" : lvl}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Word List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={S.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSolved = solvedQuestionIds.includes(item.id);
              const word = item.word || item.prompt;
              const meaning = item.meaning || item.answer;

              return (
                <View style={S.wordCard}>
                  <View style={S.wordTopRow}>
                    <View style={S.wordLeft}>
                      <View style={S.levelBadge}>
                        <Text style={S.levelBadgeTxt}>{item.level}</Text>
                      </View>
                      <Text style={S.wordTxt}>{word}</Text>
                      {item.phonetic && (
                        <Text style={S.phoneticTxt}>{item.phonetic}</Text>
                      )}
                    </View>

                    <View style={S.actionIcons}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${word} seslendir`}
                        style={S.iconBtn}
                        onPress={() => handleSpeak(item)}
                      >
                        <Ionicons name="volume-medium" size={20} color={C.primary} />
                      </Pressable>
                      {isSolved && (
                        <View style={S.solvedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={C.success}
                          />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={S.meaningRow}>
                    <Text style={S.meaningTxt}>“{meaning}”</Text>
                    {item.topic && (
                      <Text style={S.topicTxt}>· {item.topic}</Text>
                    )}
                  </View>

                  {item.exampleSentence && (
                    <View style={S.exampleBox}>
                      <Text style={S.exampleEn}>{item.exampleSentence}</Text>
                      {item.exampleTranslation && (
                        <Text style={S.exampleTr}>
                          {item.exampleTranslation}
                        </Text>
                      )}
                    </View>
                  )}

                  {onPracticeWord && (
                    <Pressable
                      style={S.practiceWordBtn}
                      onPress={() => {
                        onClose();
                        onPracticeWord(item);
                      }}
                    >
                      <Text style={S.practiceWordBtnTxt}>Bu Kelimeyi Çalış →</Text>
                    </Pressable>
                  )}
                </View>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  shell: {
    flex: 1,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  badgeCount: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeCountTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: radius.md || 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  searchInput: {
    flex: 1,
    color: C.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  levelFilters: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.xs || 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterChipTxt: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTxtActive: {
    color: C.surface,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
  wordCard: {
    backgroundColor: C.surface,
    borderRadius: radius.lg || 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    gap: 8,
  },
  wordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  levelBadge: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs || 6,
  },
  levelBadgeTxt: {
    color: C.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  wordTxt: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  phoneticTxt: {
    color: C.muted,
    fontSize: 12,
    fontStyle: "italic",
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  solvedBadge: {
    marginLeft: 2,
  },
  meaningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meaningTxt: {
    color: C.primary,
    fontSize: 14.5,
    fontWeight: "700",
  },
  topicTxt: {
    color: C.muted,
    fontSize: 12,
  },
  exampleBox: {
    backgroundColor: C.canvas,
    padding: 8,
    borderRadius: radius.sm || 8,
    gap: 2,
    borderWidth: 1,
    borderColor: C.lineSoft,
  },
  exampleEn: {
    color: C.ink,
    fontSize: 12.5,
    fontWeight: "600",
  },
  exampleTr: {
    color: C.muted,
    fontSize: 11.5,
    fontStyle: "italic",
  },
  practiceWordBtn: {
    alignSelf: "flex-end",
    paddingTop: 4,
  },
  practiceWordBtnTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
