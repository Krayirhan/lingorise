import { getAuthErrorMessage } from "../../src/domain/account/authErrors";
import { assert } from "../support/assertions";

// 12. Error Sanitization & Turkish Translation
console.log("\n12. Error Sanitization & User-Friendly Messages:");
export const wrongPwMsg = getAuthErrorMessage("auth/wrong-password");
assert(wrongPwMsg === "Girdiğin şifre hatalı. Lütfen kontrol et.", "Firebase wrong-password maps to friendly Turkish error");
export const emailInUseMsg = getAuthErrorMessage("auth/email-already-in-use");
assert(emailInUseMsg === "Bu e-posta adresiyle kayıtlı bir hesap zaten var. Giriş yapmayı deneyebilirsin.", "Firebase email-already-in-use maps to friendly Turkish error");
export const networkMsg = getAuthErrorMessage("auth/network-request-failed");
assert(networkMsg === "İnternet bağlantın yok gibi görünüyor. Bağlantını kontrol edip tekrar dene.", "Firebase network error maps to friendly Turkish message");

