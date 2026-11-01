import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LevelCode } from "../../../domain/models/content";
import { Copy } from "../../../i18n/en";
import { C } from "../../../theme/colors";
import { S } from "./AccountManagementCard.styles";
import { AvatarPicker } from "./AvatarPicker";
import { useAccountManagementActions } from "./useAccountManagementActions";
import { EditableAccountName } from "./EditableAccountName";

interface Props {
  copy: Copy;
  displayName?: string;
  avatarId?: string;
  onDisplayNameChange?: (name: string) => void;
  onAvatarChange?: (avatarId: string) => void;
  onOpenAuth: () => void;
  onLoggedOut?: () => void;
  level: LevelCode;
  xp: number;
  streak: number;
  onChangeLevel: () => void;
}


export function AccountManagementCard({
  copy,
  displayName = "Lingterra Bahçıvanı",
  avatarId = "sprig",
  onDisplayNameChange,
  onAvatarChange,
  onOpenAuth,
  onLoggedOut,
  level,
  xp,
  streak,
  onChangeLevel,
}: Props) {
  const { user, busy, notice, editingName, nameInput, setNameInput, setEditingName,
    handleSaveName, handleLogout, handleSendVerification, handleResetPassword, handleDeleteAccount, currentAvatarIcon } =
    useAccountManagementActions({ copy, displayName, avatarId, onDisplayNameChange, onLoggedOut });

  const streakSuffix = copy.home.streakSuffix;
  const identity = (name: string, extra?: React.ReactNode, badge?: React.ReactNode) => (
    <View style={S.card}>
      <View style={S.headerRow}>
        <View style={S.avatarLarge}>
          <Ionicons name={currentAvatarIcon} size={38} color={C.primary} />
        </View>
        <View style={S.copy}>
          <View style={S.nameRow}>
            <EditableAccountName
              copy={copy}
              name={name.trim() || copy.profile.guestName}
              nameStyle={S.identityName}
              editing={editingName}
              nameInput={nameInput}
              onNameInputChange={setNameInput}
              onStartEdit={() => setEditingName(true)}
              onSave={handleSaveName}
              badge={badge}
            />
          </View>
          {extra}
          <Text style={S.identityMeta}>{level} · {xp} XP · {streak} {streakSuffix} seri</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.profile.changeLevelBtn}
            style={({ pressed }) => [S.changeLevelBtn, pressed && S.pressed]}
            onPress={onChangeLevel}
          >
            <Text style={S.changeLevelTxt}>{copy.profile.changeLevelBtn}</Text>
          </Pressable>
        </View>
      </View>
      <AvatarPicker copy={copy} avatarId={avatarId} onAvatarChange={onAvatarChange} />
    </View>
  );

  if (!user) {
    return (
      <>
        {identity(displayName)}

        <View style={S.guestCard}>
          <Ionicons name="phone-portrait-outline" size={22} color={C.primary} />
          <View style={S.guestCopy}>
            <Text style={S.guestTitle}>{copy.profile.accountGuestBannerTitle}</Text>
            <Text style={S.guestBody}>{copy.profile?.accountGuestBody}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.profile.loginRegisterBtn}
              style={({ pressed }) => [S.authBtn, pressed && S.pressed]}
              onPress={onOpenAuth}
            >
              <Text style={S.authBtnTxt}>
                {copy.profile.loginRegisterBtn}
              </Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {identity(
        user.displayName || displayName,
        <Text style={S.userEmail}>{user.email}</Text>,
        user.emailVerified ? (
          <View style={S.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={C.success} />
            <Text style={S.verifiedBadgeTxt}>
              {copy.profile.verifiedBadge}
            </Text>
          </View>
        ) : (
          <View style={S.unverifiedBadge}>
            <Ionicons name="alert-circle" size={12} color={C.attention} />
            <Text style={S.unverifiedBadgeTxt}>
              {copy.profile.unverifiedBadge}
            </Text>
          </View>
        ),
      )}

    <View style={S.card}>
      {notice && (
        <View style={S.noticeBox}>
          <Ionicons name="information-circle" size={16} color={C.primary} />
          <Text style={S.noticeTxt}>{notice}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={S.actionRow}>
        {!user.emailVerified && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.profile.sendVerificationBtn}
            style={S.subBtn}
            onPress={handleSendVerification}
            disabled={busy}
          >
            <Text style={S.subBtnTxt}>
              {copy.profile.sendVerificationBtn}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile.resetPasswordBtn}
          style={S.subBtn}
          onPress={handleResetPassword}
          disabled={busy}
        >
          <Text style={S.subBtnTxt}>{copy.profile.resetPasswordBtn}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.profile.logoutBtn}
          style={S.logoutBtn}
          onPress={handleLogout}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <Text style={S.logoutBtnTxt}>{copy.profile.logoutBtn}</Text>
          )}
        </Pressable>
      </View>

      {/* Delete Account link */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.profile.deleteAccountBtn}
        style={S.deleteBtn}
        onPress={handleDeleteAccount}
        disabled={busy}
      >
        <Text style={S.deleteBtnTxt}>
          {copy.profile.deleteAccountBtn}
        </Text>
      </Pressable>
    </View>
    </>
  );
}
