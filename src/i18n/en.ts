import { authEn } from "./auth";
import { homeEn } from "./home";
import { onboardingEn } from "./onboarding";
import { practiceEn } from "./practice";
import { progressEn } from "./progress";
import { profileEn } from "./profile";
import { tr } from "./tr";

export const en = {
  auth: authEn,
  onboarding: onboardingEn,
  home: homeEn,
  game: practiceEn,
  progress: progressEn,
  profile: profileEn,
  system: {
    errorBoundaryTitle: "Something unexpected happened",
    errorBoundarySubtitle: "Your garden is safe. You can restart to continue.",
    errorBoundaryRestart: "Restart Application",
    loadingText: "Preparing your garden...",
  },
} as const;

export { tr };

export type Locale = "en" | "tr";

/**
 * Keys are pinned to the English dictionary rather than left as an open
 * Record, so a typo in a lookup fails the build instead of silently falling
 * back to the inline default and shipping the wrong language.
 */
export type Copy = {
  auth: Record<keyof typeof authEn, string>;
  onboarding: Record<keyof typeof onboardingEn, string>;
  home: Record<keyof typeof homeEn, string>;
  game: Record<keyof typeof practiceEn, string>;
  progress: Record<keyof typeof progressEn, string>;
  profile: Record<keyof typeof profileEn, string>;
  system: Record<keyof typeof en.system, string>;
};

export const copyByLocale: Record<Locale, Copy> = {
  en: en as unknown as Copy,
  tr: tr as unknown as Copy,
};
