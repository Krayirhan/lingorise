import { BackHandler, ScrollView, Text, View } from "react-native";
import { S } from "../features/progress/progressScreen.styles";
import { useEffect, useState } from "react";
import { ProgressScreenProps } from "../features/progress/progress.types";
import { TopicBreakdownCard } from "../features/progress/components/TopicBreakdownCard";
import { WordNotebookModal } from "../features/progress/components/WordNotebookModal";
import { BadgesCard } from "../features/home/components/BadgesCard";
import { ProgressAnalyticsCard } from "../features/progress/components/ProgressAnalyticsCard";
import { buildProgressAnalytics } from "../features/progress/progressAnalyticsModel";
import { HerbariumGrid } from "../features/progress/components/HerbariumGrid";
import { LevelRuler } from "../features/progress/components/LevelRuler";
import { ActivityHeatmap } from "../features/progress/components/ActivityHeatmap";
import { useProgressVisuals } from "../features/progress/hooks/useProgressVisuals";

export function ProgressScreen({
  copy,
  level,
  streak,
  seenWordCount,
  levelWordCount,
  levelProgressList,
  topicBreakdown,
  solvedQuestionIds = [],
  practiceHistory = [],
  unlockedBadges = [],
  onPracticeWord,
  onBack,
  reduceMotion,
}: ProgressScreenProps) {
  const [notebookVisible, setNotebookVisible] = useState(false);
  const { unitNumber, slots, heatmap } = useProgressVisuals(level, solvedQuestionIds, practiceHistory);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const { answered, accuracy } = buildProgressAnalytics(practiceHistory);
  const collected = (copy.progress.collectedSubtitle)
    .replace("{seen}", String(seenWordCount))
    .replace("{total}", String(levelWordCount));

  return (
    <View style={S.root}>
      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <View style={S.titleRow}>
          <Text style={S.pageEyebrow}>{copy.progress.pageEyebrow}</Text>
          <Text style={S.pageTitle}>{copy.progress.headerTitle}</Text>
          <Text style={S.pageSubtitle}>{collected}</Text>
        </View>

        <ProgressAnalyticsCard copy={copy} accuracy={accuracy} answered={answered} streak={streak} />

        {/* Today: the current unit fills up word by word */}
        <HerbariumGrid copy={copy} unitNumber={unitNumber} slots={slots} onSeeAll={() => setNotebookVisible(true)} />

        {/* The long view: where this level sits on A1 → C2 */}
        <LevelRuler copy={copy} level={level} levelProgressList={levelProgressList} />

        {/* The habit: twelve weeks of practice */}
        <ActivityHeatmap copy={copy} weeks={heatmap} />

        <TopicBreakdownCard copy={copy} topicBreakdown={topicBreakdown} />

        <BadgesCard
          copy={copy}
          unlockedBadges={unlockedBadges}
          title={copy.progress.badgeCollectionTitle}
        />
      </ScrollView>

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
