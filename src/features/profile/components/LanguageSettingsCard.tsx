import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, radius } from "../../../theme/colors";
import { Copy, Locale } from "../../../i18n/en";

interface Props {
  copy: Copy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function LanguageSettingsCard({ copy, locale, onLocaleChange }: Props) {
  return (
    <View style={S.card}>
      <Text style={S.title}>{copy.profile?.languageTitle || "Uygulama Dili"}</Text>
      <Text style={S.sub}>{copy.profile?.languageSubtitle || "Tercih ettiğin arayüz dilini seç"}</Text>

      <View style={S.btnRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Türkçe dilini seç"
          accessibilityState={{ selected: locale === "tr" }}
          style={[S.langBtn, locale === "tr" && S.langBtnActive]}
          onPress={() => onLocaleChange("tr")}
        >
          <Text style={[S.langTxt, locale === "tr" && S.langTxtActive]}>Türkçe</Text>
          {locale === "tr" && <Ionicons name="checkmark" size={15} color={C.primary} />}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="English language select"
          accessibilityState={{ selected: locale === "en" }}
          style={[S.langBtn, locale === "en" && S.langBtnActive]}
          onPress={() => onLocaleChange("en")}
        >
          <Text style={[S.langTxt, locale === "en" && S.langTxtActive]}>English</Text>
          {locale === "en" && <Ionicons name="checkmark" size={15} color={C.primary} />}
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: C.line, gap: 8 },
  title: { color: C.ink, fontSize: 15, fontWeight: "800" },
  sub: { color: C.muted, fontSize: 12, lineHeight: 16 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  langBtn: { flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.canvas, paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 1.5, borderColor: C.line },
  langBtnActive: { backgroundColor: C.primarySoft, borderColor: C.primary },
  langTxt: { color: C.ink, fontSize: 13, fontWeight: "700" },
  langTxtActive: { color: C.primary, fontWeight: "800" },
});
