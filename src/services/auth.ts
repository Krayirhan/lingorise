import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUserData } from "./firestore";

const GUEST_MODE_KEY = "@lingorise_guest_mode";

export async function isGuestMode(): Promise<boolean> {
  return (await AsyncStorage.getItem(GUEST_MODE_KEY)) === "true";
}

export async function enableGuestMode(): Promise<void> {
  await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
}

export async function disableGuestMode(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_MODE_KEY);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function register(email: string, password: string, displayName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  await disableGuestMode();
  return result.user;
}

export async function login(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  await disableGuestMode();
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

/**
 * Thrown when the user's Firestore data was fully deleted but the Firebase
 * Auth account itself could not be removed (e.g. `auth/requires-recent-login`).
 * The client architecture cannot make Firestore + Auth deletion atomic, so
 * this makes the resulting partial state explicit rather than reporting a
 * failed deletion as if nothing happened (DATA-QA-004 / SEC-QA-003 /
 * GLOBAL-QA-007). Retrying `deleteAccount()` after resolving the underlying
 * cause converges safely — `deleteUserData` is a no-op on already-empty
 * collections/documents.
 */
export class PartialAccountDeletionError extends Error {
  constructor(public readonly cause: unknown) {
    super("Account data was deleted, but removing the authentication credential failed.");
    this.name = "PartialAccountDeletionError";
  }
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  await deleteUserData(uid);
  try {
    await deleteUser(user);
  } catch (err) {
    throw new PartialAccountDeletionError(err);
  }
  await enableGuestMode();
}

export { getAuthErrorMessage } from "./authErrors";

