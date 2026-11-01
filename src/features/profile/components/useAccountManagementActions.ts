import { Alert } from "react-native";
import { errorDetail } from "../../../domain/account/errorDetails";
import { useState } from "react";
import { useApplication } from "../../../context/ApplicationContext";
import { Copy } from "../../../i18n/en";
import { AVATARS } from "./AvatarPicker";
import { useAccountDeletion } from "./useAccountDeletion";

export interface AccountManagementActionsProps {
  copy: Copy; displayName: string; avatarId: string; onDisplayNameChange?: (name: string) => void;
  onLoggedOut?: () => void;
}
export function useAccountManagementActions({ copy, displayName, avatarId, onDisplayNameChange, onLoggedOut }: AccountManagementActionsProps) {
  const application = useApplication();
  const deleteAccount = application.deleteAccountProfile;
  const { resetPassword } = application.account;
  const { sendVerificationEmail } = application.account;

  const user = application.account.current();
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
        await application.account.updateDisplayName(user.uid, trimmed);
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
      await application.signOutProfile();
      if (onLoggedOut) onLoggedOut();
    } catch (e) {
      console.warn("Logout error", e);
      Alert.alert("Çıkış yapılamadı", "İlerlemen henüz güvenle kaydedilemedi. Bağlantını ve cihazındaki alanı kontrol edip tekrar dene.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setBusy(true);
      await sendVerificationEmail();
      setNotice(
        copy.profile.verificationSent
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      Alert.alert("Hata", errorDetail(e, "message") || "Doğrulama e-postası gönderilemedi.");
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
        copy.auth.resetEmailSentSuccess
      );
      setTimeout(() => setNotice(null), 4000);
    } catch (e) {
      Alert.alert("Hata", errorDetail(e, "message") || "Şifre sıfırlama e-postası gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = useAccountDeletion({ copy, deleteAccount, onLoggedOut, setBusy });
  const currentAvatarIcon = AVATARS.find((a) => a.id === avatarId)?.icon || "leaf-outline";

  return { user, isGuest, busy, notice, editingName, nameInput, setNameInput, setEditingName,
    handleSaveName, handleLogout, handleSendVerification, handleResetPassword, handleDeleteAccount, currentAvatarIcon };
}


