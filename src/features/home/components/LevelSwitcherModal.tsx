import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../types/content";
import { levels } from "../../../content/levels";
import { getQuestionsByLevel, isLevelReady } from "../../../content/questions";
import { assessLevelChoice } from "../../../domain/learning/promotion";
import { track } from "../../../services/telemetry";

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

              return (
                <Pressable
                  key={entry.code}
                  accessibilityRole="button"
                  accessibilityLabel={`${entry.code} ${entry.title}`}
                  accessibilityState={{ selected: isCurrent, disabled: !ready }}
                  disabled={!ready}
                  style={({ pressed }) => [
                    S.row,
                    isCurrent && S.rowCurrent,
                    !ready && S.rowDisabled,
                    pressed && ready && S.pressed,
                  ]}
                  onPress={() => handlePick(entry.code)}
                >
                  <View style={[S.codeBadge, isCurrent && S.codeBadgeCurrent]}>
                    <Text style={[S.codeTxt, isCurrent && S.codeTxtCurrent]}>{entry.code}</Text>
                  </View>

                  <View style={S.rowCopy}>
                    <Text style={S.rowTitle}>{entry.title}</Text>
                    <Text style={S.rowMeta}>
                      {ready
                        ? `${seen} / ${total} ${copy.home?.levelSwitchWordCountSuffix || "kelime öğrenildi"}`
                        : copy.home?.levelSwitchSoon || "Yakında"}
                    </Text>
                  </View>

                  {isCurrent ? (
                    <View style={S.tagCurrent}>
                      <Text style={S.tagCurrentTxt}>{copy.home?.levelSwitchCurrent || "Şu anki"}</Text>
                    </View>
                  ) : isEarned ? (
                    <View style={S.tagEarned}>
                      <Ionicons name="checkmark" size={12} color={C.successText} />
                      <Text style={S.tagEarnedTxt}>{copy.home?.levelSwitchEarned || "Kazanıldı"}</Text>
                    </View>
                  ) : !ready ? (
                    <View style={S.tagSoon}>
                      <Text style={S.tagSoonTxt}>{copy.home?.levelSwitchSoon || "Yakında"}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(28, 27, 26, 0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 20,
    paddingBottom: spacing.xl,
    maxHeight: "86%",
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, gap: 12 },
  headerCopy: { flex: 1, gap: 4 },
  title: { color: C.ink, fontSize: 21, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { color: C.muted, fontSize: 13.5, lineHeight: 18 },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  list: { flexGrow: 0 },
  listContent: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.canvas,
  },
  rowCurrent: { borderColor: C.primary, backgroundColor: C.primarySubtle },
  rowDisabled: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  codeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBadgeCurrent: { backgroundColor: C.primary, borderColor: C.primary },
  codeTxt: { color: C.primary, fontWeight: "800", fontSize: 13 },
  codeTxtCurrent: { color: C.surface },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { color: C.ink, fontSize: 15.5, fontWeight: "700" },
  rowMeta: { color: C.muted, fontSize: 12.5 },
  tagCurrent: { backgroundColor: C.primary, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.xs },
  tagCurrentTxt: { color: C.surface, fontSize: 10.5, fontWeight: "800" },
  tagEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: C.successBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  tagEarnedTxt: { color: C.successText, fontSize: 10.5, fontWeight: "800" },
  tagSoon: { backgroundColor: C.streak, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.xs },
  tagSoonTxt: { color: C.muted, fontSize: 10.5, fontWeight: "700" },
  warnBox: {
    marginHorizontal: 20,
    backgroundColor: C.rewardSoft,
    borderWidth: 1,
    borderColor: C.rewardBorder,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
  },
  warnText: { color: C.rewardText, fontSize: 13.5, lineHeight: 19, fontWeight: "600" },
  warnActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  warnGhost: { minHeight: 44, paddingHorizontal: 14, justifyContent: "center" },
  warnGhostTxt: { color: C.muted, fontWeight: "700", fontSize: 13.5 },
  warnPrimary: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: C.primary,
  },
  warnPrimaryTxt: { color: C.surface, fontWeight: "800", fontSize: 13.5 },
});
