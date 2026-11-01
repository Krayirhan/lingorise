import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { S } from "./PracticeHubScreen.styles";
import { PracticeHubExamOptions } from "./PracticeHubExamOptions";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { Copy, Locale } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import { HomeTab } from "../features/home/home.types";
import { formatTemplate } from "../utils/formatters";


interface Props {
  copy: Copy;
  locale: Locale;
  level: LevelCode;
  xp: number;
  streak: number;
  onStartDailyPractice: (reverseMode: boolean) => void;
  curriculumNext?: {
    topicTitle: string;
    objective: string;
    lessonTitle: string;
    remainingCount: number;
  } | null;
  onStartCurriculumPractice?: (reverseMode: boolean) => void;
  pendingCheckpoint?: { topicId: string; topicTitle: string; questionCount: number } | null;
  onStartCheckpoint?: (topicId: string) => void;
  onTabPress: (tab: HomeTab) => void;
  practiceSessionSize: 5 | 10 | 20 | 30;
  onPracticeSessionSizeChange: (size: 5 | 10 | 20 | 30) => void;
  /** Whether the level has enough content to seat a 60-question exam. */
  isExamAvailable: boolean;
  /** Whether the current level's completion exam has already been passed. */
  isExamPassed: boolean;
  onStartExam: () => void;
  /** True once every word in the level is learned — the daily-practice CTA has nothing left to build a session from (CORE-004). */
  isLevelFullyLearned: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const branchImage = require("../../assets/practice-branch.png");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cardLeavesImage = require("../../assets/practice-card-leaves.png");

function BranchSilhouette({ card = false }: { card?: boolean }) {
  return (
    <Image
      source={card ? cardLeavesImage : branchImage}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      resizeMode="contain"
      style={[S.branch, card && S.cardBranch]}
    />
  );
}

export function PracticeHubScreen({
  copy,
  locale,
  level,
  xp,
  streak,
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
  const estimatedMinutes = Math.max(1, Math.round(effectiveSessionSize * 0.15));

  const heroIsExamCta = isLevelFullyLearned && isExamAvailable && !isExamPassed;
  const showExamOptionCard = isExamAvailable && !heroIsExamCta;

  const sessionSummary = formatTemplate(copy.home.practiceCardNewOnly, {
    level,
    fresh: effectiveSessionSize,
  });
  const curriculumTitle = curriculumNext?.topicTitle || "";
  const curriculumMeta = curriculumNext
    ? formatTemplate(copy.game.curriculumMeta, { lesson: curriculumNext.lessonTitle, count: effectiveSessionSize })
    : sessionSummary;
  const checkpointTitle = formatTemplate(copy.game.checkpointTitle, { topic: pendingCheckpoint?.topicTitle || "" });
  const checkpointReason = copy.game.checkpointReason;
  const checkpointMeta = formatTemplate(copy.game.checkpointMeta, { count: pendingCheckpoint?.questionCount || 10 });

  return (
    <View style={S.shell}>
      <ScrollView
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.headerGroup}>
            <BranchSilhouette />
            <Text style={S.eyebrow}>
              {copy.game.hubEyebrow}
            </Text>
            <Text style={S.title}>
              {copy.game.hubTitle}
            </Text>
            <Text style={S.subtitle}>
              {copy.game.hubSubtitle}
            </Text>
        </View>

          {/* Recommended Daily Practice Hero Card — replaced by a level-complete
              state once there are no fresh words left to practice (CORE-004). */}
          {isLevelFullyLearned ? (
            <Pressable
              accessibilityRole="button"
              disabled={!heroIsExamCta}
              accessibilityState={{ disabled: !heroIsExamCta }}
              accessibilityLabel={`${formatTemplate(copy.game.hubLevelDoneTitle, { level })}. ${
                heroIsExamCta
                  ? copy.game.examCardCta
                  : isExamPassed
                    ? copy.game.hubLevelDoneSubtitleExamPassed
                    : copy.game.hubLevelDoneSubtitleNoExam
              }`}
              style={({ pressed }) => [S.heroCard, pressed && heroIsExamCta && S.cardPressed]}
              onPress={heroIsExamCta ? onStartExam : undefined}
            >
              <BranchSilhouette card />
              <View style={S.heroTop}>
                <View style={S.heroCopy}>
                  <View style={S.recommendedBadge}>
                    <Text style={S.recommendedBadgeTxt}>
                      {curriculumNext && !pendingCheckpoint ? copy.game.hubNextLesson : copy.game.hubBadgeRecommended}
                    </Text>
                  </View>
                  <Text style={S.heroTitle}>
                    {formatTemplate(copy.game.hubLevelDoneTitle, { level })}
                  </Text>
                  <Text style={S.heroReason}>
                    {isExamPassed
                      ? copy.game.hubLevelDoneSubtitleExamPassed
                      : isExamAvailable
                        ? copy.game.hubLevelDoneSubtitleExamPending
                        : copy.game.hubLevelDoneSubtitleNoExam}
                  </Text>
                </View>

              </View>

              {heroIsExamCta && (
                <View style={S.heroCtaBtn}>
                  <Ionicons name="school-outline" size={18} color={C.surface} />
                  <Text style={S.heroCtaBtnTxt}>
                    {copy.game.examCardCta}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${pendingCheckpoint ? checkpointTitle : curriculumNext ? curriculumTitle : copy.game.hubHeroTitle}, ${pendingCheckpoint ? checkpointMeta : curriculumNext ? curriculumMeta : `${level}, ${sessionSummary}`}. ${copy.game.hubHeroCta}`}
              style={({ pressed }) => [
                S.heroCard,
                pressed && S.cardPressed,
              ]}
              onPress={() => pendingCheckpoint && onStartCheckpoint
                ? onStartCheckpoint(pendingCheckpoint.topicId)
                : curriculumNext && onStartCurriculumPractice
                  ? onStartCurriculumPractice(reverseMode)
                  : onStartDailyPractice(reverseMode)}
            >
              <BranchSilhouette card />
              <View style={S.heroTop}>
                <View style={S.heroCopy}>
                  <View style={S.recommendedBadge}>
                    <Text style={S.recommendedBadgeTxt}>
                      {curriculumNext && !pendingCheckpoint ? copy.game.hubNextLesson : copy.game.hubBadgeRecommended}
                    </Text>
                  </View>
                  <Text style={S.heroTitle}>
                    {pendingCheckpoint ? checkpointTitle : curriculumNext ? curriculumTitle : copy.game.hubHeroTitle}
                  </Text>
                  <Text style={S.heroReason}>{pendingCheckpoint ? checkpointReason : curriculumNext ? curriculumNext.objective : sessionSummary}</Text>
                  <Text style={S.heroMeta}>
                    {pendingCheckpoint ? checkpointMeta : curriculumNext ? curriculumMeta : `${level} · ${formatTemplate(copy.home.practiceMetaEstimate, {
                      count: practiceSessionSize,
                      minutes: estimatedMinutes,
                    })}`}
                  </Text>
                </View>

              </View>

              {/* Primary Gold CTA */}
              <View style={S.heroCtaBtn}>
                <Ionicons name="play" size={18} color={C.surface} />
                <Text style={S.heroCtaBtnTxt}>
                  {(copy.game.hubHeroCta).replace(/\s*→\s*$/, "")}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Session configuration — secondary to the hero CTA above (CD-002:
              config used to lead the screen, ahead of the motivating hero). */}
          <View style={S.settingsCard}>
            <View style={S.settingRow}>
              <View style={S.settingHead}>
                <View style={[S.settingIcon, { backgroundColor: C.attentionSoft }]}>
                  <Ionicons name="time-outline" size={22} color={C.primary} />
                </View>
                <View style={S.settingCopy}>
                  <Text style={S.settingTitle}>{copy.game.hubSessionLength}</Text>
                  <Text style={S.settingHint}>{formatTemplate(copy.game.hubSessionLengthHint, { count: practiceSessionSize })}</Text>
                </View>
              </View>
              <View style={S.segment}>
                {([5, 10, 20, 30] as const).map((size) => (
                  <Pressable
                    key={size}
                    accessibilityRole="button"
                    accessibilityLabel={`${size} soru`}
                    accessibilityState={{ selected: practiceSessionSize === size }}
                    onPress={() => onPracticeSessionSizeChange(size)}
                    style={[S.segmentItem, practiceSessionSize === size && S.segmentItemActive]}
                  >
                    <Text style={[S.segmentText, practiceSessionSize === size && S.segmentTextActive]}>{size}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Directional Mode Switcher (EN -> TR / TR -> EN) */}
            <View style={[S.settingRow, S.settingRowDivider]}>
              <View style={S.settingHead}>
                <View style={[S.settingIcon, { backgroundColor: C.successSoft }]}>
                  <Ionicons name="swap-horizontal" size={22} color={C.primary} />
                </View>
                <View style={S.settingCopy}>
                  <Text style={S.settingTitle}>{copy.game.hubDirection}</Text>
                  <Text style={S.settingHint}>{copy.game?.hubDirectionHint}</Text>
                </View>
              </View>
              <View style={S.segment}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !reverseMode }}
                  style={[S.segmentItem, !reverseMode && S.segmentItemActive]}
                  onPress={() => setReverseMode(false)}
                >
                  <Text style={[S.segmentText, !reverseMode && S.segmentTextActive]}>
                    {copy.game.hubModePickMeaning}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: reverseMode }}
                  style={[S.segmentItem, reverseMode && S.segmentItemActive]}
                  onPress={() => setReverseMode(true)}
                >
                  <Text style={[S.segmentText, reverseMode && S.segmentTextActive]}>
                    {copy.game.hubModePickWord}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <PracticeHubExamOptions copy={copy} level={level} isExamPassed={isExamPassed}
            showExamOptionCard={showExamOptionCard} onStartExam={onStartExam} />

        </ScrollView>
      </View>
  );
}

;
