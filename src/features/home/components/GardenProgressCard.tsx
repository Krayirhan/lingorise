import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { SkillProgress } from "../home.types";

interface Props {
  copy: Copy;
  skillProgress: SkillProgress[];
  onViewProgress?: () => void;
}

export function GardenProgressCard({ copy, skillProgress, onViewProgress }: Props) {
  // Only show active ready skills on the home dashboard to keep it actionable
  const activeSkills = skillProgress.filter((s) => s.isReady);

  return (
    <View style={S.card}>
      {activeSkills.map((skill) => (
        <View key={skill.id} style={S.itemWrap}>
          <View style={S.row}>
            {/* 42px Icon Circle */}
            <View style={S.iconCircle}>
              <Ionicons
                name="book-outline"
                size={20}
                color={C.primary}
              />
            </View>

            {/* Title & Subtitle with clear explanation */}
            <View style={S.copy}>
              <Text style={S.title}>{skill.title}</Text>
              <Text style={S.meta}>
                {skill.meta || `${copy.home?.levelPrefix || "A1"} kelimelerinin %${skill.percent}'i`}
              </Text>
            </View>

            {/* Right side percentage */}
            <Text style={S.pct}>%{skill.percent}</Text>
          </View>

          {/* Progress Bar */}
          <View style={S.line}>
            <View
              style={[
                S.fill,
                { width: `${Math.max(8, Math.min(100, skill.percent))}%` },
              ]}
            />
          </View>
        </View>
      ))}

      {/* Action CTA Button */}
      {onViewProgress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.home?.progress || "Kelime ilerlemesini gör"}
          style={({ pressed }) => [S.actionBtn, pressed && S.actionBtnPressed]}
          onPress={onViewProgress}
        >
          <Text style={S.actionBtnTxt}>
            {copy.home?.progress || "Kelime ilerlemesini gör"} →
          </Text>
        </Pressable>
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
  itemWrap: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primarySoft,
    marginRight: 12,
  },
  copy: {
    flex: 1,
    paddingRight: 8,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontWeight: "700",
    fontSize: 17,
  },
  meta: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  pct: {
    color: C.ink,
    fontWeight: "700",
    fontSize: 15,
  },
  line: {
    height: 10,
    backgroundColor: C.lineSoft,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: 10,
    backgroundColor: C.success,
    borderRadius: 5,
  },
  actionBtn: {
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: C.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  actionBtnPressed: {
    opacity: 0.7,
  },
  actionBtnTxt: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13.5,
  },
});
