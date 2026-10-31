import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

const GUEST_MODE_KEY = "@lingterra_guest_mode";
/** Pre-rebrand key (app was named LingoRise); kept only so existing installs migrate forward. */
const LEGACY_GUEST_MODE_KEY = "@lingorise_guest_mode";

export async function isGuestMode(): Promise<boolean> {
  const value = await AsyncStorage.getItem(GUEST_MODE_KEY);
  if (value !== null) return value === "true";

  const legacyValue = await AsyncStorage.getItem(LEGACY_GUEST_MODE_KEY);
  if (legacyValue !== null) {
    await AsyncStorage.setItem(GUEST_MODE_KEY, legacyValue);
    await AsyncStorage.removeItem(LEGACY_GUEST_MODE_KEY).catch(() => { });
    return legacyValue === "true";
  }
  return false;
}

export async function enableGuestMode(): Promise<void> {
  await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
  await AsyncStorage.removeItem(LEGACY_GUEST_MODE_KEY).catch(() => { });
}

export async function disableGuestMode(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_MODE_KEY);
  await AsyncStorage.removeItem(LEGACY_GUEST_MODE_KEY).catch(() => { });
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function register(email: string, password: string, displayName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return result.user;
}

export async function login(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function sendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

