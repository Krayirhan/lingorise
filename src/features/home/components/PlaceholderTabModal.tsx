import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius, spacing } from "../../../theme/colors";
import { Copy } from "../../../i18n/en";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { HomeTab } from "../home.types";

interface Props {
  copy: Copy;
  tab: HomeTab | null;
  visible: boolean;
  onClose: () => void;
}

export function PlaceholderTabModal({ copy, tab, visible, onClose }: Props) {
  if (!visible || !tab) return null;

  const tabTitle =
    tab === "progress"
      ? (copy.home?.tabProgress || "İlerleme")
      : (copy.home?.tabProfile || "Profil");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.card}>
          <View style={S.iconCircle}>
            <Ionicons
              name={tab === "progress" ? "stats-chart" : "person"}
              size={28}
              color={C.primary}
            />
          </View>

          <Text style={S.tabName}>{tabTitle.toUpperCase()}</Text>
          <Text style={S.title}>{copy.home?.comingSoonTitle || "Yakında Yeşerecek!"}</Text>
          <Text style={S.subtitle}>
            {copy.home?.comingSoonSubtitle ||
              "Bu özellik seramızda filizleniyor, bir sonraki güncellemeyle bahçende açacak."}
          </Text>

          <View style={S.btnWrap}>
            <PrimaryButton
              label={copy.home?.comingSoonClose || "Bahçeye Dön"}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(28, 27, 26, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: C.surface,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabName: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: C.muted,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 280,
  },
  btnWrap: {
    width: "100%",
    marginTop: 10,
  },
});
