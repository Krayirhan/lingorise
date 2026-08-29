import { useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { clearAllLocalData, exportUserDataJSON } from "../../../services/storage";
import { auth } from "../../../services/firebase";
import { Copy } from "../../../i18n/en";
import { C, radius } from "../../../theme/colors";
import { AppDialog } from "../../../components/AppDialog";

interface Props {
  copy: Copy;
  onDataReset?: () => void | Promise<void>;
}

// RELEASE-QA-003 / GLOBAL-QA-011 — durable, public, anonymously-reachable,
// app-specific policy hosted on this project's own Firebase Hosting site
// (see firebase.json's "hosting" config and public/privacy-policy/index.html),
// kept in sync with the in-app text above. Replaces the placeholder Claude
// Artifact URL that anonymous verification found did not serve app-specific
// content.
const PRIVACY_POLICY_URL = "https://lingorise-65cb1.web.app/privacy-policy/";

export function DataManagementCard({ copy, onDataReset }: Props) {
  const isCloudSynced = !!auth.currentUser;
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [backupExported, setBackupExported] = useState<string | null>(null);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [resetSuccessVisible, setResetSuccessVisible] = useState(false);
  const [resetErrorVisible, setResetErrorVisible] = useState(false);

  const handleExport = async () => {
    try {
      const json = await exportUserDataJSON();
      const backupFile = new File(Paths.cache, `lingorise-backup-${Date.now()}.json`);
      backupFile.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: "application/json",
          dialogTitle: "LingoRise yedeğini dışa aktar",
        });
        return;
      }
      setBackupExported(json);
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
    ? copy.profile?.resetDataConfirmSynced ||
      "Bu cihazdaki yerel kopyanı sıfırlayacak. Hesabına kayıtlı bulut ilerlemen etkilenmez ve bir sonraki senkronizasyonda geri yüklenir."
    : copy.profile?.resetDataConfirm ||
      "Tüm yerel ilerlemeni ve verilerini sıfırlamak istediğinden emin misin? Bu işlem geri alınamaz.";

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

  return (
    <View style={S.card}>
      <Text style={S.headerTitle}>{copy.profile?.dataHeader || "Veri ve Gizlilik"}</Text>

      {/* Cloud Sync Status Pill */}
      <View style={S.syncRow}>
        <View style={S.syncLeft}>
          <Ionicons
            name={isCloudSynced ? "cloud-done" : "phone-portrait"}
            size={18}
            color={isCloudSynced ? C.success : C.primary}
          />
          <View style={S.syncCopy}>
            <Text style={S.syncTitle}>
              {isCloudSynced
                ? copy.profile?.cloudSynced || "Firebase Buluta Senkronize"
                : copy.profile?.localMode || "Yerel Cihaz Modu"}
            </Text>
            <Text style={S.syncSub}>
              {isCloudSynced
                ? "Tüm cihazlarında otomatik eşitleniyor."
                : "Verilerin bu cihazda güvenle saklanıyor."}
            </Text>
          </View>
        </View>
      </View>

      {/* Export & Reset Actions */}
      <View style={S.actionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.exportDataBtn || "Verileri Dışa Aktar"}
          style={S.subBtn}
          onPress={handleExport}
        >
          <Ionicons name="download-outline" size={15} color={C.primary} />
          <Text style={S.subBtnTxt}>
            {copy.profile?.exportDataBtn || "Yedek İndir (JSON)"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile?.privacyPolicyBtn || "Gizlilik Politikası"}
          style={S.subBtn}
          onPress={() => setPrivacyModalVisible(true)}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color={C.primary} />
          <Text style={S.subBtnTxt}>
            {copy.profile?.privacyPolicyBtn || "Gizlilik & Şartlar"}
          </Text>
        </Pressable>
      </View>

      {/* Clear Data Link */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.profile?.clearDataBtn || "Yerel Verileri Temizle"}
        style={S.resetBtn}
        onPress={handleResetData}
      >
        <Text style={S.resetBtnTxt}>
          {copy.profile?.clearDataBtn || "Yerel Verileri Sıfırla"}
        </Text>
      </Pressable>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <SafeAreaView style={S.modalSafe}>
          <View style={S.modalShell}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>{copy.profile?.privacyModalTitle || "Gizlilik ve Kullanım Şartları"}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
                style={S.modalCloseBtn}
                onPress={() => setPrivacyModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={C.ink} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={S.modalContent}>
              <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection1Title || "1. Gizlilik Politikası"}</Text>
              <Text style={S.legalBody}>
                {copy.profile?.privacyPolicySection1Body ||
                  "LingoRise, öğrenme ilerlemenizi yalnızca kelime bilginizi geliştirmek ve aralıklı tekrar (SM-2) döngülerini yönetmek için saklar. Misafir modunda tüm verileriniz cihazınızda yerel kalır."}
              </Text>
              <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection2Title || "2. Hesap & Bulut Senkronizasyonu"}</Text>
              <Text style={S.legalBody}>
                {copy.profile?.privacyPolicySection2Body ||
                  "Hesap oluşturduğunuzda ilerlemeniz Firebase Firestore üzerinde güvenli biçimde yedeklenir. İstediğiniz an hesabınızı ve tüm bulut verilerinizi kalıcı olarak silebilirsiniz."}
              </Text>
              <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection3Title || "3. Reklam ve Üçüncü Taraflar"}</Text>
              <Text style={S.legalBody}>
                {copy.profile?.privacyPolicySection3Body || "LingoRise hiçbir üçüncü taraf reklam ağına kişisel verilerinizi aktarmaz."}
              </Text>
              <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection4Title || "4. Uygulama İçi Kullanım Kayıtları"}</Text>
              <Text style={S.legalBody}>
                {copy.profile?.privacyPolicySection4Body ||
                  'Uygulamayı nasıl kullandığınızı anlamak için (hangi ekranı ne sıklıkta açtığınız, bir pratiği tamamlayıp tamamlamadığınız gibi) bazı kullanım olayları yalnızca bu cihazda saklanır. Bu kayıtlar hiçbir sunucuya veya üçüncü tarafa gönderilmez; "Yerel Verileri Sıfırla" ile diğer verilerinizle birlikte silinir.'}
              </Text>

              <Pressable
                accessibilityRole="link"
                accessibilityLabel={copy.profile?.privacyPolicyWebLinkLabel || "Gizlilik politikasının tam metnini web'de aç"}
                style={S.webLinkBtn}
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              >
                <Ionicons name="open-outline" size={15} color={C.primary} />
                <Text style={S.webLinkTxt}>{copy.profile?.privacyPolicyWebLinkText || "Web'de tam metni görüntüle"}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Reset Data Confirmation Dialog (CD-001) */}
      <AppDialog
        visible={resetConfirmVisible}
        title={copy.profile?.resetDataDialogTitle || "Verileri Sıfırla"}
        message={resetConfirmMsg}
        primaryAction={{
          label: "İptal",
          onPress: handleCancelReset,
        }}
        secondaryAction={{
          label: "Sıfırla",
          onPress: handleConfirmReset,
          destructive: true,
        }}
        onRequestClose={handleCancelReset}
      />

      {/* Reset Success Dialog (CD-001) */}
      <AppDialog
        visible={resetSuccessVisible}
        title="Başarılı"
        message="Yerel veriler sıfırlandı."
        icon={{ name: "checkmark-circle", tone: "success" }}
        primaryAction={{
          label: "Tamam",
          onPress: () => setResetSuccessVisible(false),
        }}
        onRequestClose={() => setResetSuccessVisible(false)}
      />

      {/* Reset Failure Dialog (GLOBAL-QA-006) — a failed clear must never be reported as a success */}
      <AppDialog
        visible={resetErrorVisible}
        title="Hata"
        message="Yerel veriler sıfırlanamadı. Lütfen tekrar dene."
        icon={{ name: "alert-circle" }}
        primaryAction={{
          label: "Tamam",
          onPress: () => setResetErrorVisible(false),
        }}
        onRequestClose={() => setResetErrorVisible(false)}
      />

      {/* Backup JSON Viewer Modal */}
      {backupExported && (
        <Modal
          visible={true}
          animationType="fade"
          transparent
          onRequestClose={() => setBackupExported(null)}
        >
          <View style={S.jsonOverlay}>
            <View style={S.jsonCard}>
              <View style={S.jsonHeader}>
                <Text style={S.jsonTitle}>Yedek Verisi (JSON)</Text>
                <Pressable onPress={() => setBackupExported(null)}>
                  <Ionicons name="close" size={20} color={C.ink} />
                </Pressable>
              </View>
              <ScrollView style={S.jsonScroll}>
                <Text style={S.jsonTxt}>{backupExported}</Text>
              </ScrollView>
              <Pressable style={S.jsonOkBtn} onPress={() => setBackupExported(null)}>
                <Text style={S.jsonOkBtnTxt}>Tamam</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: radius.card || 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  headerTitle: {
    color: C.ink,
    fontSize: 15.5,
    fontWeight: "800",
  },
  syncRow: {
    backgroundColor: C.canvas,
    padding: 12,
    borderRadius: radius.md || 14,
    borderWidth: 1,
    borderColor: C.lineSoft,
  },
  syncLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  syncCopy: {
    flex: 1,
    gap: 2,
  },
  syncTitle: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "700",
  },
  syncSub: {
    color: C.muted,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  subBtn: {
    flex: 1,
    minHeight: 40,
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primaryBorder,
    borderRadius: radius.md || 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  subBtnTxt: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  resetBtn: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  resetBtnTxt: {
    color: C.attentionText,
    fontSize: 12,
    fontWeight: "600",
  },
  modalSafe: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  modalShell: {
    flex: 1,
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  legalTitle: {
    color: C.primary,
    fontSize: 14.5,
    fontWeight: "800",
    marginTop: 6,
  },
  legalBody: {
    color: C.ink,
    fontSize: 13.5,
    lineHeight: 20,
  },
  webLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: radius.md || 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  webLinkTxt: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  jsonOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  jsonCard: {
    backgroundColor: C.surface,
    borderRadius: radius.lg || 18,
    padding: 16,
    width: "100%",
    maxHeight: "80%",
    gap: 12,
  },
  jsonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jsonTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  jsonScroll: {
    backgroundColor: C.canvas,
    padding: 10,
    borderRadius: radius.md || 12,
    maxHeight: 300,
  },
  jsonTxt: {
    color: C.ink,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  jsonOkBtn: {
    backgroundColor: C.primary,
    borderRadius: radius.md || 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  jsonOkBtnTxt: {
    color: C.surface,
    fontSize: 14,
    fontWeight: "700",
  },
});
