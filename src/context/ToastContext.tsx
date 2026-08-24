import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, radius } from "../theme/colors";

export type ToastType = "success" | "info" | "attention";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showToast = useCallback((options: ToastOptions | string) => {
    const opt: ToastOptions = typeof options === "string" ? { message: options, type: "info" } : options;
    setToast(opt);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.delay(opt.durationMs || 3200),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [fadeAnim]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle" as const, color: C.successText };
      case "attention":
        return { name: "alert-circle" as const, color: C.attentionText };
      case "info":
      default:
        return { name: "information-circle" as const, color: C.primary };
    }
  };

  const getStyle = (type: ToastType) => {
    switch (type) {
      case "success":
        return S.toastSuccess;
      case "attention":
        return S.toastAttention;
      case "info":
      default:
        return S.toastInfo;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            S.toastContainer,
            getStyle(toast.type || "info"),
            { opacity: fadeAnim },
          ]}
        >
          <Ionicons
            name={getIcon(toast.type || "info").name}
            size={18}
            color={getIcon(toast.type || "info").color}
          />
          <Text style={S.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (opts: ToastOptions | string) => {
        console.log("Toast:", opts);
      },
    };
  }
  return context;
}

const S = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    maxWidth: "90%",
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md || 14,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    zIndex: 9999,
  },
  toastInfo: {
    backgroundColor: C.surface,
    borderColor: C.primaryBorder,
  },
  toastSuccess: {
    backgroundColor: C.successSoft,
    borderColor: C.successBorder,
  },
  toastAttention: {
    backgroundColor: C.attentionSoft,
    borderColor: C.attentionBorder,
  },
  toastText: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1,
  },
});
