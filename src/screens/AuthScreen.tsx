import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../components/Brand";
import { C } from "../theme/colors";
import { enableGuestMode, getAuthErrorMessage, login, register, resetPassword } from "../services/auth";
import { Locale, copyByLocale } from "../i18n/en";
import { AuthTextField, PasswordVisibilityToggle } from "../components/AuthTextField";
import { AuthResetSentPanel, AuthSuccessPanel } from "../components/AuthStatusPanel";
import { S } from "./AuthScreen.styles";

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
      setError(copy.auth?.errorNameRequired || "Lütfen adını gir.");
      setErrorField("name");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError(copy.auth?.errorEmailRequired || "Geçerli bir e-posta adresi gir.");
      setErrorField("email");
      return false;
    }

    if (mode !== "forgot" && password.length < 8) {
      setError(copy.auth?.errorPasswordShort || "Şifre en az 8 karakter olmalı.");
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
    } catch (e: any) {
      const code = e?.code as string | undefined;
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
      ? copy.auth?.submitRegister || "Hesabımı oluştur"
      : mode === "login"
        ? copy.auth?.submitLogin || "Giriş yap"
        : copy.auth?.sendResetEmailBtn || "Sıfırlama Bağlantısı Gönder";

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
                  accessibilityLabel={copy.auth?.backBtn || "Geri"}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={({ pressed }) => [S.backBtn, pressed && S.btnPressed]}
                  onPress={onBack}
                >
                  <Ionicons name="chevron-back" size={20} color={C.ink} />
                  <Text style={S.backBtnTxt}>{copy.auth?.backBtn || "Geri"}</Text>
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
                    ? copy.auth?.titleRegister || "Öğrenme profilini oluşturalım."
                    : mode === "login"
                      ? copy.auth?.titleLogin || "Tekrar hoş geldin."
                      : copy.auth?.forgotPasswordTitle || "Şifre Sıfırla"}
                </Text>
                <Text style={S.subtitle}>
                  {mode === "register"
                    ? copy.auth?.subtitleRegister || "İlerlemen her cihazında seninle gelsin."
                    : mode === "login"
                      ? copy.auth?.subtitleLogin || "Kaldığın yerden öğrenmeye devam et."
                      : copy.auth?.forgotPasswordSubtitle || "Şifre sıfırlama bağlantısı almak için e-posta adresini gir."}
                </Text>
              </View>
              <Image source={sprig} style={S.mascot} resizeMode="contain" />
            </View>

            {success ? (
              <AuthSuccessPanel
                title={copy.auth?.successTitle || "Profilin hazırlandı! 🌱"}
                subtitle={copy.auth?.successSubtitle || "LingoRise'a hoş geldin"}
              />
            ) : resetSent ? (
              <AuthResetSentPanel
                title={copy.auth?.resetEmailSentSuccess || "Sıfırlama bağlantısı gönderildi ✉️"}
                subtitle={copy.auth?.forgotPasswordSubtitle || "E-postanı kontrol ederek yeni şifreni belirleyebilirsin."}
                backToLoginLabel="Giriş ekranına dön"
                onBackToLogin={() => {
                  setResetSent(false);
                  setMode("login");
                  setError("");
                }}
              />
            ) : (
              <View style={S.form}>
                {mode === "register" && (
                  <AuthTextField
                    label={copy.auth?.nameLabel || "Adın"}
                    icon="person-outline"
                    value={name}
                    onChangeText={(txt) => {
                      setName(txt);
                      if (errorField === "name") setError("");
                    }}
                    placeholder={copy.auth?.namePlaceholder || "Örn. Can"}
                    accessibilityLabel={copy.auth?.nameLabel || "Adın"}
                    hasError={errorField === "name"}
                    autoCapitalize="words"
                  />
                )}

                <AuthTextField
                  label={copy.auth?.emailLabel || "E-posta"}
                  icon="mail-outline"
                  value={email}
                  onChangeText={(txt) => {
                    setEmail(txt);
                    if (errorField === "email") setError("");
                  }}
                  placeholder={copy.auth?.emailPlaceholder || "ornek@email.com"}
                  accessibilityLabel={copy.auth?.emailLabel || "E-posta"}
                  hasError={errorField === "email"}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                {mode !== "forgot" && (
                  <AuthTextField
                    label={copy.auth?.passwordLabel || "Şifre"}
                    icon="lock-closed-outline"
                    value={password}
                    onChangeText={(txt) => {
                      setPassword(txt);
                      if (errorField === "password") setError("");
                    }}
                    placeholder={copy.auth?.passwordPlaceholder || "••••••••"}
                    accessibilityLabel={copy.auth?.passwordLabel || "Şifre"}
                    hasError={errorField === "password"}
                    secureTextEntry={!showPassword}
                    hintText={copy.auth?.passwordHint || "En az 8 karakter kullan."}
                    labelAccessory={
                      mode === "login" ? (
                        <Pressable
                          onPress={() => {
                            setMode("forgot");
                            setError("");
                            setErrorField(null);
                          }}
                        >
                          <Text style={S.forgotLink}>{copy.auth?.forgotPasswordLink || "Şifremi unuttum"}</Text>
                        </Pressable>
                      ) : undefined
                    }
                    rightAccessory={
                      <PasswordVisibilityToggle
                        visible={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                        showLabel={copy.auth?.showPassword || "Şifreyi göster"}
                        hideLabel={copy.auth?.hidePassword || "Şifreyi gizle"}
                      />
                    }
                  />
                )}

                {!!error && (
                  <View style={S.errorBox} accessibilityLiveRegion="assertive">
                    <Ionicons name="alert-circle" size={17} color={C.attentionText} />
                    <Text style={S.errorText}>{error}</Text>
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={submitLabel}
                  style={({ pressed }) => [S.primaryBtn, busy && S.primaryBtnBusy, pressed && S.btnPressed]}
                  onPress={submit}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color={C.ink} />
                  ) : (
                    <Text style={S.primaryBtnTxt}>
                      {mode === "register"
                        ? copy.auth?.submitRegister || "Hesabımı oluştur →"
                        : mode === "login"
                          ? copy.auth?.submitLogin || "Giriş yap →"
                          : copy.auth?.sendResetEmailBtn || "Sıfırlama Bağlantısı Gönder →"}
                    </Text>
                  )}
                </Pressable>

                {mode === "register" && (
                  <Text style={S.termsText}>
                    {copy.auth?.termsNotice ||
                      "Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası’nı kabul etmiş olursun."}
                  </Text>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === "register" ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"
                  }
                  onPress={() => {
                    setMode(mode === "register" ? "login" : "register");
                    setError("");
                    setErrorField(null);
                  }}
                  style={S.switchBtn}
                >
                  <Text style={S.switchRegular}>
                    {mode === "register"
                      ? copy.auth?.switchHasAccount || "Zaten hesabın var mı? "
                      : mode === "login"
                        ? copy.auth?.switchNoAccount || "Hesabın yok mu? "
                        : "Giriş ekranına dönmek için "}
                    <Text style={S.switchHighlight}>
                      {mode === "register"
                        ? copy.auth?.switchHasAccountLink || "Giriş yap"
                        : mode === "login"
                          ? copy.auth?.switchNoAccountLink || "Kayıt ol"
                          : "Giriş yap"}
                    </Text>
                  </Text>
                </Pressable>

                {onContinueAsGuest && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy.auth?.continueAsGuest || "Hesap açmadan devam et"}
                    style={S.guestBtn}
                    onPress={async () => {
                      await enableGuestMode();
                      onContinueAsGuest();
                    }}
                  >
                    <Text style={S.guestTxt}>{copy.auth?.continueAsGuest || "Şimdilik hesap açmadan devam et"}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
