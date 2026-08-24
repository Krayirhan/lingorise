import { useState } from "react";
import { Alert, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { clearAllLocalData, exportUserDataJSON } from "../../../services/storage";
import { auth } from "../../../services/firebase";
import { Copy } from "../../../i18n/en";
import { C, radius } from "../../../theme/colors";

interface Props {
  copy: Copy;
  onDataReset?: () => void;
}

export function DataManagementCard({ copy, onDataReset }: Props) {
  const isCloudSynced = !!auth.currentUser;
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [backupExported, setBackupExported] = useState<string | null>(null);

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

  const handleResetData = () => {
    const confirmMsg =
      copy.profile?.resetDataConfirm ||
      "Tüm yerel ilerlemeni ve verilerini sıfırlamak istediğinden emin misin? Bu işlem geri alınamaz.";

    if (Platform.OS === "web") {
      if (window.confirm(confirmMsg)) {
        void executeReset();
      }
    } else {
      Alert.alert("Verileri Sıfırla", confirmMsg, [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: () => void executeReset(),
        },
      ]);
    }
  };

  const executeReset = async () => {
    await clearAllLocalData();
    if (onDataReset) onDataReset();
    Alert.alert("Başarılı", "Yerel veriler sıfırlandı.");
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
              <Text style={S.modalTitle}>Gizlilik ve Kullanım Şartları</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kapat"
                style={S.modalCloseBtn}
                onPress={() => setPrivacyModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={C.ink} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={S.modalContent}>
              <Text style={S.legalTitle}>1. Gizlilik Politikası</Text>
              <Text style={S.legalBody}>
                LingoRise, öğrenme ilerlemenizi yalnızca kelime bilginizi geliştirmek
                ve aralıklı tekrar (SM-2) döngülerini yönetmek için saklar. Misafir
                modunda tüm verileriniz cihazınızda yerel kalır.
              </Text>
              <Text style={S.legalTitle}>2. Hesap & Bulut Senkronizasyonu</Text>
              <Text style={S.legalBody}>
                Hesap oluşturduğunuzda ilerlemeniz Firebase Firestore üzerinde
                güvenli biçimde yedeklenir. İstediğiniz an hesabınızı ve tüm bulut
                verilerinizi kalıcı olarak silebilirsiniz.
              </Text>
              <Text style={S.legalTitle}>3. Reklam ve Üçüncü Taraflar</Text>
              <Text style={S.legalBody}>
                LingoRise hiçbir üçüncü taraf reklam ağına kişisel verilerinizi
                aktarmaz.
              </Text>
              <Text style={S.legalTitle}>4. Uygulama İçi Kullanım Kayıtları</Text>
              <Text style={S.legalBody}>
                Uygulamayı nasıl kullandığınızı anlamak için (hangi ekranı ne sıklıkta
                açtığınız, bir pratiği tamamlayıp tamamlamadığınız gibi) bazı kullanım
                olayları yalnızca bu cihazda saklanır. Bu kayıtlar hiçbir sunucuya veya
                üçüncü tarafa gönderilmez; "Yerel Verileri Sıfırla" ile diğer verilerinizle
                birlikte silinir.
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

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
