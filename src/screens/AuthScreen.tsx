import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { S } from "./AuthScreen.styles";
import { AuthScreenBody } from "./AuthScreenBody";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { useAuthForm } from "../features/auth/useAuthForm";
import { Locale, copyByLocale } from "../i18n/en";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sprig = require("../../assets/sprig-mascot-idle-transparent.png");

interface AuthScreenProps {
  onBack?: () => void;
  initialMode?: "login" | "register" | "forgot";
  locale?: Locale;
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export function AuthScreen({
  onBack,
  initialMode = "register",
  locale = "tr",
  onSuccess,
  onContinueAsGuest,
}: AuthScreenProps) {
  const copy = copyByLocale[locale];
  const form = useAuthForm(copy, locale, initialMode, onSuccess);
  const { mode } = form;

  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={S.kav}>
        <ScrollView
          contentContainerStyle={S.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={S.container}>
            {/* Top Navigation & Brand Header */}
            <View style={S.topBar}>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.auth.backBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [S.backBtn, pressed && S.btnPressed]}
                  onPress={onBack}
                >
                  <Ionicons name="chevron-back" size={20} color={C.ink} />
                  <Text style={S.backBtnTxt}>{copy.auth.backBtn}</Text>
                </Pressable>
              ) : (
                <View style={S.brandHeader}>
                  <Brand size={28} />
                </View>
              )}
            </View>

            {/* Welcome Greeting & Mascot */}
            <View style={S.introRow}>
              <View style={S.introCopy}>
                <Text style={S.title}>
                  {mode === "register"
                    ? copy.auth.titleRegister
                    : mode === "login"
                      ? copy.auth.titleLogin
                      : copy.auth.forgotPasswordTitle}
                </Text>
                <Text style={S.subtitle}>
                  {mode === "register"
                    ? copy.auth.subtitleRegister
                    : mode === "login"
                      ? copy.auth.subtitleLogin
                      : copy.auth.forgotPasswordSubtitle}
                </Text>
              </View>
              <Image source={sprig} style={S.mascot} resizeMode="contain" />
            </View>

            <AuthScreenBody copy={copy} {...form} onContinueAsGuest={onContinueAsGuest} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
