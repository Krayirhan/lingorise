import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useDataManagement } from "../hooks/useDataManagement";
import { S } from "./DataManagementCard.styles";
import { PrivacyPolicyModal } from "./PrivacyPolicyModal";
import { SettingsGroup, SettingsRow } from "./SettingsRow";

import { AppDialog } from "../../../components/AppDialog";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";

interface Props {
  copy: Copy;
  onDataReset?: () => void | Promise<void>;
}

function DataManagementDialogs({ copy, state }: { copy: Copy; state: ReturnType<typeof useDataManagement> }) {
  const { backupExported, setBackupExported, resetConfirmVisible, resetSuccessVisible,
    setResetSuccessVisible, resetErrorVisible, setResetErrorVisible, resetConfirmMsg,
    handleConfirmReset, handleCancelReset } = state;
  return (
    <>
      <AppDialog visible={resetConfirmVisible} title={copy.profile.resetDataDialogTitle}
        message={resetConfirmMsg} primaryAction={{ label: "İptal", onPress: handleCancelReset }}
        secondaryAction={{ label: "Sıfırla", onPress: handleConfirmReset, destructive: true }}
        onRequestClose={handleCancelReset} />
      <AppDialog visible={resetSuccessVisible} title="Başarılı" message="Yerel veriler sıfırlandı."
        icon={{ name: "checkmark-circle", tone: "success" }}
        primaryAction={{ label: "Tamam", onPress: () => setResetSuccessVisible(false) }}
        onRequestClose={() => setResetSuccessVisible(false)} />
      <AppDialog visible={resetErrorVisible} title="Hata" message="Yerel veriler sıfırlanamadı. Lütfen tekrar dene."
        icon={{ name: "alert-circle" }}
        primaryAction={{ label: "Tamam", onPress: () => setResetErrorVisible(false) }}
        onRequestClose={() => setResetErrorVisible(false)} />
      {backupExported && <Modal visible animationType="fade" transparent onRequestClose={() => setBackupExported(null)}>
        <View style={S.jsonOverlay}><View style={S.jsonCard}>
          <View style={S.jsonHeader}><Text style={S.jsonTitle}>Yedek Verisi (JSON)</Text>
            <Pressable onPress={() => setBackupExported(null)}><Ionicons name="close" size={20} color={C.ink} /></Pressable>
          </View>
          <ScrollView style={S.jsonScroll}><Text style={S.jsonTxt}>{backupExported}</Text></ScrollView>
          <Pressable style={S.jsonOkBtn} onPress={() => setBackupExported(null)}><Text style={S.jsonOkBtnTxt}>Tamam</Text></Pressable>
        </View></View>
      </Modal>}
    </>
  );
}

export function DataManagementCard({ copy, onDataReset }: Props) {
  const dataManagement = useDataManagement(copy, onDataReset);
  const { isCloudSynced, privacyModalVisible, setPrivacyModalVisible, handleExport, handleResetData } = dataManagement;

  return (
    <>
      <SettingsGroup title={copy.profile.dataHeader}>
        <View style={S.statusLine}>
          <Ionicons name={isCloudSynced ? "cloud-done-outline" : "phone-portrait-outline"} size={15} color={C.muted} />
          <Text style={S.statusText}>
            {isCloudSynced
              ? copy.profile.cloudSynced
              : copy.profile.localMode}
          </Text>
        </View>
        <SettingsRow
          isFirst
          icon="download-outline"
          tint={C.successSoft}
          title={copy.profile.exportDataBtn}
          onPress={handleExport}
        />
        <SettingsRow
          icon="document-text-outline"
          tint={C.attentionSoft}
          title={copy.profile.privacyPolicyBtn}
          onPress={() => setPrivacyModalVisible(true)}
        />
        <SettingsRow
          destructive
          icon="trash-outline"
          tint={C.attentionSoft}
          title={copy.profile.clearDataBtn}
          onPress={handleResetData}
        />
      </SettingsGroup>

      <PrivacyPolicyModal copy={copy} visible={privacyModalVisible} onClose={() => setPrivacyModalVisible(false)} />

      <DataManagementDialogs copy={copy} state={dataManagement} />
    </>
  );
}
