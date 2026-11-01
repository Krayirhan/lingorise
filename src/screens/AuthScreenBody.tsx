import { Dispatch, SetStateAction } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Copy } from "../i18n/en";
import { AuthTextField, PasswordVisibilityToggle } from "../components/AuthTextField";
import { AuthResetSentPanel, AuthSuccessPanel } from "../components/AuthStatusPanel";
import { C } from "../theme/colors";
import { S } from "./AuthScreen.styles";

type Mode = "login" | "register" | "forgot";
type ErrorField = "name" | "email" | "password" | "general" | null;
interface Props {
  copy: Copy; mode: Mode; setMode: Dispatch<SetStateAction<Mode>>; name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void; busy: boolean; error: string;
  setError: (v: string) => void; errorField: ErrorField; setErrorField: (v: ErrorField) => void;
  success: boolean; resetSent: boolean; setResetSent: (v: boolean) => void; submitLabel: string;
  submit: () => void; enableGuestMode: () => Promise<void>; onContinueAsGuest?: () => void;
}
export function AuthScreenBody(props: Props) {
  const { copy, mode, setMode, name, setName, email, setEmail, password, setPassword, showPassword,
    setShowPassword, busy, error, setError, errorField, setErrorField, success, resetSent, setResetSent,
    submitLabel, submit, enableGuestMode, onContinueAsGuest } = props;
  return (
            success ? (
              <AuthSuccessPanel
                title={copy.auth?.successTitle || "Profilin hazırlandı! 🌱"}
                subtitle={copy.auth?.successSubtitle || "Lingterra'ya hoş geldin"}
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
            )
  );
}

