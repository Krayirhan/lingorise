import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { HomeScreenProps, RecommendedWordData } from "../features/home/home.types";
import { homeStyles as S } from "../features/home/home.styles";
import { GardenHeroCard } from "../features/home/components/GardenHeroCard";
import { ReviewCard } from "../features/home/components/ReviewCard";
import { DailyQuestCard } from "../features/home/components/DailyQuestCard";
import { RecommendedWordCard } from "../features/home/components/RecommendedWordCard";
import { GardenProgressCard } from "../features/home/components/GardenProgressCard";
import { WordDetailModal } from "../features/home/components/WordDetailModal";
import { QuestHistoryModal } from "../features/home/components/QuestHistoryModal";

export function HomeScreen({
  copy,
  locale,
  viewModel,
  onQuestPress,
  onReviewPress,
  onWordPress,
  onTabPress,
}: HomeScreenProps) {
  const [selectedWord, setSelectedWord] = useState<RecommendedWordData | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);

  return (
    <View style={S.shell}>
      <ScrollView
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Greeting Section */}
        <View style={S.intro}>
          <Text style={S.greeting}>{copy.home.morning}</Text>
          <Text style={S.title}>{viewModel.greetingTitle}</Text>
          <Text style={S.subtitle}>{viewModel.greetingSubtitle}</Text>
        </View>

        {/* Primary Daily Action: Hero Card */}
        <GardenHeroCard
          copy={copy}
          level={viewModel.level}
          masteredWords={viewModel.masteredWords}
          stageName={viewModel.stageName}
          gardenProgress={viewModel.gardenProgress}
          unitNumber={viewModel.unitNumber}
          unitCount={viewModel.unitCount}
          unitLearned={viewModel.unitLearned}
          unitTotal={viewModel.unitTotal}
          practiceState={viewModel.practiceState}
          practiceCompletedCount={viewModel.practiceCompletedCount}
          practiceTargetCount={viewModel.practiceTargetCount}
          dailyXpEarned={viewModel.dailyXpEarned}
          dailyXpTarget={viewModel.dailyXpTarget}
          isDailyCompleted={viewModel.isDailyCompleted}
          onPress={onQuestPress}
          onViewProgress={() => onTabPress("progress")}
          onPracticeAgain={onQuestPress}
        />

        {/* Garden Skills Progress Section */}
        <View style={S.sectionRow}>
          <Text style={S.sectionTitle}>{copy.home.yourGarden}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.home?.seeAll || copy.home.progress}
            style={S.sectionLinkBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onTabPress("progress")}
          >
            <Text style={S.sectionLink}>{copy.home?.seeAll || copy.home.progress}</Text>
          </Pressable>
        </View>

        <GardenProgressCard
          copy={copy}
          skillProgress={viewModel.skillProgress}
          onViewProgress={() => onTabPress("progress")}
        />

        {/* Daily Quests Area */}
        <DailyQuestCard
          copy={copy}
          dailyQuests={viewModel.dailyQuests}
          onHistoryPress={() => setHistoryVisible(true)}
        />

        {/* Review Card (Appears only when due mistakes exist) */}
        <ReviewCard
          copy={copy}
          locale={locale}
          dueReviewCount={viewModel.reviewCount}
          onPress={onReviewPress}
        />

        {/* Recommended Word of the Day -> Opens Word Detail Modal */}
        <RecommendedWordCard
          copy={copy}
          recommendedWord={viewModel.recommendedWord}
          onPress={() => setSelectedWord(viewModel.recommendedWord)}
        />

      </ScrollView>

      <QuestHistoryModal
        copy={copy}
        locale={locale}
        visible={historyVisible}
        questHistory={viewModel.questHistory}
        onClose={() => setHistoryVisible(false)}
      />

      {/* Word Detail Sheet Modal */}
      <WordDetailModal
        copy={copy}
        wordData={selectedWord}
        visible={selectedWord !== null}
        onPracticeWord={(word) => {
          if (onWordPress) onWordPress(word);
          else onQuestPress();
        }}
        onClose={() => setSelectedWord(null)}
      />
    </View>
  );
}
