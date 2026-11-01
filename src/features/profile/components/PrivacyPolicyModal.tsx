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
            <Text style={S.modalTitle}>{copy.profile.privacyModalTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.home.wordDetailClose}
              style={S.modalCloseBtn}
              onPress={() => onClose()}
            >
              <Ionicons name="close" size={22} color={C.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={S.modalContent}>
            <Text style={S.legalTitle}>{copy.profile.privacyPolicySection1Title}</Text>
            <Text style={S.legalBody}>
              {copy.profile.privacyPolicySection1Body}
            </Text>
            <Text style={S.legalTitle}>{copy.profile.privacyPolicySection2Title}</Text>
            <Text style={S.legalBody}>
              {copy.profile.privacyPolicySection2Body}
            </Text>
            <Text style={S.legalTitle}>{copy.profile.privacyPolicySection3Title}</Text>
            <Text style={S.legalBody}>
              {copy.profile.privacyPolicySection3Body}
            </Text>
            <Text style={S.legalTitle}>{copy.profile.privacyPolicySection4Title}</Text>
            <Text style={S.legalBody}>
              {copy.profile.privacyPolicySection4Body}
            </Text>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.profile.privacyPolicyWebLinkLabel}
              style={S.webLinkBtn}
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            >
              <Ionicons name="open-outline" size={15} color={C.primary} />
              <Text style={S.webLinkTxt}>{copy.profile.privacyPolicyWebLinkText}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
