import { useState } from "react";
import { Alert, Platform } from "react-native";
import { useApplication } from "../../../context/ApplicationContext";
import { Copy } from "../../../i18n/en";
export function useDataManagement(copy: Copy, onDataReset?: () => void | Promise<void>) {
  const application = useApplication();
  const { clearAllLocalData } = application.data;

  const isCloudSynced = !!application.account.current();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [backupExported, setBackupExported] = useState<string | null>(null);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [resetSuccessVisible, setResetSuccessVisible] = useState(false);
  const [resetErrorVisible, setResetErrorVisible] = useState(false);

  const handleExport = async () => {
    try {
      const fallback = await application.data.exportBackup();
      if (fallback !== null) setBackupExported(fallback);
    } catch {
      Alert.alert("Hata", "Veri dışa aktarılamadı.");
    }
  };

  // A signed-in account's cloud progress is never touched by this action —
  // only this device's local cache is cleared, and the next sync will
  // re-download it. Claiming "irreversible" for a cloud-synced account was
  // misleading (DATA-QA-003 / GLOBAL-QA-005): the copy must match what
  // actually happens for each case.
  const resetConfirmMsg = isCloudSynced
    ? copy.profile.resetDataConfirmSynced
    : copy.profile.resetDataConfirm;

  const handleResetData = () => {
    if (Platform.OS === "web") {
      if (window.confirm(resetConfirmMsg)) {
        void executeReset();
      }
    } else {
      setResetConfirmVisible(true);
    }
  };

  const handleConfirmReset = () => {
    setResetConfirmVisible(false);
    void executeReset();
  };

  const handleCancelReset = () => setResetConfirmVisible(false);

  const executeReset = async () => {
    const { success } = await clearAllLocalData();
    if (!success) {
      if (Platform.OS === "web") {
        Alert.alert("Hata", "Yerel veriler sıfırlanamadı. Lütfen tekrar dene.");
      } else {
        setResetErrorVisible(true);
      }
      return;
    }
    // Reloads local-only state; never syncs the wipe to the cloud (unlike
    // the old `userProgress.refresh()` wiring, which did — see
    // useUserProgress.ts's `reloadLocalOnly` comment).
    if (onDataReset) await onDataReset();
    if (Platform.OS === "web") {
      Alert.alert("Başarılı", "Yerel veriler sıfırlandı.");
    } else {
      setResetSuccessVisible(true);
    }
  };


  return { isCloudSynced, privacyModalVisible, setPrivacyModalVisible, backupExported, setBackupExported, resetConfirmVisible, resetSuccessVisible, setResetSuccessVisible, resetErrorVisible, setResetErrorVisible, resetConfirmMsg, handleExport, handleResetData, handleConfirmReset, handleCancelReset };
}
