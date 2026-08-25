import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../../theme/colors";
import { S } from "./AccountManagementCard.styles";

export const AVATARS = [
  { id: "sprig", icon: "leaf-outline" as const, label: "Filiz" },
  { id: "sprout", icon: "sunny-outline" as const, label: "Işık" },
  { id: "flower", icon: "flower-outline" as const, label: "Çiçek" },
  { id: "tree", icon: "earth-outline" as const, label: "Doğa" },
  { id: "heart", icon: "heart-outline" as const, label: "Sevgi" },
];

/** Identical in both the guest and signed-in card states — extracted so it exists once (roadmap 18-srs-flow-hardening.md ARCH-003). */
export function AvatarPicker({
  avatarId,
  onAvatarChange,
}: {
  avatarId: string;
  onAvatarChange?: (avatarId: string) => void;
}) {
  return (
    <View style={S.avatarRow}>
      <Text style={S.avatarLabel}>Avatar Seç:</Text>
      <View style={S.avatarList}>
        {AVATARS.map((av) => (
          <Pressable
            key={av.id}
            onPress={() => onAvatarChange && onAvatarChange(av.id)}
            style={[S.avatarBtn, avatarId === av.id && S.avatarBtnActive]}
          >
            <Ionicons name={av.icon} size={18} color={avatarId === av.id ? C.white : C.primary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
