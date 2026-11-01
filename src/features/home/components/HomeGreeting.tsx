import { Text, View } from "react-native";
import { Copy } from "../../../i18n/en";
import { HomeViewModel } from "../home.types";
import { homeStyles as S } from "../home.styles";
import { HomeMascot } from "./HomeMascot";

export function HomeGreeting({ copy, viewModel }: {
  copy: Copy; viewModel: HomeViewModel; isNewLearner?: boolean;
}) {
  const unitLabel = (copy.home?.unitLabel || "Bölüm {current}/{total}")
    .replace("{current}", String(viewModel.unitNumber))
    .replace("/{total}", "")
    .toUpperCase();
  const unitEyebrow = `${unitLabel} · ${viewModel.greetingEyebrow}`;

  return (
    <View style={S.intro}>
      <View style={S.introRow}>
        <View style={S.introCopy}>
          <Text style={S.greeting}>{unitEyebrow}</Text>
          <Text style={S.title}>{viewModel.greetingTitle}</Text>
        </View>
        <HomeMascot />
      </View>
      <Text style={S.subtitle}>{viewModel.greetingSubtitle}</Text>
    </View>
  );
}
