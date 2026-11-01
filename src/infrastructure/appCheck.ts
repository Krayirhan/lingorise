import { isRunningInExpoGo } from "expo";
import { CustomProvider, initializeAppCheck } from "firebase/app-check";
import { Platform } from "react-native";
import app from "./firebase";

/**
 * Bridges native Play Integrity attestation (only obtainable through the
 * native @react-native-firebase module — the plain "firebase" JS SDK has no
 * way to reach it) into the JS SDK's own App Check, which is what actually
 * protects the Firestore/Auth calls this app makes (see firebase.ts). Both
 * packages define their token shape identically as
 * { token: string, expireTimeMillis: number }, so the native token is handed
 * to the JS SDK's own CustomProvider unchanged — no format conversion needed.
 *
 * Deliberately unenforced for now: firestore.rules does not yet require this
 * token on any request. Enforcement should only be added once Firebase
 * Console's App Check metrics confirm real devices are producing verified
 * tokens — getting the bridge wrong and enforcing it blind would lock every
 * user out of Firestore instead of merely leaving a gap unpatched.
 */
export function initAppCheck(): void {
  // The React Native Firebase App Check provider bridges native device
  // attestation and cannot initialize in the browser preview or inside Expo Go
  // (where native @react-native-firebase modules are not compiled into the client).
  if (Platform.OS === "web" || isRunningInExpoGo()) return;

  try {
    // Loaded lazily on purpose: a top-level import evaluates the native module
    // as soon as this file loads, which throws in Expo Go before the guard above
    // can return.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getApp } = require("@react-native-firebase/app") as typeof import("@react-native-firebase/app");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nativeAppCheck = require("@react-native-firebase/app-check") as typeof import("@react-native-firebase/app-check");

    const rnfbProvider = new nativeAppCheck.ReactNativeFirebaseAppCheckProvider();
    rnfbProvider.configure({
      android: {
        // Play Integrity verdicts require a Play-signed, Play-distributed
        // build; the debug provider is what dev/EAS-preview builds use instead.
        provider: __DEV__ ? "debug" : "playIntegrity",
      },
    });

    nativeAppCheck.initializeAppCheck(getApp(), {
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });

    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: () => rnfbProvider.getToken(),
      }),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn("Lingterra: Native App Check skipped in this runtime", err);
  }
}
