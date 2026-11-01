import { errorDetail } from "../domain/account/errorDetails";
import { useApplication } from "../context/ApplicationContext";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { S } from "./AuthScreen.styles";
import { AuthScreenBody } from "./AuthScreenBody";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { getAuthErrorMessage } from "../domain/account/authErrors";
import { Locale, copyByLocale } from "../i18n/en";

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
  const application = useApplication();
  const { enableGuestMode } = application.account;
  const { login } = application.account;
  const { register } = application.account;
  const { resetPassword } = application.account;

  const copy = copyByLocale[locale];
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<"name" | "email" | "password" | "general" | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function validate(): boolean {
    setError("");
    setErrorField(null);

    if (mode === "register" && !name.trim()) {
      setError(copy.auth.errorNameRequired);
      setErrorField("name");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError(copy.auth.errorEmailRequired);
      setErrorField("email");
      return false;
    }

    if (mode !== "forgot" && password.length < 8) {
      setError(copy.auth.errorPasswordShort);
      setErrorField("password");
      return false;
    }

    return true;
  }

  async function submit() {
    if (!validate()) return;

    try {
      setBusy(true);
      if (mode === "register") {
        await register(email, password, name);
        setSuccess(true);
      } else if (mode === "login") {
        await login(email, password);
        setSuccess(true);
      } else if (mode === "forgot") {
        await resetPassword(email);
        setResetSent(true);
        return;
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (e) {
      const code = errorDetail(e, "code");
      const msg = getAuthErrorMessage(code, locale);
      setError(msg);
      if (code?.includes("email")) setErrorField("email");
      else if (code?.includes("password")) setErrorField("password");
      else setErrorField("general");
    } finally {
      setBusy(false);
    }
  }

  const submitLabel =
    mode === "register"
      ? copy.auth.submitRegister
      : mode === "login"
        ? copy.auth.submitLogin
        : copy.auth.sendResetEmailBtn;

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

            <AuthScreenBody copy={copy} mode={mode} setMode={setMode} name={name} setName={setName} email={email} setEmail={setEmail}
              password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword}
              busy={busy} error={error} setError={setError} errorField={errorField} setErrorField={setErrorField}
              success={success} resetSent={resetSent} setResetSent={setResetSent} submitLabel={submitLabel}
              submit={submit} enableGuestMode={enableGuestMode} onContinueAsGuest={onContinueAsGuest} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
