import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, radius } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { HomeTab } from "../home.types";

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
  { id: "garden", iconActive: "leaf", iconInactive: "leaf-outline", labelKey: "tabGarden" },
  { id: "practice", iconActive: "flash", iconInactive: "flash-outline", labelKey: "tabPractice" },
  { id: "progress", iconActive: "stats-chart", iconInactive: "stats-chart-outline", labelKey: "tabProgress" },
  { id: "profile", iconActive: "person", iconInactive: "person-outline", labelKey: "tabProfile" },
];

export function HomeBottomNav({
  copy,
  activeTab = "garden",
  onTabPress,
}: Props) {
  const insets = useSafeAreaInsets();
  // The bar owns its own clearance from the system gesture area — a fixed
  // floor guards against devices that under-report (or zero out) the inset
  // despite drawing a home indicator, so it never looks flush against it.
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
            <View style={[S.tabPill, isSel && S.tabPillActive]}>
              <View style={S.iconWrap}>
                <Ionicons
                  name={isSel ? tab.iconActive : tab.iconInactive}
                  size={22}
                  color={isSel ? C.primary : "#8D8883"}
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
    minHeight: 64,
    paddingTop: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E1D7",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    minHeight: 48,
  },
  tabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 24,
    gap: 3,
  },
  tabPillActive: {
    backgroundColor: C.primarySoft,
  },
  iconWrap: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  lblActive: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  lbl: {
    color: "#8D8883",
    fontSize: 11,
    fontWeight: "600",
  },
});

