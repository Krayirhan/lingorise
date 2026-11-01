import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { SkillProgress } from "../home.types";
import { fonts, typeScale } from "../../../theme/typography";

interface Props {
  copy: Copy;
  skillProgress: SkillProgress[];
  practiceTargetCount?: number;
  onTilePress?: () => void;
}

/** The four skills as one plain list: rows with dividers, no card per row. */
export function GardenProgressCard({ copy, skillProgress, practiceTargetCount = 20, onTilePress }: Props) {
  const vocabSkill = skillProgress.find((s) => s.id === "skill_vocab");
  const vocabTag = vocabSkill && vocabSkill.percent > 0
    ? `%${vocabSkill.percent}`
    : `${practiceTargetCount} ${copy.home?.wordCountSuffix || "kelime"}`;

  const rows: {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    tag?: string;
    tint: string;
    isSoon?: boolean;
  }[] = [
    {
      id: "tile_vocab",
      icon: "albums-outline",
      title: copy.home?.vocabulary ? copy.home.vocabulary.split(" ")[0] : "Kelime",
      tag: vocabTag,
      tint: C.attentionSoft,
    },
    {
      id: "tile_grammar",
      icon: "create-outline",
      title: copy.home?.meaningMatch ? "Dilbilgisi" : "Grammar",
      tag: copy.home?.soon || "Yakında",
      tint: C.successSoft,
      isSoon: true,
    },
    {
      id: "tile_speaking",
      icon: "chatbubbles-outline",
      title: copy.home?.meaningMatch ? "Konuşma" : "Speaking",
      tag: copy.home?.soon || "Yakında",
      tint: C.rewardSoft,
      isSoon: true,
    },
    {
      id: "tile_listening",
      icon: "headset-outline",
      title: copy.home?.listening || "Dinleme",
      tag: copy.home?.soon || "Yakında",
      tint: C.disabledBg,
      isSoon: true,
    },
  ];

  return (
    <View style={S.list}>
      {rows.map((row, index) => {
        const body = (
          <>
            <View style={[S.iconWrap, { backgroundColor: row.tint }]}>
              <Ionicons name={row.icon} size={20} color={row.isSoon ? C.disabledText : C.primary} />
            </View>
            <Text numberOfLines={1} style={[S.title, row.isSoon && S.soonText]}>{row.title}</Text>
            {row.tag ? <Text numberOfLines={1} style={S.tag}>{row.tag}</Text> : null}
            {!row.isSoon && <Ionicons name="chevron-forward" size={18} color={C.muted} />}
          </>
        );
        const rowStyle = [S.row, index > 0 && S.divider];
        // "Soon" is information, not a destination: no chevron, not tappable.
        return row.isSoon ? (
          <View key={row.id} accessible accessibilityLabel={`${row.title}, ${row.tag}`} style={rowStyle}>
            {body}
          </View>
        ) : (
          <Pressable
            key={row.id}
            accessibilityRole="button"
            accessibilityLabel={row.tag ? `${row.title}, ${row.tag}` : row.title}
            style={({ pressed }) => [...rowStyle, pressed && S.rowPressed]}
            onPress={onTilePress}
          >
            {body}
          </Pressable>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  list: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 60,
    paddingVertical: 8,
  },
  divider: { borderTopWidth: 1, borderTopColor: C.line },
  rowPressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, color: C.primary, fontFamily: fonts.display, fontSize: typeScale.card },
  soonText: { color: C.muted },
  tag: { color: C.muted, fontFamily: fonts.body, fontSize: typeScale.caption },
});
