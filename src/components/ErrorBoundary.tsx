import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./PrimaryButton";
import { C, radius, spacing } from "../theme/colors";

interface Props {
  children: ReactNode;
  onRestart?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("LingoRise ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRestart = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRestart) {
      this.props.onRestart();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
          <View style={S.container}>
            <View style={S.iconCircle}>
              <Ionicons name="leaf-outline" size={36} color={C.primary} />
            </View>
            <Text style={S.title}>Bir şeyler beklenmedik şekilde gelişti</Text>
            <Text style={S.subtitle}>
              Bahçen güvende. Uygulamayı yeniden başlatarak kaldığın yerden devam edebilirsin.
            </Text>
            <View style={S.buttonWrapper}>
              <PrimaryButton
                label="Uygulamayı Yeniden Başlat"
                onPress={this.handleRestart}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },
  buttonWrapper: {
    width: "100%",
    maxWidth: 320,
    marginTop: 14,
  },
});
