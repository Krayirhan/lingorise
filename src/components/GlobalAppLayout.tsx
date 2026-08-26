import { ReactNode } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalTopBar, GlobalTopBarProps } from "./GlobalTopBar";
import { GlobalBottomNav } from "./GlobalBottomNav";
import { Copy } from "../i18n/en";
import { HomeTab } from "../features/home/home.types";
import { C } from "../theme/colors";

export interface GlobalAppLayoutProps {
  topBarProps: GlobalTopBarProps;
  copy: Copy;
  activeTab: HomeTab;
  onTabPress: (tab: HomeTab) => void;
  children: ReactNode;
}

export function GlobalAppLayout({
  topBarProps,
  copy,
  activeTab,
  onTabPress,
  children,
}: GlobalAppLayoutProps) {
  return (
    <SafeAreaView style={S.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <View style={S.shell}>
        {/* Unified Global Top Bar */}
        <GlobalTopBar {...topBarProps} />

        {/* Dynamic Screen Body Content */}
        <View style={S.content}>{children}</View>

        {/* Unified Global Bottom Navigation Bar */}
        <GlobalBottomNav
          copy={copy}
          activeTab={activeTab}
          onTabPress={onTabPress}
        />
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  shell: {
    flex: 1,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
  },
  content: {
    flex: 1,
  },
});
