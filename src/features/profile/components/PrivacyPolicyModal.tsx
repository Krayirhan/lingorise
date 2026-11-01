import { Ionicons } from "@expo/vector-icons";
import { Linking, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { S } from "./DataManagementCard.styles";
const PRIVACY_POLICY_URL = "https://lingorise-65cb1.web.app/privacy-policy/";

export function PrivacyPolicyModal({ copy, visible, onClose }: { copy: Copy; visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <SafeAreaView style={S.modalSafe}>
        <View style={S.modalShell}>
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>{copy.profile?.privacyModalTitle || "Gizlilik ve Kullanım Şartları"}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home?.wordDetailClose || "Kapat"}
              style={S.modalCloseBtn}
              onPress={() => onClose()}
            >
              <Ionicons name="close" size={22} color={C.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={S.modalContent}>
            <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection1Title || "1. Gizlilik Politikası"}</Text>
            <Text style={S.legalBody}>
              {copy.profile?.privacyPolicySection1Body ||
                "Lingterra, öğrenme ilerlemenizi yalnızca kelime bilginizi geliştirmek ve aralıklı tekrar (SM-2) döngülerini yönetmek için saklar. Misafir modunda tüm verileriniz cihazınızda yerel kalır."}
            </Text>
            <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection2Title || "2. Hesap & Bulut Senkronizasyonu"}</Text>
            <Text style={S.legalBody}>
              {copy.profile?.privacyPolicySection2Body ||
                "Hesap oluşturduğunuzda ilerlemeniz Firebase Firestore üzerinde güvenli biçimde yedeklenir. İstediğiniz an hesabınızı ve tüm bulut verilerinizi kalıcı olarak silebilirsiniz."}
            </Text>
            <Text style={S.legalTitle}>{copy.profile?.privacyPolicySection3Title || "3. Reklam ve Üçüncü Taraflar"}</Text>
            <Text style={S.legalBody}>
              {copy.profile?.privacyPolicySection3Body || "Lingterra hiçbir üçüncü taraf reklam ağına kişisel verilerinizi aktarmaz."}
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
  );
}
