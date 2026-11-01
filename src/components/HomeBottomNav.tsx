import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "../theme/colors";
import { Copy } from "../i18n/en";
import { HomeTab } from "./navigation";
import { fonts } from "../theme/typography";

interface Props {
  copy: Copy;
  activeTab?: HomeTab;
  onTabPress: (tab: HomeTab) => void;
}

const TABS: {
  id: HomeTab;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
  labelKey: "tabGarden" | "tabPractice" | "tabProgress" | "tabProfile";
}[] = [
  { id: "garden", iconActive: "home", iconInactive: "home-outline", labelKey: "tabGarden" },
  { id: "practice", iconActive: "compass", iconInactive: "compass-outline", labelKey: "tabPractice" },
  { id: "progress", iconActive: "stats-chart", iconInactive: "stats-chart-outline", labelKey: "tabProgress" },
  { id: "profile", iconActive: "book", iconInactive: "book-outline", labelKey: "tabProfile" },
];

export function HomeBottomNav({
  copy,
  activeTab = "garden",
  onTabPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View style={[S.nav, { paddingBottom: bottomPadding }]} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const isSel = activeTab === tab.id;
        const label = copy.home?.[tab.labelKey] || tab.id;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isSel }}
            style={S.item}
            onPress={() => onTabPress(tab.id)}
          >
            {isSel ? <View style={S.topIndicator} /> : <View style={S.topIndicatorSpacer} />}
            <View style={S.tabContent}>
              <View style={S.iconWrap}>
                <Ionicons
                  name={isSel ? tab.iconActive : tab.iconInactive}
                  size={23}
                  color={isSel ? C.attention : C.primary}
                />
              </View>
              <Text style={isSel ? S.lblActive : S.lbl}>{label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const S = StyleSheet.create({
  nav: {
    minHeight: 66,
    paddingTop: 0,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.primaryBorder,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 60,
    minHeight: 54,
  },
  topIndicator: {
    width: 42,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: C.attention,
    marginBottom: 6,
  },
  topIndicatorSpacer: {
    width: 42,
    height: 3.5,
    marginBottom: 6,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 3,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  lblActive: {
    color: C.attention,
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
  },
  lbl: {
    color: C.primary,
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
  },
});

