import { C } from "../../../theme/colors";
import { S } from "./LevelSwitcherModal.styles";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../domain/models/content";
import { levels } from "../../../content/levels";
import { formatTemplate } from "../../../utils/formatters";
import { useLevelSwitch } from "../hooks/useLevelSwitch";




interface Props {
  copy: Copy;
  visible: boolean;
  currentLevel: LevelCode;
  /** Words answered correctly at least once, across all levels. */
  solvedQuestionIds: string[];
  /** Levels whose completion exam has been passed — see domain/learning/levelExam.ts. */
  passedLevelExams: LevelCode[];
  onSelect: (level: LevelCode) => void;
  onClose: () => void;
  reduceMotion?: boolean;
}

function LevelOptionRow({ entry, copy, current, ready, seen, total, earned, onPick }: {
  entry: (typeof levels)[number]; copy: Copy; current: boolean; ready: boolean;
  seen: number; total: number; earned: boolean; onPick: () => void;
}) {
  return (
    <Pressable key={entry.code} accessibilityRole="button" accessibilityLabel={`${entry.code} ${entry.title}`}
      accessibilityState={{ selected: current, disabled: !ready }} disabled={!ready}
      style={({ pressed }) => [S.row, current && S.rowCurrent, !ready && S.rowDisabled, pressed && ready && S.pressed]}
      onPress={onPick}>
      <View style={[S.codeBadge, current && S.codeBadgeCurrent]}>
        <Text style={[S.codeTxt, current && S.codeTxtCurrent]}>{entry.code}</Text>
      </View>
      <View style={S.rowCopy}>
        <Text style={S.rowTitle}>{entry.title}</Text>
        <Text style={S.rowMeta}>{ready ? `${seen} / ${total} ${copy.home.levelSwitchWordCountSuffix}` : copy.home.levelSwitchSoon}</Text>
      </View>
      {current ? <View style={S.tagCurrent}><Text style={S.tagCurrentTxt}>{copy.home.levelSwitchCurrent}</Text></View>
        : earned ? <View style={S.tagEarned}><Ionicons name="checkmark" size={12} color={C.successText} /><Text style={S.tagEarnedTxt}>{copy.home.levelSwitchEarned}</Text></View>
          : !ready ? <View style={S.tagSoon}><Text style={S.tagSoonTxt}>{copy.home.levelSwitchSoon}</Text></View> : null}
    </Pressable>
  );
}

/**
 * Every level is selectable — access is never locked. What a level ahead of
 * the learner gets is an honest note about difficulty, not a closed door.
 * Levels without enough content are the one exception: offering those would
 * be a promise the catalogue cannot keep.
 */
export function LevelSwitcherModal({
  copy,
  visible,
  currentLevel,
  solvedQuestionIds,
  passedLevelExams,
  onSelect,
  onClose,
  reduceMotion,
}: Props) {
  const { options, pendingLevel, pick, confirmPending, cancelPending } = useLevelSwitch({
    visible, currentLevel, solvedQuestionIds, passedLevelExams, onSelect, onClose,
  });

  if (!visible) return null;

  return (
    <Modal visible transparent animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.sheet}>
          <View style={S.header}>
            <View style={S.headerCopy}>
              <Text style={S.title}>{copy.home.levelSwitchTitle}</Text>
              <Text style={S.subtitle}>
                {copy.home.levelSwitchSubtitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home.levelSwitchCancel}
              style={S.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={C.muted} />
            </Pressable>
          </View>

          {pendingLevel ? (
            <View style={S.warnBox}>
              <Text style={S.warnText}>
                {formatTemplate(
                  copy.home.levelSwitchAheadWarning,
                  {
                    current: currentLevel,
                    target: pendingLevel,
                  }
                )}
              </Text>
              <View style={S.warnActions}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [S.warnGhost, pressed && S.pressed]}
                  onPress={cancelPending}
                >
                  <Text style={S.warnGhostTxt}>{copy.home.levelSwitchCancel}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [S.warnPrimary, pressed && S.pressed]}
                  onPress={confirmPending}
                >
                  <Text style={S.warnPrimaryTxt}>
                    {formatTemplate(copy.home.levelSwitchConfirm, { level: pendingLevel })}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <ScrollView style={S.list} contentContainerStyle={S.listContent} showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <LevelOptionRow key={option.entry.code} entry={option.entry} copy={copy} current={option.isCurrent}
                ready={option.ready} seen={option.seen} total={option.total} earned={option.isEarned}
                onPick={() => pick(option.entry.code)} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
