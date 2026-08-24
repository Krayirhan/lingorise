import { useState } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Copy } from "../../../i18n/en";
import { C, radius } from "../../../theme/colors";

const mascot = require("../../../../assets/sprig-mascot.png");

interface Props {
  copy: Copy;
  notificationsEnabled?: boolean;
  onStartGuest: (notificationsEnabled: boolean) => void;
  onCreateAccount: (notificationsEnabled: boolean) => void;
}

export function ReadyStep({ copy, notificationsEnabled = true, onStartGuest, onCreateAccount }: Props) {
  const [reminders, setReminders] = useState(notificationsEnabled);

  return (
    <View style={S.container}>
      <View style={S.gardenArt}>
        <Image source={mascot} style={S.mascot} resizeMode="contain" />
      </View>

      <Text style={S.eyebrow}>
        {copy.onboarding?.readyKicker || "BAHÇEN HAZIR"}
      </Text>
      <Text style={S.hero}>
        {copy.onboarding?.readyTitle || "Hesap açmadan hemen başlayabilirsin."}
      </Text>
      <Text style={S.subtitle}>
        {copy.onboarding?.readyBody ||
          "İlerlemen cihazında güvenle tutulur. İstediğin zaman profilinden hesap oluşturup buluta yedekleyebilirsin."}
      </Text>

      {/* Reminder Toggle Card */}
      <View style={S.reminderCard}>
        <View style={S.iconBox}>
          <Ionicons name="notifications-outline" size={22} color={C.primary} />
        </View>
        <View style={S.reminderCopy}>
          <Text style={S.reminderTitle}>
            {copy.onboarding?.remindersTitle || "Bahçeni yeşil tutmak ister misin?"}
          </Text>
          <Text style={S.reminderBody}>
            {copy.onboarding?.remindersBody ||
              "Günde 1 nazik hatırlatıcı alarak serini koru."}
          </Text>
        </View>
        <Switch
          value={reminders}
          onValueChange={setReminders}
          trackColor={{ false: C.line, true: C.primary }}
          thumbColor={C.white}
        />
      </View>

      <View style={S.bottom}>
        <PrimaryButton
          label={copy.onboarding?.startAsGuest || "Bahçeme Başla (Misafir Olarak) →"}
          onPress={() => onStartGuest(reminders)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.onboarding?.createAccountNow || "Hesap Oluştur ve Başla"}
          style={S.accountBtn}
          onPress={() => onCreateAccount(reminders)}
        >
          <Text style={S.accountBtnTxt}>
            {copy.onboarding?.createAccountNow || "Hesap Oluştur ve Başla"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1 },
  gardenArt: {
    alignSelf: "center",
    width: 170,
    height: 170,
    borderRadius: 56,
    backgroundColor: "#F8F1E4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  mascot: { width: 164, height: 164 },
  eyebrow: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 16,
  },
  hero: {
    color: C.ink,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: radius.lg || 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 13,
    gap: 12,
    marginTop: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderCopy: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "700",
  },
  reminderBody: {
    color: C.muted,
    fontSize: 11.5,
    lineHeight: 15,
  },
  bottom: {
    gap: 8,
    marginTop: "auto",
    paddingTop: 16,
  },
  accountBtn: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  accountBtnTxt: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
