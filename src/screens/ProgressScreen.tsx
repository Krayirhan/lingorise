import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../theme/colors";
import { ProgressScreenProps } from "../features/progress/progress.types";
import { LevelMasteryCard } from "../features/progress/components/LevelMasteryCard";
import { TopicBreakdownCard } from "../features/progress/components/TopicBreakdownCard";
import { WeeklyActivityCard } from "../features/progress/components/WeeklyActivityCard";
import { WordNotebookCard } from "../features/progress/components/WordNotebookCard";
import { WordNotebookModal } from "../features/progress/components/WordNotebookModal";
import { BadgesCard } from "../features/home/components/BadgesCard";

export function ProgressScreen({
  copy,
  locale,
  xp,
  streak,
  level,
  gardenProgress,
  totalSolved,
  seenWordCount,
  levelWordCount,
  levelProgressList,
  topicBreakdown,
  solvedQuestionIds = [],
  lastActiveDate = "",
  practiceHistory = [],
  unlockedBadges = [],
  onPracticeWord,
  onBack,
  reduceMotion,
}: ProgressScreenProps) {
  const [notebookVisible, setNotebookVisible] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const stageName = locale === "tr" ? gardenProgress.stageNameTr : gardenProgress.stageNameEn;
  const answered = practiceHistory.reduce((sum, entry) => sum + entry.answers, 0);
  const correct = practiceHistory.reduce((sum, entry) => sum + entry.correct, 0);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <View style={S.root}>
      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={S.titleRow}>
          <Text style={S.pageEyebrow}>{copy.progress?.pageEyebrow || "İLERLEME"}</Text>
          <Text style={S.pageTitle}>{copy.progress?.headerTitle || "Bahçe Gelişimi"}</Text>
        </View>

        <View style={S.analyticsCard}>
          <View style={S.analyticsItem}>
            <Text style={S.analyticsValue}>{accuracy}%</Text>
            <Text style={S.analyticsLabel}>{copy.progress?.accuracyLabel || "Doğruluk"}</Text>
          </View>
          <View style={S.analyticsDivider} />
          <View style={S.analyticsItem}>
            <Text style={S.analyticsValue}>{answered}</Text>
            <Text style={S.analyticsLabel}>{copy.progress?.answersLabel || "Toplam cevap"}</Text>
          </View>
          <View style={S.analyticsDivider} />
          <View style={S.analyticsItem}>
            <Text style={S.analyticsValue}>{seenWordCount}</Text>
            <Text style={S.analyticsLabel}>{copy.progress?.wordsSeenLabel || "Görülen kelime"}</Text>
          </View>
        </View>

        {/* Overview Hero Card */}
        <View style={S.heroCard}>
          <View style={S.heroTop}>
            <View style={S.stageTag}>
              <Ionicons name="leaf" size={12} color={C.primary} />
              <Text style={S.stageTagTxt}>{stageName}</Text>
            </View>
            <Text style={S.levelTxt}>{level}</Text>
          </View>

          <View style={S.statsRow}>
            <View style={S.stat}>
              <Text style={S.statVal}>{xp}</Text>
              <Text style={S.statLbl}>XP</Text>
            </View>
            <View style={S.statDivider} />
            <View style={S.stat}>
              <Text style={S.statVal}>{streak}</Text>
              <Text style={S.statLbl}>{copy.progress?.dayStreakLabel || "Gün Seri"}</Text>
            </View>
            <View style={S.statDivider} />
            <View style={S.stat}>
              <Text style={S.statVal}>{totalSolved}</Text>
              <Text style={S.statLbl}>{copy.progress?.solvedQuestions || "Öğrenilen Kelime"}</Text>
            </View>
          </View>
        </View>

        {/* Weekly 7-Day Activity Bar Chart */}
        <WeeklyActivityCard
          copy={copy}
          streak={streak}
          lastActiveDate={lastActiveDate}
          practiceHistory={practiceHistory}
        />

        {/* Word Notebook Vault Launcher */}
        <WordNotebookCard
          copy={copy}
          totalWords={levelWordCount}
          solvedCount={seenWordCount}
          onOpen={() => setNotebookVisible(true)}
        />

        {/* Level Mastery Breakdown */}
        <LevelMasteryCard copy={copy} levelProgressList={levelProgressList} />

        {/* Topic Mastery Breakdown */}
        <TopicBreakdownCard copy={copy} topicBreakdown={topicBreakdown} />

        <BadgesCard
          copy={copy}
          unlockedBadges={unlockedBadges}
          title={copy.progress?.badgeCollectionTitle || "Rozet Koleksiyonu"}
        />
      </ScrollView>

      {/* Word Notebook Fullscreen Modal */}
      <WordNotebookModal
        copy={copy}
        visible={notebookVisible}
        solvedQuestionIds={solvedQuestionIds}
        onClose={() => setNotebookVisible(false)}
        onPracticeWord={onPracticeWord}
        reduceMotion={reduceMotion}
      />
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, maxWidth: 580, width: "100%", alignSelf: "center" },
  titleRow: { gap: 2, marginTop: 4, marginBottom: 4 },
  pageEyebrow: { color: C.primary, fontSize: 11.5, fontWeight: "800", letterSpacing: 1.2 },
  pageTitle: { color: C.ink, fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  content: { paddingHorizontal: 20, paddingTop: 14, gap: 16, paddingBottom: 28 },
  heroCard: { backgroundColor: C.primary, borderRadius: radius.card || 20, padding: 18, gap: 14 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stageTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.surface, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.xs },
  stageTagTxt: { color: C.primary, fontSize: 11, fontWeight: "800" },
  levelTxt: { color: C.surface, fontSize: 14, fontWeight: "800" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: radius.md, padding: 12 },
  stat: { alignItems: "center" },
  statVal: { color: C.surface, fontSize: 22, fontWeight: "800" },
  statLbl: { color: "#EADFE5", fontSize: 11, marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },
  analyticsCard: { flexDirection: "row", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: radius.card || 20, padding: 14, justifyContent: "space-around" },
  analyticsItem: { alignItems: "center", flex: 1 },
  analyticsValue: { color: C.primary, fontWeight: "800", fontSize: 20 },
  analyticsLabel: { color: C.muted, fontSize: 11, marginTop: 2, textAlign: "center" },
  analyticsDivider: { width: 1, backgroundColor: C.line },
});
