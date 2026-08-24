import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy, Locale } from "../../../i18n/en";
import { QuestHistoryEntry } from "../../../types/user";

interface Props {
  copy: Copy;
  locale: Locale;
  visible: boolean;
  questHistory: QuestHistoryEntry[];
  onClose: () => void;
}

/** Groups the flat history into one row per day, newest first. */
function groupByDate(entries: QuestHistoryEntry[]): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.date, (counts.get(entry.date) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function formatDate(date: string, locale: Locale): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
  });
}

export function QuestHistoryModal({ copy, locale, visible, questHistory, onClose }: Props) {
  if (!visible) return null;

  const days = groupByDate(questHistory || []);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.sheet}>
          <View style={S.header}>
            <View style={S.headerCopy}>
              <Text style={S.title}>{copy.home?.questHistoryTitle || "Görev Geçmişi"}</Text>
              <Text style={S.subtitle}>
                {copy.home?.questHistorySubtitle || "Tamamladığın günlük görevlerin kaydı."}
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Kapat" style={S.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={C.muted} />
            </Pressable>
          </View>

          {days.length === 0 ? (
            <View style={S.emptyBox}>
              <Ionicons name="calendar-outline" size={26} color={C.faint} />
              <Text style={S.emptyText}>
                {copy.home?.questHistoryEmpty ||
                  "Henüz kayıt yok. Bugünün görevlerini tamamladığında burada görünecek."}
              </Text>
            </View>
          ) : (
            <ScrollView style={S.list} contentContainerStyle={S.listContent} showsVerticalScrollIndicator={false}>
              {days.map((day) => (
                <View key={day.date} style={S.row}>
                  <View style={S.rowIcon}>
                    <Ionicons name="checkmark-done" size={16} color={C.successText} />
                  </View>
                  <Text style={S.rowDate}>{formatDate(day.date, locale)}</Text>
                  <Text style={S.rowCount}>
                    {(copy.home?.questHistoryCount || "{count} görev").replace("{count}", String(day.count))}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
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
    maxHeight: "80%",
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, gap: 12 },
  headerCopy: { flex: 1, gap: 4 },
  title: { color: C.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { color: C.muted, fontSize: 13.5, lineHeight: 18 },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  list: { flexGrow: 0 },
  listContent: { paddingHorizontal: 20, gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.canvas,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDate: { flex: 1, color: C.ink, fontSize: 14.5, fontWeight: "700" },
  rowCount: { color: C.muted, fontSize: 12.5, fontWeight: "600" },
  emptyBox: {
    marginHorizontal: 20,
    alignItems: "center",
    gap: 10,
    paddingVertical: 34,
    paddingHorizontal: 20,
    backgroundColor: C.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: C.line,
  },
  emptyText: { color: C.muted, fontSize: 13.5, lineHeight: 19, textAlign: "center" },
});
