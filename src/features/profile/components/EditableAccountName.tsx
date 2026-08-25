import { ReactNode } from "react";
import { Pressable, StyleProp, Text, TextInput, TextStyle, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../../theme/colors";
import { S } from "./AccountManagementCard.styles";

/** The name display/inline-edit row — identical interaction in both the guest and signed-in card states (roadmap 18-srs-flow-hardening.md ARCH-003). */
export function EditableAccountName({
  name,
  nameStyle,
  editing,
  nameInput,
  onNameInputChange,
  onStartEdit,
  onSave,
  badge,
}: {
  name: string;
  nameStyle: StyleProp<TextStyle>;
  editing: boolean;
  nameInput: string;
  onNameInputChange: (text: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  badge?: ReactNode;
}) {
  if (editing) {
    return (
      <View style={S.editNameBox}>
        <TextInput value={nameInput} onChangeText={onNameInputChange} style={S.nameInput} autoFocus />
        <Pressable onPress={onSave} style={S.saveNameBtn}>
          <Ionicons name="checkmark" size={16} color={C.white} />
        </Pressable>
      </View>
    );
  }
  return (
    <>
      <Pressable onPress={onStartEdit} style={S.namePressable}>
        <Text style={nameStyle}>{name}</Text>
        <Ionicons name="pencil-outline" size={14} color={C.muted} />
      </Pressable>
      {badge}
    </>
  );
}
