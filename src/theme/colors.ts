import { radius } from "./radius";
import { spacing } from "./spacing";

export const colors = {
  canvas: "#F7F4EC",
  canvasWarm: "#F8F1E4",
  surface: "#FFFFFF",
  primary: "#6B4355",
  primarySoft: "#EFE8EB",
  primarySubtle: "#F5F0F2",
  primaryBorder: "#D8C7CF",
  success: "#5B8E55",
  successSoft: "#EAF3E8",
  successBorder: "#CDE2CA",
  successText: "#2C6326",
  attention: "#B85D43",
  attentionSoft: "#FCEEEA",
  attentionBorder: "#F3C5B8",
  attentionText: "#8F3A22",
  reward: "#F3B23F",
  rewardSoft: "#FEF7E6",
  rewardBorder: "#FCE4A6",
  rewardText: "#8A5B00",
  streak: "#EDEAE1",
  ink: "#1C1B1A",
  // Darkened from #7A7672 (4.10:1 against `canvas` — below WCAG AA's 4.5:1
  // for normal text, A11Y-QA-003 / GLOBAL-QA-026). #6B6763 keeps the same
  // warm neutral hue while reaching 5.10:1 against canvas / 5.61:1 against
  // surface, both comfortably above the AA threshold.
  muted: "#6B6763",
  faint: "#A8A49E",
  line: "#E7E1D7",
  lineSoft: "#F0ECE2",
  white: "#FFFFFF",
  disabledBg: "#E8E4DC",
  disabledBorder: "#DCD8CE",
  disabledText: "#9A968E",
} as const;

export const C = colors;
export { radius, spacing };
