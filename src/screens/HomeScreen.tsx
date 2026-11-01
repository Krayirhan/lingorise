import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HomeScreenProps, RecommendedWordData } from "../features/home/home.types";
import { homeStyles as S } from "../features/home/home.styles";
import { GardenHeroCard } from "../features/home/components/GardenHeroCard";
import { RecommendedWordCard } from "../features/home/components/RecommendedWordCard";
import { GardenProgressCard } from "../features/home/components/GardenProgressCard";
import { WordDetailModal } from "../features/home/components/WordDetailModal";
import { QuestHistoryModal } from "../features/home/components/QuestHistoryModal";
import { HomeGreeting } from "../features/home/components/HomeGreeting";
import { WordCollectionStrip } from "../features/home/components/WordCollectionStrip";

export function HomeScreen({
  copy,
  locale,
  viewModel,
  onQuestPress,
  onWordPress,
  onTabPress,
  reduceMotion,
}: HomeScreenProps) {
  const [selectedWord, setSelectedWord] = useState<RecommendedWordData | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const isNewLearner = viewModel.masteredWords === 0 && viewModel.xp === 0;

  return (
    <View style={S.shell}>
      <ScrollView
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeGreeting copy={copy} viewModel={viewModel} isNewLearner={isNewLearner} />

        {/* 1. Primary Action Card (Center Deep Plum Card) */}
        <GardenHeroCard
          copy={copy}
          level={viewModel.level}
          streak={viewModel.streak}
          unitNumber={viewModel.unitNumber}
          unitCount={viewModel.unitCount}
          practiceState={viewModel.practiceState}
          practiceCompletedCount={viewModel.practiceCompletedCount}
          practiceTargetCount={viewModel.practiceTargetCount}
          dailyXpEarned={viewModel.dailyXpEarned}
          dailyXpTarget={viewModel.dailyXpTarget}
          isDailyCompleted={viewModel.isDailyCompleted}
          isLevelFullyLearned={viewModel.isLevelFullyLearned}
          onPress={onQuestPress}
          onViewProgress={() => onTabPress("progress")}
          onPracticeAgain={onQuestPress}
          onGoToPracticeHub={() => onTabPress("practice")}
        />

        {/* 2. Recently learned words */}
        <WordCollectionStrip
          copy={copy}
          words={viewModel.collection}
          onWordPress={setSelectedWord}
          onSeeAll={() => onTabPress("progress")}
        />

        {/* 3. Skills */}
        <View style={S.skills}>
          <Text accessibilityRole="header" style={S.sectionTitle}>{copy.home.skillsTitle}</Text>
          <GardenProgressCard
            copy={copy}
            skillProgress={viewModel.skillProgress}
            practiceTargetCount={viewModel.practiceTargetCount}
            onTilePress={() => onTabPress("practice")}
          />
        </View>

        {/* 4. Contextual Bottom Card: Word of the Day */}
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
        reduceMotion={reduceMotion}
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
        reduceMotion={reduceMotion}
      />
    </View>
  );
}
