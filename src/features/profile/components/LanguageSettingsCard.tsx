import { Pressable, StyleSheet, Text, View } from "react-native";
import { Copy, Locale } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { SettingsRow } from "./SettingsRow";

interface Props {
  copy: Copy;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

/** The app-language row of the preferences group, with an inline TR / EN switch. */
export function LanguageSettingsCard({ copy, locale, onLocaleChange }: Props) {
  return (
    <SettingsRow
      isFirst
      icon="globe-outline"
      tint={C.successSoft}
      title={copy.profile.languageTitle}
      right={
        <View style={S.segment}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Türkçe dilini seç"
            accessibilityState={{ selected: locale === "tr" }}
            style={[S.option, locale === "tr" && S.optionActive]}
            onPress={() => onLocaleChange("tr")}
          >
            <Text style={[S.optionText, locale === "tr" && S.optionTextActive]}>Türkçe</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="English language select"
            accessibilityState={{ selected: locale === "en" }}
            style={[S.option, locale === "en" && S.optionActive]}
            onPress={() => onLocaleChange("en")}
          >
            <Text style={[S.optionText, locale === "en" && S.optionTextActive]}>English</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const S = StyleSheet.create({
  segment: { flexDirection: "row", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 2, backgroundColor: C.canvas },
  option: { minHeight: 40, minWidth: 64, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  optionActive: { backgroundColor: C.attentionSoft },
  optionText: { color: C.ink, fontSize: 13, fontWeight: "600" },
  optionTextActive: { color: C.attentionText, fontWeight: "700" },
});
