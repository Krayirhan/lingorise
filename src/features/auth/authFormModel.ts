import { Copy } from "../../i18n/en";

export type AuthMode = "login" | "register" | "forgot";
export type AuthErrorField = "name" | "email" | "password" | "general";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/** The first problem with the form for the given mode, or null when it can be submitted. */
export function validateAuthForm(
  copy: Copy["auth"],
  mode: AuthMode,
  form: { name: string; email: string; password: string },
): { message: string; field: AuthErrorField } | null {
  if (mode === "register" && !form.name.trim()) return { message: copy.errorNameRequired, field: "name" };
  if (!form.email.trim() || !EMAIL_PATTERN.test(form.email.trim())) return { message: copy.errorEmailRequired, field: "email" };
  if (mode !== "forgot" && form.password.length < MIN_PASSWORD_LENGTH) return { message: copy.errorPasswordShort, field: "password" };
  return null;
}

/** Which form field an auth error code points at. */
export function errorFieldForCode(code: string | undefined): AuthErrorField {
  if (code?.includes("email")) return "email";
  if (code?.includes("password")) return "password";
  return "general";
}
