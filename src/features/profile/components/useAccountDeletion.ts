import { Alert, Platform } from "react-native";
import { errorDetail } from "../../../domain/account/errorDetails";
import { PartialAccountDeletionError } from "../../../application/account";
import { Copy } from "../../../i18n/en";

export function useAccountDeletion({ copy, deleteAccount, onLoggedOut, setBusy }: {
  copy: Copy; deleteAccount: () => Promise<void>; onLoggedOut?: () => void; setBusy: (busy: boolean) => void;
}) {
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
    } catch (e) {
      // A PartialAccountDeletionError means the user's data is already gone
      // — only the Auth credential remains — so the message must not imply
      // deletion never started (DATA-QA-004 / SEC-QA-003 / GLOBAL-QA-007).
      const isPartial = e instanceof PartialAccountDeletionError;
      const underlying = isPartial ? e.cause : e;
      if (errorDetail(underlying, "code") === "auth/requires-recent-login") {
        Alert.alert(
          "Yeniden Giriş Gerekli",
          isPartial
            ? "Verilerin zaten silindi; hesabını tamamen kapatmak için lütfen yeniden giriş yapıp tekrar dene."
            : "Güvenliğin için hesabını silmeden önce lütfen oturumu kapatıp yeniden giriş yap."
        );
      } else {
        Alert.alert(
          "Hata",
          isPartial
            ? "Verilerin silindi, ancak hesap kaydın tam olarak kaldırılamadı. Lütfen tekrar giriş yapıp tekrar dene."
            : "Hesap silinirken bir hata oluştu. Lütfen tekrar giriş yapıp deneyin."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return handleDeleteAccount;
}
