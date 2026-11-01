import { ScrollView, Text, View } from "react-native";
import { S } from "./PracticeHubScreen.styles";
import { PracticeHubExamOptions } from "./PracticeHubExamOptions";
import { useState } from "react";
import { Copy, Locale } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import { HomeTab } from "../features/home/home.types";
import { BranchSilhouette, CurriculumNext, PendingCheckpoint, PracticeHubHero } from "./PracticeHubHero";
import { PracticeHubSettings, SessionSize } from "./PracticeHubSettings";


interface Props {
  copy: Copy;
  locale: Locale;
  level: LevelCode;
  xp: number;
  streak: number;
  onStartDailyPractice: (reverseMode: boolean) => void;
  curriculumNext?: CurriculumNext | null;
  onStartCurriculumPractice?: (reverseMode: boolean) => void;
  pendingCheckpoint?: PendingCheckpoint | null;
  onStartCheckpoint?: (topicId: string) => void;
  onTabPress: (tab: HomeTab) => void;
  practiceSessionSize: SessionSize;
  onPracticeSessionSizeChange: (size: SessionSize) => void;
  /** Whether the level has enough content to seat a 60-question exam. */
  isExamAvailable: boolean;
  /** Whether the current level's completion exam has already been passed. */
  isExamPassed: boolean;
  onStartExam: () => void;
  /** True once every word in the level is learned — the daily-practice CTA has nothing left to build a session from (CORE-004). */
  isLevelFullyLearned: boolean;
}

export function PracticeHubScreen({
  copy,
  level,
  onStartDailyPractice,
  curriculumNext,
  onStartCurriculumPractice,
  pendingCheckpoint,
  onStartCheckpoint,
  practiceSessionSize,
  onPracticeSessionSizeChange,
  isExamAvailable,
  isExamPassed,
  onStartExam,
  isLevelFullyLearned,
}: Props) {
  const [reverseMode, setReverseMode] = useState(false);
  const effectiveSessionSize = curriculumNext && curriculumNext.remainingCount > 0
    ? Math.min(practiceSessionSize, curriculumNext.remainingCount)
    : practiceSessionSize;
  const heroIsExamCta = isLevelFullyLearned && isExamAvailable && !isExamPassed;
  const showExamOptionCard = isExamAvailable && !heroIsExamCta;
  const startRecommended = () => pendingCheckpoint && onStartCheckpoint
    ? onStartCheckpoint(pendingCheckpoint.topicId)
    : curriculumNext && onStartCurriculumPractice
      ? onStartCurriculumPractice(reverseMode)
      : onStartDailyPractice(reverseMode);

  return (
    <View style={S.shell}>
      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <View style={S.headerGroup}>
          <BranchSilhouette />
          <Text style={S.eyebrow}>{copy.game.hubEyebrow}</Text>
          <Text style={S.title}>{copy.game.hubTitle}</Text>
          <Text style={S.subtitle}>{copy.game.hubSubtitle}</Text>
        </View>

        <PracticeHubHero
          copy={copy}
          level={level}
          curriculumNext={curriculumNext}
          pendingCheckpoint={pendingCheckpoint}
          effectiveSessionSize={effectiveSessionSize}
          practiceSessionSize={practiceSessionSize}
          isLevelFullyLearned={isLevelFullyLearned}
          isExamAvailable={isExamAvailable}
          isExamPassed={isExamPassed}
          heroIsExamCta={heroIsExamCta}
          onStartExam={onStartExam}
          onStart={startRecommended}
        />

        <PracticeHubSettings
          copy={copy}
          practiceSessionSize={practiceSessionSize}
          onPracticeSessionSizeChange={onPracticeSessionSizeChange}
          reverseMode={reverseMode}
          onReverseModeChange={setReverseMode}
        />

        <PracticeHubExamOptions copy={copy} level={level} isExamPassed={isExamPassed}
          showExamOptionCard={showExamOptionCard} onStartExam={onStartExam} />
      </ScrollView>
    </View>
  );
}
