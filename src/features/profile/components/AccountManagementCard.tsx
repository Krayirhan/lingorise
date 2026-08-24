import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { updateProfile } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../services/firebase";
import { deleteAccount, logout, resetPassword, sendVerificationEmail } from "../../../services/auth";
import { Copy } from "../../../i18n/en";
import { C, radius } from "../../../theme/colors";

interface Props {
  copy: Copy;
  displayName?: string;
  avatarId?: string;
  onDisplayNameChange?: (name: string) => void;
  onAvatarChange?: (avatarId: string) => void;
  onOpenAuth: () => void;
  onLoggedOut?: () => void;
}

const AVATARS = [
  { id: "sprig", icon: "leaf-outline" as const, label: "Filiz" },
  { id: "sprout", icon: "sunny-outline" as const, label: "Işık" },
  { id: "flower", icon: "flower-outline" as const, label: "Çiçek" },
  { id: "tree", icon: "earth-outline" as const, label: "Doğa" },
  { id: "heart", icon: "heart-outline" as const, label: "Sevgi" },
];

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
              {editingName ? (
                <View style={S.editNameBox}>
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    style={S.nameInput}
                    autoFocus
                  />
                  <Pressable onPress={handleSaveName} style={S.saveNameBtn}>
                    <Ionicons name="checkmark" size={16} color={C.white} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setEditingName(true)}
                  style={S.namePressable}
                >
                  <Text style={S.title}>{displayName}</Text>
                  <Ionicons name="pencil-outline" size={14} color={C.muted} />
                </Pressable>
              )}
            </View>
            <Text style={S.subtitle}>
              {copy.profile?.accountGuestSubtitle ||
                "İlerlemen bu cihazda güvenle saklanıyor. Tüm cihazlarında eşitlemek için hesap bağla."}
            </Text>
          </View>
        </View>

        {/* Avatar Picker Row */}
        <View style={S.avatarRow}>
          <Text style={S.avatarLabel}>Avatar Seç:</Text>
          <View style={S.avatarList}>
            {AVATARS.map((av) => (
              <Pressable
                key={av.id}
                onPress={() => onAvatarChange && onAvatarChange(av.id)}
                style={[
                  S.avatarBtn,
                  avatarId === av.id && S.avatarBtnActive,
                ]}
              >
                <Ionicons
                  name={av.icon}
                  size={18}
                  color={avatarId === av.id ? C.white : C.primary}
                />
              </Pressable>
            ))}
          </View>
        </View>

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
            {editingName ? (
              <View style={S.editNameBox}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={S.nameInput}
                  autoFocus
                />
                <Pressable onPress={handleSaveName} style={S.saveNameBtn}>
                  <Ionicons name="checkmark" size={16} color={C.white} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setEditingName(true)}
                style={S.namePressable}
              >
                <Text style={S.userName}>{user.displayName || displayName}</Text>
                <Ionicons name="pencil-outline" size={14} color={C.muted} />
              </Pressable>
            )}
            {user.emailVerified ? (
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
            )}
          </View>
          <Text style={S.userEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Avatar Picker Row */}
      <View style={S.avatarRow}>
        <Text style={S.avatarLabel}>Avatar Seç:</Text>
        <View style={S.avatarList}>
          {AVATARS.map((av) => (
            <Pressable
              key={av.id}
              onPress={() => onAvatarChange && onAvatarChange(av.id)}
              style={[
                S.avatarBtn,
                avatarId === av.id && S.avatarBtnActive,
              ]}
            >
              <Ionicons
                name={av.icon}
                size={18}
                color={avatarId === av.id ? C.white : C.primary}
              />
            </Pressable>
          ))}
        </View>
      </View>

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
          accessibilityLabel="Şifremi Sıfırla"
          style={S.subBtn}
          onPress={handleResetPassword}
          disabled={busy}
        >
          <Text style={S.subBtnTxt}>Şifre Sıfırla</Text>
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

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: radius.lg || 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircleGuest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleUser: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "700",
  },
  subtitle: {
    color: C.muted,
    fontSize: 12.5,
    lineHeight: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "700",
  },
  userEmail: {
    color: C.muted,
    fontSize: 13,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs || 8,
  },
  verifiedBadgeTxt: {
    color: C.successText,
    fontSize: 10,
    fontWeight: "700",
  },
  unverifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.attentionSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs || 8,
  },
  unverifiedBadgeTxt: {
    color: C.attentionText,
    fontSize: 10,
    fontWeight: "700",
  },
  authBtn: {
    minHeight: 46,
    backgroundColor: C.reward,
    borderRadius: radius.button || 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  authBtnTxt: {
    color: C.ink,
    fontSize: 14.5,
    fontWeight: "700",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primarySoft,
    padding: 10,
    borderRadius: radius.md || 12,
  },
  noticeTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  subBtn: {
    minHeight: 38,
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primaryBorder,
    borderRadius: radius.md || 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subBtnTxt: {
    color: C.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },
  logoutBtn: {
    minHeight: 38,
    backgroundColor: C.lineSoft,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md || 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnTxt: {
    color: C.ink,
    fontSize: 12.5,
    fontWeight: "600",
  },
  deleteBtn: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  deleteBtnTxt: {
    color: C.attentionText,
    fontSize: 12,
    fontWeight: "600",
  },
  namePressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editNameBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  nameInput: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: radius.sm || 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: C.ink,
    backgroundColor: C.canvas,
  },
  saveNameBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.canvas,
    padding: 8,
    borderRadius: radius.md || 12,
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
  },
  avatarList: {
    flexDirection: "row",
    gap: 6,
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
});
