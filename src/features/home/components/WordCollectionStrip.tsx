import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { CollectedWord } from "../home.types";
import { homeStyles as H } from "../home.styles";
import { fonts } from "../../../theme/typography";

export function WordCollectionStrip({ copy, words, onWordPress, onSeeAll }: {
  copy: Copy;
  words: CollectedWord[];
  onWordPress: (word: CollectedWord) => void;
  onSeeAll: () => void;
}) {
  return (
    <View style={S.section}>
      <View style={H.sectionRow}>
        <Text accessibilityRole="header" style={H.sectionTitle}>{copy.home.collectionTitle}</Text>
        {words.length > 0 && (
          <Pressable accessibilityRole="link" style={H.sectionLinkBtn} onPress={onSeeAll}>
            <Text style={H.sectionLink}>{copy.home.seeAll}</Text>
          </Pressable>
        )}
      </View>

      {words.length === 0 ? (
        <View style={S.empty}>
          <Ionicons name="leaf-outline" size={20} color={C.success} />
          <Text style={S.emptyText}>{copy.home.collectionEmpty}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.row}
          style={S.scroller}
        >
          {words.map((word) => (
            <Pressable
              key={word.id}
              accessibilityRole="button"
              accessibilityLabel={copy.home.collectionCardAccessibility
                .replace("{word}", word.word)
                .replace("{meaning}", word.meaning)}
              style={({ pressed }) => [S.card, pressed && S.pressed]}
              onPress={() => onWordPress(word)}
            >
              <View style={S.cardTop}>
                <Ionicons name="leaf" size={22} color={C.growth} />
                <View style={S.levelTag}>
                  <Text style={S.levelText}>{word.level}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={S.word}>{word.word}</Text>
              {word.phonetic ? <Text numberOfLines={1} style={S.phonetic}>{word.phonetic}</Text> : null}
              <View style={S.rule} />
              <Text numberOfLines={1} style={S.meaning}>{word.meaning}</Text>
            </Pressable>
          ))}
          {words.length < 3 && (
            <View style={S.hint}>
              <Ionicons name="leaf-outline" size={20} color={C.success} />
              <Text style={S.hintText}>{copy.home.collectionGrowHint}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  section: { gap: 10 },
  scroller: { marginHorizontal: -18 },
  row: { paddingHorizontal: 18, gap: 10 },
  card: {
    width: 128,
    minHeight: 108,
    padding: 8,
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    gap: 2,
  },
  pressed: { opacity: 0.85 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  levelTag: { backgroundColor: C.rewardSoft, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  levelText: { color: C.rewardText, fontFamily: fonts.bodyBold, fontSize: 11 },
  word: { color: C.ink, fontFamily: fonts.display, fontSize: 20 },
  phonetic: { color: C.muted, fontSize: 12 },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 2 },
  meaning: { color: C.ink, fontFamily: fonts.body, fontSize: 13 },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.line,
  },
  emptyText: { flex: 1, color: C.muted, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
  hint: {
    width: 168,
    minHeight: 108,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.line,
    justifyContent: "center",
    gap: 8,
  },
  hintText: { color: C.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
});
