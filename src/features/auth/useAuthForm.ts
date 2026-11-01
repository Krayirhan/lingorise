import { useState } from "react";
import { useApplication } from "../../context/ApplicationContext";
import { errorDetail } from "../../domain/account/errorDetails";
import { getAuthErrorMessage } from "../../domain/account/authErrors";
import { Copy, Locale } from "../../i18n/en";
import { AuthErrorField, AuthMode, errorFieldForCode, validateAuthForm } from "./authFormModel";

/** Form state and submission for sign-up, sign-in and password reset. */
export function useAuthForm(copy: Copy, locale: Locale, initialMode: AuthMode, onSuccess?: () => void) {
  const { login, register, resetPassword, enableGuestMode } = useApplication().account;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<AuthErrorField | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit() {
    const problem = validateAuthForm(copy.auth, mode, { name, email, password });
    setError(problem?.message ?? "");
    setErrorField(problem?.field ?? null);
    if (problem) return;

    try {
      setBusy(true);
      if (mode === "forgot") {
        await resetPassword(email);
        setResetSent(true);
        return;
      }
      if (mode === "register") await register(email, password, name);
      else await login(email, password);
      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 800);
    } catch (e) {
      const code = errorDetail(e, "code");
      setError(getAuthErrorMessage(code, locale));
      setErrorField(errorFieldForCode(code));
    } finally {
      setBusy(false);
    }
  }

  const submitLabel = mode === "register" ? copy.auth.submitRegister
    : mode === "login" ? copy.auth.submitLogin
      : copy.auth.sendResetEmailBtn;

  return {
    mode, setMode, name, setName, email, setEmail, password, setPassword, showPassword, setShowPassword,
    busy, error, setError, errorField, setErrorField, success, resetSent, setResetSent,
    submitLabel, submit, enableGuestMode,
  };
}
