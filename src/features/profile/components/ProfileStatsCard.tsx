import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { LevelCode } from "../../../types/content";

interface Props {
  copy: Copy;
  level: LevelCode;
  xp: number;
  streak: number;
  onChangeLevel: () => void;
}

export function ProfileStatsCard({ copy, level, xp, streak, onChangeLevel }: Props) {
  return (
    <View style={S.card}>
      <View style={S.userRow}>
        <View style={S.avatar}>
          <Ionicons name="person" size={26} color={C.primary} />
        </View>
        <View style={S.userCopy}>
          <Text style={S.userName}>{copy.profile?.userStatsTitle || "Bahçıvan İstatistikleri"}</Text>
          <Text style={S.userMeta}>{level} · {xp} XP · {streak} Gün Seri</Text>
        </View>
      </View>

      <View style={S.levelActionRow}>
        <View style={S.levelBadge}>
          <Text style={S.levelBadgeTxt}>{level}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.changeLevelBtn || "Seviyeyi Değiştir"}
          style={({ pressed }) => [S.changeBtn, pressed && S.changeBtnPre]}
          onPress={onChangeLevel}
        >
          <Text style={S.changeBtnTxt}>{copy.profile?.changeLevelBtn || "Seviyeyi Değiştir"}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: C.line, gap: 14 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.primaryBorder },
  userCopy: { flex: 1 },
  userName: { color: C.ink, fontSize: 16, fontWeight: "800" },
  userMeta: { color: C.muted, fontSize: 12, marginTop: 2, fontWeight: "600" },
  levelActionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.canvas, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: C.line },
  levelBadge: { backgroundColor: C.primary, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.xs },
  levelBadgeTxt: { color: C.surface, fontSize: 11, fontWeight: "800" },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeBtnPre: { opacity: 0.6 },
  changeBtnTxt: { color: C.primary, fontSize: 12, fontWeight: "800" },
});
