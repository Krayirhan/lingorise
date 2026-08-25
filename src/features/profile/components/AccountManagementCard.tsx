import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from "react-native";
import { updateProfile } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../services/firebase";
import { deleteAccount, logout, resetPassword, sendVerificationEmail } from "../../../services/auth";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { AvatarPicker, AVATARS } from "./AvatarPicker";
import { EditableAccountName } from "./EditableAccountName";
import { S } from "./AccountManagementCard.styles";

interface Props {
  copy: Copy;
  displayName?: string;
  avatarId?: string;
  onDisplayNameChange?: (name: string) => void;
  onAvatarChange?: (avatarId: string) => void;
  onOpenAuth: () => void;
  onLoggedOut?: () => void;
}

export function AccountManagementCard({
  copy,
  displayName = "LingoRise Bahçıvanı",
  avatarId = "sprig",
  onDisplayNameChange,
  onAvatarChange,
  onOpenAuth,
  onLoggedOut,
}: Props) {
  const user = auth.currentUser;
  const isGuest = !user;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.displayName || displayName);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (user) {
      try {
        setBusy(true);
        await updateProfile(user, { displayName: trimmed });
      } catch (e) {
        console.warn("Update profile error", e);
      } finally {
        setBusy(false);
      }
    }
    if (onDisplayNameChange) onDisplayNameChange(trimmed);
    setEditingName(false);
  };

  const handleLogout = async () => {
    try {
      setBusy(true);
      await logout();
      if (onLoggedOut) onLoggedOut();
    } catch (e: any) {
      console.warn("Logout error", e);
    } finally {
      setBusy(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setBusy(true);
      await sendVerificationEmail();
      setNotice(
        copy.profile?.verificationSent ||
          "Doğrulama bağlantısı e-posta adresine gönderildi."
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "Doğrulama e-postası gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      setBusy(true);
      await resetPassword(user.email);
      setNotice(
        copy.auth?.resetEmailSentSuccess ||
          "Şifre sıfırlama bağlantısı e-posta adresine gönderildi."
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (e: any) {
      Alert.alert("Hata", e?.message || "Şifre sıfırlama e-postası gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmMsg =
      copy.profile?.deleteAccountConfirm ||
      "Hesabını ve buluttaki tüm ilerlemeni kalıcı olarak silmek istediğinden emin misin? Bu işlem geri alınamaz.";

    if (Platform.OS === "web") {
      if (window.confirm(confirmMsg)) {
        void executeDelete();
      }
    } else {
      Alert.alert("Hesabı Sil", confirmMsg, [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => void executeDelete(),
        },
      ]);
    }
  };

  const executeDelete = async () => {
    try {
      setBusy(true);
      await deleteAccount();
      if (onLoggedOut) onLoggedOut();
    } catch (e: any) {
      if (e?.code === "auth/requires-recent-login") {
        Alert.alert(
          "Yeniden Giriş Gerekli",
          "Güvenliğin için hesabını silmeden önce lütfen oturumu kapatıp yeniden giriş yap."
        );
      } else {
        Alert.alert(
          "Hata",
          "Hesap silinirken bir hata oluştu. Lütfen tekrar giriş yapıp deneyin."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const currentAvatarIcon = AVATARS.find((a) => a.id === avatarId)?.icon || "leaf-outline";

  if (isGuest) {
    return (
      <View style={S.card}>
        <View style={S.headerRow}>
          <View style={S.iconCircleGuest}>
            <Ionicons name={currentAvatarIcon} size={24} color={C.primary} />
          </View>
          <View style={S.copy}>
            <View style={S.nameRow}>
              <EditableAccountName
                name={displayName}
                nameStyle={S.title}
                editing={editingName}
                nameInput={nameInput}
                onNameInputChange={setNameInput}
                onStartEdit={() => setEditingName(true)}
                onSave={handleSaveName}
              />
            </View>
            <Text style={S.subtitle}>
              {copy.profile?.accountGuestSubtitle ||
                "İlerlemen bu cihazda güvenle saklanıyor. Tüm cihazlarında eşitlemek için hesap bağla."}
            </Text>
          </View>
        </View>

        <AvatarPicker avatarId={avatarId} onAvatarChange={onAvatarChange} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.loginRegisterBtn || "Giriş Yap veya Kayıt Ol"}
          style={S.authBtn}
          onPress={onOpenAuth}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={C.ink} />
          <Text style={S.authBtnTxt}>
            {copy.profile?.loginRegisterBtn || "Giriş Yap veya Kayıt Ol"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={S.card}>
      <View style={S.headerRow}>
        <View style={S.iconCircleUser}>
          <Ionicons name={currentAvatarIcon} size={26} color={C.primary} />
        </View>
        <View style={S.copy}>
          <View style={S.nameRow}>
            <EditableAccountName
              name={user.displayName || displayName}
              nameStyle={S.userName}
              editing={editingName}
              nameInput={nameInput}
              onNameInputChange={setNameInput}
              onStartEdit={() => setEditingName(true)}
              onSave={handleSaveName}
              badge={
                user.emailVerified ? (
                  <View style={S.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={C.success} />
                    <Text style={S.verifiedBadgeTxt}>
                      {copy.profile?.verifiedBadge || "Doğrulandı"}
                    </Text>
                  </View>
                ) : (
                  <View style={S.unverifiedBadge}>
                    <Ionicons name="alert-circle" size={12} color={C.attention} />
                    <Text style={S.unverifiedBadgeTxt}>
                      {copy.profile?.unverifiedBadge || "Doğrulanmadı"}
                    </Text>
                  </View>
                )
              }
            />
          </View>
          <Text style={S.userEmail}>{user.email}</Text>
        </View>
      </View>

      <AvatarPicker avatarId={avatarId} onAvatarChange={onAvatarChange} />

      {notice && (
        <View style={S.noticeBox}>
          <Ionicons name="information-circle" size={16} color={C.primary} />
          <Text style={S.noticeTxt}>{notice}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={S.actionRow}>
        {!user.emailVerified && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.profile?.sendVerificationBtn || "Doğrulama Gönder"}
            style={S.subBtn}
            onPress={handleSendVerification}
            disabled={busy}
          >
            <Text style={S.subBtnTxt}>
              {copy.profile?.sendVerificationBtn || "E-posta Doğrula"}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.resetPasswordBtn || "Şifremi Sıfırla"}
          style={S.subBtn}
          onPress={handleResetPassword}
          disabled={busy}
        >
          <Text style={S.subBtnTxt}>{copy.profile?.resetPasswordBtn || "Şifre Sıfırla"}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.logoutBtn || "Çıkış Yap"}
          style={S.logoutBtn}
          onPress={handleLogout}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <Text style={S.logoutBtnTxt}>{copy.profile?.logoutBtn || "Çıkış Yap"}</Text>
          )}
        </Pressable>
      </View>

      {/* Delete Account link */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.profile?.deleteAccountBtn || "Hesabı Sil"}
        style={S.deleteBtn}
        onPress={handleDeleteAccount}
        disabled={busy}
      >
        <Text style={S.deleteBtnTxt}>
          {copy.profile?.deleteAccountBtn || "Hesabımı Kalıcı Olarak Sil"}
        </Text>
      </Pressable>
    </View>
  );
}
