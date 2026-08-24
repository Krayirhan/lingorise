import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AppNavigator } from "./AppNavigator";
import { useUserProgress } from "../state/useUserProgress";
import { C } from "../theme/colors";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { AuthScreen } from "../screens/AuthScreen";
import { mergeAndSyncUserData } from "../services/firestore";
import { loadUserData, saveUserData } from "../services/storage";
import { loadCatalogue } from "../services/catalogueService";
import { setRuntimeQuestions } from "../content/questions";

import { ToastProvider } from "../context/ToastContext";

export function AppBootstrap() {
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [showAuth, setShowAuth] = useState(false);
  const [deepLinkTarget, setDeepLinkTarget] = useState<"home" | "practice" | "progress" | "profile" | null>(null);
  const [catalogueReady, setCatalogueReady] = useState(false);
  const userProgress = useUserProgress();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const localData = await loadUserData();
          const mergedData = await mergeAndSyncUserData(user.uid, localData);
          await saveUserData(mergedData);
          userProgress.refresh();
        } catch (err) {
          console.warn("LingoRise: Auth state change sync error", err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userProgress.isHydrated) return;
    setCatalogueReady(false);
    loadCatalogue(userProgress.userData.level)
      .then((catalogue) => setRuntimeQuestions(catalogue.questions))
      .finally(() => setCatalogueReady(true));
  }, [userProgress.isHydrated, userProgress.userData.level]);

  useEffect(() => {
    const applyUrl = (url: string | null) => {
      if (!url) return;
      const path = url.replace(/^lingorise:\/\//, "").split(/[/?#]/)[0];
      if (path === "practice" || path === "progress" || path === "profile" || path === "home") setDeepLinkTarget(path);
    };
    Linking.getInitialURL().then(applyUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => applyUrl(url));
    return () => subscription.remove();
  }, []);

  if (authUser === undefined) {
    return <LoadingScreen text="Bağlantı hazırlanıyor..." />;
  }

  if (showAuth) {
    return (
      <ToastProvider>
        <AuthScreen
          locale={userProgress.userData.locale}
          onBack={() => setShowAuth(false)}
          onContinueAsGuest={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      </ToastProvider>
    );
  }

  if (!userProgress.isHydrated || !catalogueReady) {
    return <LoadingScreen text="Bahçen hazırlanıyor..." />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppNavigator
          userProgress={userProgress}
          onAccountPress={() => setShowAuth(true)}
          deepLinkTarget={deepLinkTarget}
          onDeepLinkConsumed={() => setDeepLinkTarget(null)}
        />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <SafeAreaView style={S.loadingSafe} edges={["top", "bottom"]}>
      <View style={S.loadingContainer}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={S.loadingText}>{text}</Text>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  loadingSafe: { flex: 1, backgroundColor: C.canvas },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: C.primary, fontSize: 15, fontWeight: "700" },
});
