import { useEffect, useState } from "react";
import { Fraunces_600SemiBold, Fraunces_700Bold, useFonts } from "@expo-google-fonts/fraunces";
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { ActivityIndicator, Linking, NativeModules, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createApplication } from "../application/createApplication";
import { AppDialog } from "../components/AppDialog";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { UpdateDialog } from "../components/UpdateDialog";
import { allQuestions, CONTENT_VERSION } from "../content/questions";
import { ApplicationContext, useApplication } from "../context/ApplicationContext";
import { initAppCheck } from "../infrastructure/appCheck";
import { createDependencies } from "../infrastructure/createDependencies";
import { AuthScreen } from "../screens/AuthScreen";
import { useUserProgress } from "../state/useUserProgress";
import { C } from "../theme/colors";
import { AppNavigator } from "./AppNavigator";
import { useProfileSwitch } from "./useProfileSwitch";

import { ToastProvider } from "../context/ToastContext";

// Runs once at bundle load, before any Firestore/Auth call this component
// tree can trigger — App Check must be attached before those calls happen,
// not from inside an effect that races the first auth-state callback.
initAppCheck();

export function AppBootstrap() {
  const [application] = useState(() => createApplication(createDependencies(), allQuestions, CONTENT_VERSION));
  return <ApplicationContext.Provider value={application}><ApplicationRoot /></ApplicationContext.Provider>;
}

function ApplicationRoot() {
  const application = useApplication();
  const [showAuth, setShowAuth] = useState(false);
  const [deepLinkTarget, setDeepLinkTarget] = useState<"home" | "practice" | "progress" | "profile" | null>(null);
  const [catalogueReady, setCatalogueReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const userProgress = useUserProgress(false);
  const profileSwitch = useProfileSwitch();
  useEffect(() => {
    if (profileSwitch.stage !== "ready") return;
    if (userProgress.userData.notificationsEnabled) {
      void application.reminders.scheduleDailyReminder(userProgress.userData.locale, false);
    } else {
      void application.reminders.cancelDailyReminder();
    }
  }, [profileSwitch.stage, profileSwitch.profile]);
  useEffect(() => {
    if (Platform.OS !== "android" || !NativeModules.LingterraUpdateCheck) return;
    let active = true;
    NativeModules.LingterraUpdateCheck.isUpdateAvailable()
      .then((available: boolean) => { if (active) setUpdateAvailable(available); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  // A failed font load falls back to the system face rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });

  useEffect(() => {
    if (!userProgress.isHydrated) return;
    setCatalogueReady(false);
    application.loadCatalogue(userProgress.userData.level)
      .finally(() => setCatalogueReady(true));
  }, [userProgress.isHydrated, userProgress.userData.level]);

  useEffect(() => {
    const applyUrl = (url: string | null | undefined) => {
      if (!url) return;
      const path = url.replace(/^(lingterra|lingorise):\/\//, "").split(/[/?#]/)[0];
      if (path === "practice" || path === "progress" || path === "profile" || path === "home") setDeepLinkTarget(path);
    };
    Linking.getInitialURL().then(applyUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => applyUrl(url));
    return () => subscription.remove();
  }, []);

  if (profileSwitch.stage !== "ready") {
    const tr = userProgress.userData.locale === "tr";
    const legacy = profileSwitch.stage === "legacy";
    const choice = profileSwitch.stage === "choice";
    const comparison = profileSwitch.comparison;
    const comparisonText = comparison
      ? tr
        ? `Misafir: ${comparison.guestWords} çözülmüş kelime · ${comparison.guestXp} XP\nHesap: ${comparison.accountWords} çözülmüş kelime · ${comparison.accountXp} XP\n\nBirleştirince ${comparison.additionalWords} yeni kelime eklenir; XP ${comparison.mergedXp} olur. Diğer öğrenme kayıtları da korunur. Misafir kaydı cihazda kalır.`
        : `Guest: ${comparison.guestWords} answered words · ${comparison.guestXp} XP\nAccount: ${comparison.accountWords} answered words · ${comparison.accountXp} XP\n\nMerging adds ${comparison.additionalWords} words and keeps ${comparison.mergedXp} XP. Other learning records are also preserved. Guest data stays on this device.`
      : (tr ? "Misafir ilerlemeni hesabına eklemek ister misin?" : "Would you like to add guest progress to your account?");
    const failureText = profileSwitch.failure === "permission"
      ? (tr ? "Hesap verilerine erişim reddedildi. Tekrar dene; sorun sürerse destekle iletişime geç." : "Account data access was denied. Try again or contact support.")
      : profileSwitch.failure === "connection"
        ? (tr ? "Buluta bağlanılamadı. İnternet bağlantını kontrol edip tekrar dene." : "Could not connect to the cloud. Check your connection and try again.")
        : profileSwitch.failure === "data"
          ? (tr ? "Profil verileri eşitlenemedi. İlerlemen korunuyor; tekrar dene." : "Profile data could not be synced. Your progress is preserved; try again.")
          : (tr ? "Bağlantını ve cihazındaki boş alanı kontrol edip tekrar dene. İlerlemen korunuyor." : "Check your connection and device storage, then try again. Your progress is preserved.");
    return <>
      <LoadingScreen text={tr ? "Profil hazırlanıyor..." : "Preparing your profile..."} />
      <AppDialog
        visible={legacy || choice || profileSwitch.stage === "error"}
        title={legacy ? (tr ? "Eski ilerlemeni bulduk" : "Previous progress found") : choice ? (tr ? "Misafir ilerlemen" : "Guest progress") : (tr ? "Profil açılamadı" : "Could not open profile")}
        message={legacy ? (tr ? "Bu cihazdaki eski ilerlemenin kime ait olduğunu doğrulayamıyoruz. Misafir profiline eklemek ister misin? Orijinal kayıt korunur." : "We cannot verify who owns this device's previous progress. Add it to the guest profile? The original will be preserved.") : choice ? comparisonText : failureText}
        primaryAction={{ label: legacy ? (tr ? "Misafire ekle" : "Add to guest") : choice ? (tr ? "Birleştir" : "Merge") : (tr ? "Tekrar dene" : "Try again"), onPress: () => { if (legacy) void profileSwitch.chooseLegacy(true); else if (choice) void profileSwitch.chooseAccount("merge"); else profileSwitch.retry(); } }}
        secondaryAction={legacy ? { label: tr ? "Şimdilik koru" : "Keep separate", onPress: () => { void profileSwitch.chooseLegacy(false); } } : choice ? { label: tr ? "Hesabımla devam et" : "Use my account", onPress: () => { void profileSwitch.chooseAccount("account"); } } : profileSwitch.hasAccount ? { label: tr ? "Misafir olarak devam et" : "Continue as guest", onPress: () => { void profileSwitch.backToGuest(); } } : undefined}
        onRequestClose={() => {}}
      />
    </>;
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

  if (!userProgress.isHydrated || !catalogueReady || (!fontsLoaded && !fontError)) {
    return <LoadingScreen text="Bahçen hazırlanıyor..." />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppNavigator
          key={profileSwitch.profile}
          userProgress={userProgress}
          onAccountPress={() => setShowAuth(true)}
          deepLinkTarget={deepLinkTarget}
          onDeepLinkConsumed={() => setDeepLinkTarget(null)}
        />
        <UpdateDialog
          visible={updateAvailable && Boolean(userProgress.userData.onboardingCompleted) && !userProgress.userData.activeSession}
          locale={userProgress.userData.locale}
          onClose={() => setUpdateAvailable(false)}
          reduceMotion={userProgress.userData.reduceMotion}
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
