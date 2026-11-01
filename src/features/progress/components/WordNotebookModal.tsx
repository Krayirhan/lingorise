import { C } from "../../../theme/colors";
import { useSpeakWord } from "../../../state/useSpeakWord";
import { useNotebookWords } from "../hooks/useNotebookWords";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { S } from "./WordNotebookModal.styles";
import { Ionicons } from "@expo/vector-icons";

import { LevelCode, MeaningMatchQuestion } from "../../../domain/models/content";

import { Copy } from "../../../i18n/en";

interface Props {
  copy: Copy;
  visible: boolean;
  /** A word is either learned (answered correctly at least once) or not —
   * there is no separate in-between "mastery" status any more (roadmap
   * 18-srs-flow-hardening.md "sınav" redesign, 2026-08-26). */
  solvedQuestionIds?: string[];
  onClose: () => void;
  onPracticeWord?: (question: MeaningMatchQuestion) => void;
  reduceMotion?: boolean;
}

const LEVELS: (LevelCode | "ALL")[] = ["ALL", "A1", "A2", "B1", "B2", "C1", "C2"];

function NotebookWordCard({ item, copy, learned, onSpeak, onPractice }: {
  item: MeaningMatchQuestion; copy: Copy; learned: boolean;
  onSpeak: () => void; onPractice?: () => void;
}) {
  const word = item.word || item.prompt;
  const meaning = item.meaning || item.answer;
  return (
    <View style={S.wordCard}>
      <View style={S.wordTopRow}>
        <View style={S.wordLeft}>
          <View style={S.levelBadge}><Text style={S.levelBadgeTxt}>{item.level}</Text></View>
          <Text style={S.wordTxt}>{word}</Text>
          {item.phonetic && <Text style={S.phoneticTxt}>{item.phonetic}</Text>}
        </View>
        <View style={S.actionIcons}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${word} seslendir`} style={S.iconBtn} onPress={onSpeak}>
            <Ionicons name="volume-medium" size={20} color={C.primary} />
          </Pressable>
        </View>
      </View>
      {learned && <View style={S.statusRow}><View style={S.statusPill}>
        <Ionicons name="checkmark-circle" size={12} color={C.successText} />
        <Text style={S.statusPillTxt}>{copy.progress.statusLearned}</Text>
      </View></View>}
      <View style={S.meaningRow}>
        <Text style={S.meaningTxt}>“{meaning}”</Text>
        {item.topic && <Text style={S.topicTxt}>· {item.topic}</Text>}
      </View>
      {item.exampleSentence && <View style={S.exampleBox}>
        <Text style={S.exampleEn}>{item.exampleSentence}</Text>
        {item.exampleTranslation && <Text style={S.exampleTr}>{item.exampleTranslation}</Text>}
      </View>}
      {onPractice && <Pressable style={S.practiceWordBtn} onPress={onPractice}>
        <Text style={S.practiceWordBtnTxt}>Bu Kelimeyi Çalış →</Text>
      </Pressable>}
    </View>
  );
}

export function WordNotebookModal({
  copy,
  visible,
  solvedQuestionIds,
  onClose,
  onPracticeWord,
  reduceMotion,
}: Props) {
  const allQuestions = useNotebookWords();
  const speakWord = useSpeakWord();

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
    speakWord(q.word || q.prompt || "", q.pronunciation);
  };

  return (
    <Modal visible={visible} animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose}>
      <SafeAreaView style={S.safe}>
        <View style={S.shell}>
          {/* Header */}
          <View style={S.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home.wordDetailClose}
              style={S.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={C.ink} />
            </Pressable>
            <Text style={S.headerTitle}>
              {copy.progress.wordNotebookTitle}
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
                copy.progress.searchWordPlaceholder
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
            renderItem={({ item }) => (
              <NotebookWordCard item={item} copy={copy} learned={(solvedQuestionIds || []).includes(item.id)}
                onSpeak={() => handleSpeak(item)}
                onPractice={onPracticeWord ? () => { onClose(); onPracticeWord(item); } : undefined} />
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
