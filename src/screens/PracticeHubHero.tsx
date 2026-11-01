import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { S } from "./PracticeHubScreen.styles";
import { C } from "../theme/colors";
import { Copy } from "../i18n/en";
import { LevelCode } from "../domain/models/content";
import { formatTemplate } from "../utils/formatters";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const branchImage = require("../../assets/practice-branch.png");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cardLeavesImage = require("../../assets/practice-card-leaves.png");

export function BranchSilhouette({ card = false }: { card?: boolean }) {
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

export interface CurriculumNext {
  topicTitle: string;
  objective: string;
  lessonTitle: string;
  remainingCount: number;
}

export interface PendingCheckpoint {
  topicId: string;
  topicTitle: string;
  questionCount: number;
}

interface Props {
  copy: Copy;
  level: LevelCode;
  curriculumNext?: CurriculumNext | null;
  pendingCheckpoint?: PendingCheckpoint | null;
  /** Session size after capping it to what is left in the current lesson. */
  effectiveSessionSize: number;
  practiceSessionSize: number;
  isLevelFullyLearned: boolean;
  isExamAvailable: boolean;
  isExamPassed: boolean;
  /** The level is done and its exam is still pending: the hero becomes the exam entry point. */
  heroIsExamCta: boolean;
  onStartExam: () => void;
  /** Starts whatever the hero recommends: a topic check, the next lesson or the daily practice. */
  onStart: () => void;
}

/**
 * The practice hub's main card. Once every word in the level is learned
 * (CORE-004) it turns into a level-complete card, which is an exam entry
 * point only while the exam is still pending.
 */
export function PracticeHubHero(props: Props) {
  const { copy, level, curriculumNext, pendingCheckpoint } = props;
  const badge = curriculumNext && !pendingCheckpoint ? copy.game.hubNextLesson : copy.game.hubBadgeRecommended;

  if (props.isLevelFullyLearned) {
    const title = formatTemplate(copy.game.hubLevelDoneTitle, { level });
    const reason = props.isExamPassed
      ? copy.game.hubLevelDoneSubtitleExamPassed
      : props.isExamAvailable ? copy.game.hubLevelDoneSubtitleExamPending : copy.game.hubLevelDoneSubtitleNoExam;
    const labelTail = props.heroIsExamCta
      ? copy.game.examCardCta
      : props.isExamPassed ? copy.game.hubLevelDoneSubtitleExamPassed : copy.game.hubLevelDoneSubtitleNoExam;
    return (
      <Pressable
        accessibilityRole="button"
        disabled={!props.heroIsExamCta}
        accessibilityState={{ disabled: !props.heroIsExamCta }}
        accessibilityLabel={`${title}. ${labelTail}`}
        style={({ pressed }) => [S.heroCard, pressed && props.heroIsExamCta && S.cardPressed]}
        onPress={props.heroIsExamCta ? props.onStartExam : undefined}
      >
        <BranchSilhouette card />
        <View style={S.heroTop}>
          <View style={S.heroCopy}>
            <View style={S.recommendedBadge}>
              <Text style={S.recommendedBadgeTxt}>{badge}</Text>
            </View>
            <Text style={S.heroTitle}>{title}</Text>
            <Text style={S.heroReason}>{reason}</Text>
          </View>
        </View>
        {props.heroIsExamCta && (
          <View style={S.heroCtaBtn}>
            <Ionicons name="school-outline" size={18} color={C.surface} />
            <Text style={S.heroCtaBtnTxt}>{copy.game.examCardCta}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  const sessionSummary = formatTemplate(copy.home.practiceCardNewOnly, { level, fresh: props.effectiveSessionSize });
  const estimatedMinutes = Math.max(1, Math.round(props.effectiveSessionSize * 0.15));
  const title = pendingCheckpoint
    ? formatTemplate(copy.game.checkpointTitle, { topic: pendingCheckpoint.topicTitle })
    : curriculumNext ? curriculumNext.topicTitle : copy.game.hubHeroTitle;
  const reason = pendingCheckpoint ? copy.game.checkpointReason : curriculumNext ? curriculumNext.objective : sessionSummary;
  const meta = pendingCheckpoint
    ? formatTemplate(copy.game.checkpointMeta, { count: pendingCheckpoint.questionCount || 10 })
    : curriculumNext
      ? formatTemplate(copy.game.curriculumMeta, { lesson: curriculumNext.lessonTitle, count: props.effectiveSessionSize })
      : `${level} · ${formatTemplate(copy.home.practiceMetaEstimate, { count: props.practiceSessionSize, minutes: estimatedMinutes })}`;
  const labelMeta = pendingCheckpoint || curriculumNext ? meta : `${level}, ${sessionSummary}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${labelMeta}. ${copy.game.hubHeroCta}`}
      style={({ pressed }) => [S.heroCard, pressed && S.cardPressed]}
      onPress={props.onStart}
    >
      <BranchSilhouette card />
      <View style={S.heroTop}>
        <View style={S.heroCopy}>
          <View style={S.recommendedBadge}>
            <Text style={S.recommendedBadgeTxt}>{badge}</Text>
          </View>
          <Text style={S.heroTitle}>{title}</Text>
          <Text style={S.heroReason}>{reason}</Text>
          <Text style={S.heroMeta}>{meta}</Text>
        </View>
      </View>
      <View style={S.heroCtaBtn}>
        <Ionicons name="play" size={18} color={C.surface} />
        <Text style={S.heroCtaBtnTxt}>{copy.game.hubHeroCta.replace(/\s*→\s*$/, "")}</Text>
      </View>
    </Pressable>
  );
}
