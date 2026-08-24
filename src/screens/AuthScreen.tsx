import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../components/Brand";
import { C, radius } from "../theme/colors";
import { enableGuestMode, getAuthErrorMessage, login, register, resetPassword } from "../services/auth";
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

  return (
    <SafeAreaView style={S.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={S.kav}
      >
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

            {/* Success / Reset Sent State Indicator */}
            {success ? (
              <View style={S.successBox} accessibilityLiveRegion="polite">
                <Ionicons name="checkmark-circle" size={32} color={C.success} />
                <Text style={S.successTitle}>
                  {copy.auth?.successTitle || "Profilin hazırlandı! 🌱"}
                </Text>
                <Text style={S.successSubtitle}>
                  {copy.auth?.successSubtitle || "LingoRise'a hoş geldin"}
                </Text>
              </View>
            ) : resetSent ? (
              <View style={S.successBox} accessibilityLiveRegion="polite">
                <Ionicons name="mail" size={32} color={C.primary} />
                <Text style={S.successTitle}>
                  {copy.auth?.resetEmailSentSuccess || "Sıfırlama bağlantısı gönderildi ✉️"}
                </Text>
                <Text style={S.successSubtitle}>
                  {copy.auth?.forgotPasswordSubtitle || "E-postanı kontrol ederek yeni şifreni belirleyebilirsin."}
                </Text>
                <Pressable
                  style={S.backToLoginBtn}
                  onPress={() => {
                    setResetSent(false);
                    setMode("login");
                    setError("");
                  }}
                >
                  <Text style={S.backToLoginTxt}>Giriş ekranına dön</Text>
                </Pressable>
              </View>
            ) : (
              /* Form Fields */
              <View style={S.form}>
                {mode === "register" && (
                  <View style={S.fieldGroup}>
                    <Text style={S.label}>{copy.auth?.nameLabel || "Adın"}</Text>
                    <View
                      style={[
                        S.inputWrap,
                        errorField === "name" && S.inputWrapError,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color={errorField === "name" ? C.attention : C.muted}
                      />
                      <TextInput
                        value={name}
                        onChangeText={(txt) => {
                          setName(txt);
                          if (errorField === "name") setError("");
                        }}
                        placeholder={copy.auth?.namePlaceholder || "Örn. Can"}
                        placeholderTextColor={C.faint}
                        style={S.input}
                        autoCapitalize="words"
                        accessibilityLabel={copy.auth?.nameLabel || "Adın"}
                      />
                    </View>
                  </View>
                )}

                {/* Email Field */}
                <View style={S.fieldGroup}>
                  <Text style={S.label}>{copy.auth?.emailLabel || "E-posta"}</Text>
                  <View
                    style={[
                      S.inputWrap,
                      errorField === "email" && S.inputWrapError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={errorField === "email" ? C.attention : C.muted}
                    />
                    <TextInput
                      value={email}
                      onChangeText={(txt) => {
                        setEmail(txt);
                        if (errorField === "email") setError("");
                      }}
                      placeholder={copy.auth?.emailPlaceholder || "ornek@email.com"}
                      placeholderTextColor={C.faint}
                      style={S.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      accessibilityLabel={copy.auth?.emailLabel || "E-posta"}
                    />
                  </View>
                </View>

                {/* Password Field (Hidden in Forgot Password mode) */}
                {mode !== "forgot" && (
                  <View style={S.fieldGroup}>
                    <View style={S.labelRow}>
                      <Text style={S.label}>{copy.auth?.passwordLabel || "Şifre"}</Text>
                      {mode === "login" && (
                        <Pressable
                          onPress={() => {
                            setMode("forgot");
                            setError("");
                            setErrorField(null);
                          }}
                        >
                          <Text style={S.forgotLink}>
                            {copy.auth?.forgotPasswordLink || "Şifremi unuttum"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    <View
                      style={[
                        S.inputWrap,
                        errorField === "password" && S.inputWrapError,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={errorField === "password" ? C.attention : C.muted}
                      />
                      <TextInput
                        value={password}
                        onChangeText={(txt) => {
                          setPassword(txt);
                          if (errorField === "password") setError("");
                        }}
                        placeholder={copy.auth?.passwordPlaceholder || "••••••••"}
                        placeholderTextColor={C.faint}
                        style={S.input}
                        secureTextEntry={!showPassword}
                        accessibilityLabel={copy.auth?.passwordLabel || "Şifre"}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword
                            ? copy.auth?.hidePassword || "Şifreyi gizle"
                            : copy.auth?.showPassword || "Şifreyi göster"
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={S.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={19}
                          color={C.muted}
                        />
                      </Pressable>
                    </View>
                    <Text style={S.hintText}>
                      {copy.auth?.passwordHint || "En az 8 karakter kullan."}
                    </Text>
                  </View>
                )}

                {/* Inline Error Box */}
                {!!error && (
                  <View style={S.errorBox} accessibilityLiveRegion="assertive">
                    <Ionicons name="alert-circle" size={17} color={C.attentionText} />
                    <Text style={S.errorText}>{error}</Text>
                  </View>
                )}

                {/* Primary Gold CTA */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === "register"
                      ? copy.auth?.submitRegister || "Hesabımı oluştur"
                      : mode === "login"
                        ? copy.auth?.submitLogin || "Giriş yap"
                        : copy.auth?.sendResetEmailBtn || "Sıfırlama Bağlantısı Gönder"
                  }
                  style={({ pressed }) => [
                    S.primaryBtn,
                    busy && S.primaryBtnBusy,
                    pressed && S.btnPressed,
                  ]}
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

                {/* Terms and Privacy Notice */}
                {mode === "register" && (
                  <Text style={S.termsText}>
                    {copy.auth?.termsNotice ||
                      "Kayıt olarak Kullanım Koşulları ve Gizlilik Politikası’nı kabul etmiş olursun."}
                  </Text>
                )}

                {/* Switch Login / Register / Forgot Mode Link */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === "register"
                      ? "Zaten hesabın var mı? Giriş yap"
                      : "Hesabın yok mu? Kayıt ol"
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
                    <Text style={S.guestTxt}>
                      {copy.auth?.continueAsGuest || "Şimdilik hesap açmadan devam et"}
                    </Text>
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

const S = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  brandHeader: {
    justifyContent: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  backBtnTxt: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  introRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    gap: 12,
  },
  introCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: C.ink,
    fontSize: 27,
    fontWeight: "700",
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "400",
  },
  mascot: {
    width: 68,
    height: 72,
    marginTop: -4,
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrapError: {
    borderColor: C.attention,
    backgroundColor: C.attentionSoft,
  },
  input: {
    flex: 1,
    height: 52,
    color: C.ink,
    fontSize: 15,
    fontWeight: "500",
  },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },
  hintText: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
    paddingLeft: 2,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.attentionSoft,
    borderWidth: 1,
    borderColor: C.attentionBorder,
    borderRadius: radius.md || 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    color: C.attentionText,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  primaryBtn: {
    height: 52,
    minHeight: 52,
    borderRadius: radius.button || 18,
    backgroundColor: C.reward,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnBusy: {
    opacity: 0.7,
  },
  primaryBtnTxt: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  termsText: {
    color: C.muted,
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  switchBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: 8,
  },
  switchRegular: {
    color: C.muted,
    fontSize: 13.5,
    fontWeight: "500",
  },
  switchHighlight: {
    color: C.primary,
    fontWeight: "700",
  },
  guestBtn: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
  },
  guestTxt: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    color: C.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },
  backToLoginBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backToLoginTxt: {
    color: C.primary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  successBox: {
    backgroundColor: C.successSoft,
    borderWidth: 1,
    borderColor: C.successBorder,
    borderRadius: radius.card || 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  successTitle: {
    color: C.successText,
    fontSize: 18,
    fontWeight: "700",
  },
  successSubtitle: {
    color: C.muted,
    fontSize: 14,
  },
});
