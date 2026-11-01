import { Linking } from "react-native";
import { AppDialog } from "./AppDialog";

export function UpdateDialog({ visible, locale, reduceMotion, onClose }: { visible: boolean; locale: string; reduceMotion?: boolean; onClose: () => void }) {
  const tr = locale === "tr";
  return <AppDialog
    visible={visible}
    title={tr ? "Yeni güncelleme var" : "An update is available"}
    message={tr ? "Lingterra’nın yeni sürümü hazır. Yenilikleri görmek için uygulamayı güncelleyebilirsin." : "A new version of Lingterra is available. Update to enjoy the latest improvements."}
    primaryAction={{ label: tr ? "Google Play’e git" : "Open Google Play", onPress: () => { onClose(); void Linking.openURL("https://play.google.com/store/apps/details?id=com.lingterra.app").catch(() => {}); } }}
    secondaryAction={{ label: tr ? "Daha sonra" : "Not now", onPress: onClose }}
    onRequestClose={onClose}
    reduceMotion={reduceMotion}
  />;
}
