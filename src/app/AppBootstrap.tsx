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
import { rolloverToToday } from "../domain/gamification/dailyRollover";
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
    // onAuthStateChanged has no timeout of its own — on a network that can't
    // reach Firebase at all, the callback may simply never fire, leaving
    // authUser stuck at undefined and the whole app on "Bağlantı
    // hazırlanıyor..." forever, with no way forward even for someone who
    // only wants to use the app as a guest. Same class of bug as the
    // unbounded catalogue fetch this session already fixed (found chasing a
    // CI smoke test that kept hanging past every timeout tried, up to 150s).
    // Falling back to the guest/signed-out state after a bounded wait is
    // exactly this app's existing offline-first design intent (see 02
    // Purpose: "guest mode works fully without an account") — this makes
    // that guarantee hold even when the very first network call fails.
    let settled = false;
    const authTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setAuthUser((current) => (current === undefined ? null : current));
      }
    }, 8000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      settled = true;
      clearTimeout(authTimeout);
      setAuthUser(user);
      if (user) {
        try {
          // Rolled over to the device's actual current date BEFORE merging —
          // a stale, long-unopened device's raw streak/daily state must be
          // normalized first, or a cross-device merge can resurrect a
          // frozen-stale streak and mask the gap from ever being detected
          // afterwards (DATA-QA-006).
          const rawLocalData = await loadUserData();
          const { data: localData } = rolloverToToday(rawLocalData);
          const mergedData = await mergeAndSyncUserData(user.uid, localData);
          await saveUserData(mergedData);
          userProgress.refresh();
        } catch (err) {
          // A failed merge (including an unknown remote state — see
          // RemoteStateUnknownError) must leave local data untouched, not
          // silently push or persist anything; the learner is still told,
          // instead of this failing only to the console (REL-QA-004 /
          // GLOBAL-QA-004).
          console.warn("LingoRise: Auth state change sync error", err);
          userProgress.reportCloudSyncFailure();
        }
      }
    });
    return () => {
      clearTimeout(authTimeout);
      unsub();
    };
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
