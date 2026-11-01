import { errorFieldForCode, validateAuthForm } from "../../src/features/auth/authFormModel";
import { copyByLocale } from "../../src/i18n/en";
import { assert } from "../support/assertions";

const auth = copyByLocale.tr.auth;
const ok = { name: "Ada", email: "ada@example.com", password: "12345678" };

assert(validateAuthForm(auth, "register", ok) === null, "A complete registration form is valid");
assert(validateAuthForm(auth, "register", { ...ok, name: "  " })?.field === "name", "Registration needs a name");
assert(validateAuthForm(auth, "login", { ...ok, name: "" }) === null, "Sign-in does not need a name");
assert(validateAuthForm(auth, "login", { ...ok, email: "ada@" })?.field === "email", "A malformed email is rejected");
assert(validateAuthForm(auth, "login", { ...ok, password: "1234567" })?.field === "password", "Passwords shorter than 8 characters are rejected");
assert(validateAuthForm(auth, "forgot", { ...ok, password: "" }) === null, "Password reset needs only an email");
assert(errorFieldForCode("auth/invalid-email") === "email" && errorFieldForCode("auth/wrong-password") === "password"
  && errorFieldForCode("auth/network-request-failed") === "general", "Auth error codes point at the right field");
