import { authTr } from "./auth";
import { homeTr } from "./home";
import { onboardingTr } from "./onboarding";
import { practiceTr } from "./practice";
import { progressTr } from "./progress";
import { profileTr } from "./profile";

export const tr = {
  auth: authTr,
  onboarding: onboardingTr,
  home: homeTr,
  game: practiceTr,
  progress: progressTr,
  profile: profileTr,
  system: {
    errorBoundaryTitle: "Bir şeyler beklenmedik şekilde gelişti",
    errorBoundarySubtitle: "Bahçen güvende. Yeniden başlatarak devam edebilirsin.",
    errorBoundaryRestart: "Uygulamayı Yeniden Başlat",
    loadingText: "Bahçen hazırlanıyor...",
  },
} as const;

