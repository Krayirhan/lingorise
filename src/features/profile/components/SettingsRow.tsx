import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../../theme/colors";
import { fonts, typeScale } from "../../../theme/typography";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  /** Value, toggle or control shown on the right. Omitted on a tappable row, which gets a chevron. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isFirst?: boolean;
}

/** One line of a grouped settings card: pastel icon circle, title, control. */
export function SettingsRow({ icon, tint, title, right, onPress, destructive, isFirst }: Props) {
  const content = (
    <>
      <View style={[S.icon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={destructive ? C.attentionText : C.primary} />
      </View>
      <Text numberOfLines={1} style={[S.title, destructive && S.titleDestructive]}>{title}</Text>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={C.muted} /> : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => [S.row, !isFirst && S.divider, pressed && S.pressed]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[S.row, !isFirst && S.divider]}>{content}</View>;
}

/** The cream card a group of SettingsRows sits in, with its serif heading. */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={S.group}>
      <Text accessibilityRole="header" style={S.groupTitle}>{title}</Text>
      <View style={S.list}>{children}</View>
    </View>
  );
}

const S = StyleSheet.create({
  group: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 4,
    gap: 6,
  },
  groupTitle: { color: C.ink, fontFamily: fonts.display, fontSize: typeScale.section, marginLeft: 2 },
  list: {},
  row: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, paddingVertical: 6 },
  divider: { borderTopWidth: 1, borderTopColor: C.lineSoft },
  pressed: { opacity: 0.7 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: C.ink, fontFamily: fonts.body, fontSize: 15 },
  titleDestructive: { color: C.attentionText, fontFamily: fonts.bodySemi },
});
