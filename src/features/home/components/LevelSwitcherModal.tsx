import { C } from "../../../theme/colors";
import { useApplication } from "../../../context/ApplicationContext";
import { useState } from "react";
import { S } from "./LevelSwitcherModal.styles";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../domain/models/content";
import { levels } from "../../../content/levels";




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

const fill = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );

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
        <Text style={S.rowMeta}>{ready ? `${seen} / ${total} ${copy.home?.levelSwitchWordCountSuffix || "kelime öğrenildi"}` : copy.home?.levelSwitchSoon || "Yakında"}</Text>
      </View>
      {current ? <View style={S.tagCurrent}><Text style={S.tagCurrentTxt}>{copy.home?.levelSwitchCurrent || "Şu anki"}</Text></View>
        : earned ? <View style={S.tagEarned}><Ionicons name="checkmark" size={12} color={C.successText} /><Text style={S.tagEarnedTxt}>{copy.home?.levelSwitchEarned || "Kazanıldı"}</Text></View>
          : !ready ? <View style={S.tagSoon}><Text style={S.tagSoonTxt}>{copy.home?.levelSwitchSoon || "Yakında"}</Text></View> : null}
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
  const application = useApplication();
  const { getQuestionsByLevel } = application.catalogue;
  const { isLevelReady } = application.catalogue;
  const { assessLevelChoice } = application.learning;
  const { track } = application;

  const [pendingLevel, setPendingLevel] = useState<LevelCode | null>(null);

  if (!visible) return null;

  const pendingAssessment = pendingLevel
    ? assessLevelChoice(pendingLevel, currentLevel, passedLevelExams)
    : null;

  const handlePick = (level: LevelCode) => {
    if (level === currentLevel) {
      onClose();
      return;
    }
    const assessment = assessLevelChoice(level, currentLevel, passedLevelExams);
    if (assessment.isAhead) {
      track("level_switch_warning_shown", { currentLevel, targetLevel: level });
      setPendingLevel(level);
      return;
    }
    onSelect(level);
    onClose();
  };

  const confirmPending = () => {
    if (!pendingLevel) return;
    track("level_switch_confirmed_ahead", { currentLevel, targetLevel: pendingLevel });
    onSelect(pendingLevel);
    setPendingLevel(null);
    onClose();
  };

  return (
    <Modal visible transparent animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.sheet}>
          <View style={S.header}>
            <View style={S.headerCopy}>
              <Text style={S.title}>{copy.home?.levelSwitchTitle || "Seviyeni seç"}</Text>
              <Text style={S.subtitle}>
                {copy.home?.levelSwitchSubtitle ||
                  "İstediğin seviyeyi çalışabilirsin. Rozet ise tamamlama sınavını geçince kazanılır."}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home?.levelSwitchCancel || "Vazgeç"}
              style={S.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={C.muted} />
            </Pressable>
          </View>

          {pendingLevel && pendingAssessment ? (
            <View style={S.warnBox}>
              <Text style={S.warnText}>
                {fill(
                  copy.home?.levelSwitchAheadWarning ||
                    "{current} tamamlama sınavını henüz geçmedin. {target} şu an zor gelebilir — yine de deneyebilirsin.",
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
                  onPress={() => setPendingLevel(null)}
                >
                  <Text style={S.warnGhostTxt}>{copy.home?.levelSwitchCancel || "Vazgeç"}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [S.warnPrimary, pressed && S.pressed]}
                  onPress={confirmPending}
                >
                  <Text style={S.warnPrimaryTxt}>
                    {fill(copy.home?.levelSwitchConfirm || "{level} seviyesine geç", { level: pendingLevel })}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <ScrollView style={S.list} contentContainerStyle={S.listContent} showsVerticalScrollIndicator={false}>
            {levels.map((entry) => {
              const levelQuestionIds = getQuestionsByLevel(entry.code).map((q) => q.id);
              const total = levelQuestionIds.length;
              const ready = isLevelReady(entry.code);
              const seen = solvedQuestionIds.filter((id) => levelQuestionIds.includes(id)).length;
              const isCurrent = entry.code === currentLevel;
              const isEarned = passedLevelExams.includes(entry.code);

              return <LevelOptionRow key={entry.code} entry={entry} copy={copy} current={isCurrent}
                ready={ready} seen={seen} total={total} earned={isEarned} onPick={() => handlePick(entry.code)} />;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
