import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { DailyQuest } from "../../../types/user";

interface Props {
  copy: Copy;
  dailyQuests: DailyQuest[];
  onHistoryPress?: () => void;
}

export function DailyQuestCard({ copy, dailyQuests, onHistoryPress }: Props) {
  const isEmpty = !dailyQuests || dailyQuests.length === 0;
  const allCompleted = dailyQuests.length > 0 && dailyQuests.every((q) => q.completed);

  return (
    <View style={S.card}>
      <View style={S.hdr}>
        <Text style={S.hdrTxt}>
          {copy.home?.dailyQuestsHeader || "GÜNLÜK GÖREVLER"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.home?.questHistoryBtn || "Günlük görev geçmişi"}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [S.calBtn, pressed && S.calBtnPressed]}
          onPress={onHistoryPress}
        >
          <Ionicons name="calendar-outline" size={14} color={C.primary} />
          <Text style={S.calTxt}>{copy.home?.questHistoryBtn || "Geçmiş"}</Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <Text style={S.emptyTxt}>
          {copy.home?.dailyQuestsEmpty ||
            "Bugünün görevlerini tamamladın. Yarın yeni görevler burada."}
        </Text>
      ) : (
        <View style={S.list}>
          {dailyQuests.map((q) => {
            const questTemplate =
              q.id === "quest_daily_practice"
                ? copy.home?.questDailyPractice || "{count} kelimeyi doğru bil"
                : copy.home?.questDailyReview || "{count} tekrarı tamamla";
            const questTitle = questTemplate.replace("{count}", String(q.target));

            return (
              // Quests report the state of the day; the hero card is the one
              // place you start practising from.
              <View
                key={q.id}
                accessibilityRole="text"
                accessibilityLabel={`${questTitle}, ${q.current}/${q.target}, +${q.xpReward} XP`}
                style={[S.row, q.completed ? S.rowDone : S.rowActive]}
              >
                {/* Check / Circle Icon */}
                <View style={S.checkWrap}>
                  <Ionicons
                    name={q.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={q.completed ? C.success : C.primary}
                  />
                </View>

                {/* Content */}
                <View style={S.copy}>
                  <Text style={[S.title, q.completed && S.titleDone]}>
                    {questTitle}
                  </Text>
                  {!q.completed && (
                    <Text style={S.meta}>
                      {q.current} / {q.target} tamamlandı
                    </Text>
                  )}
                </View>

                {/* Reward Badge */}
                <View style={[S.badge, q.completed ? S.badgeDone : S.badgeActive]}>
                  <Text style={[S.badgeTxt, q.completed ? S.badgeTxtDone : S.badgeTxtActive]}>
                    +{q.xpReward} XP
                  </Text>
                </View>
              </View>
            );
          })}

          {allCompleted && (
            <View style={S.allDoneNote}>
              <Ionicons name="checkmark-done" size={15} color={C.primary} />
              <Text style={S.allDoneText}>
                Bugünün tüm görevleri tamamlandı! Yarın yeni görevler burada.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hdrTxt: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  calBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  calBtnPressed: {
    opacity: 0.6,
  },
  calTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  emptyTxt: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  rowActive: {
    backgroundColor: C.canvas,
    borderColor: C.line,
  },
  rowDone: {
    backgroundColor: C.canvas,
    borderColor: C.line,
    opacity: 0.7,
  },
  rowPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  checkWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },
  titleDone: {
    color: C.successText,
  },
  meta: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "400",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: radius.xs,
  },
  badgeActive: {
    backgroundColor: C.primarySoft,
  },
  badgeDone: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTxtActive: {
    color: C.primary,
  },
  badgeTxtDone: {
    color: C.successText,
  },
  allDoneNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  allDoneText: {
    color: C.primary,
    fontSize: 12.5,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
});

