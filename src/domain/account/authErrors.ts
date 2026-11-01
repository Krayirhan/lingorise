/**
 * Translates Firebase auth errors into friendly and clear Turkish / English messages.
 * Pure function with zero external native dependencies.
 */
export function getAuthErrorMessage(code: string | undefined, locale: "tr" | "en" = "tr"): string {
  const messagesTr: Record<string, string> = {
    "auth/email-already-in-use": "Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapmayı deneyebilirsin.",
    "auth/invalid-email": "Lütfen geçerli bir e-posta adresi gir.",
    "auth/operation-not-allowed": "E-posta/şifre girişi şu anda etkin değil.",
    "auth/weak-password": "Şifren en az 8 karakter uzunluğunda olmalıdır.",
    "auth/user-disabled": "Bu hesap erişime kapatılmış. Destek ile iletişime geç.",
    "auth/user-not-found": "Bu e-posta adresiyle eşleşen bir hesap bulunamadı.",
    "auth/wrong-password": "Girdiğin şifre hatalı. Lütfen kontrol et.",
    "auth/invalid-credential": "E-posta veya şifre hatalı. Lütfen kontrol et.",
    "auth/too-many-requests": "Çok fazla başarısız deneme yapıldı. Güvenliğin için lütfen birkaç dakika sonra tekrar dene.",
    "auth/network-request-failed": "İnternet bağlantın yok gibi görünüyor. Bağlantını kontrol edip tekrar dene.",
    "auth/requires-recent-login": "Bu hassas işlem için yakın zamanda tekrar giriş yapmış olman gerekiyor.",
  };

  const messagesEn: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists with this email. Try logging in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled.",
    "auth/weak-password": "Password must be at least 8 characters.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "No internet connection detected. Please check your network.",
    "auth/requires-recent-login": "Please log in again before performing this sensitive action.",
  };

  const dict = locale === "en" ? messagesEn : messagesTr;
  return (
    dict[code || ""] ||
    (locale === "en"
      ? "An unexpected error occurred. Please try again."
      : "İşlem sırasında bir hata oluştu. Lütfen tekrar dene.")
  );
}
