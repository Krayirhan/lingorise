import { radius } from "./radius";
import { spacing } from "./spacing";

export const colors = {
  canvas: "#FBF9F5",
  canvasWarm: "#EDE3D1",
  surface: "#FFFBF5",
  primary: "#30202D",
  primarySoft: "#E6DAC6",
  primarySubtle: "#EDE3D2",
  primaryBorder: "#D2BFA1",
  success: "#4E7D49",
  growth: "#718D68",
  successSoft: "#E3EDE0",
  successBorder: "#C2D8BC",
  successText: "#285723",
  attention: "#B34F32",
  attentionSoft: "#F7E4DC",
  attentionBorder: "#E8B9A8",
  attentionText: "#8F3A22",
  // Terracotta for filled cards; cream text retains 4.9:1 contrast.
  attentionStrong: "#B34F32",
  reward: "#EAB65B",
  rewardSoft: "#FAECCC",
  rewardBorder: "#E5C27E",
  rewardText: "#7A3B24",
  streak: "#E8DEC8",
  ink: "#30202D",
  // Dark plum neutral keeps secondary copy readable on the light surfaces.
  muted: "#4A353B",
  faint: "#7D6B6E",
  line: "#E4D8C9",
  lineSoft: "#EDE4D4",
  white: "#F4EBDC",
  disabledBg: "#DFD3BE",
  disabledBorder: "#CFC1A8",
  disabledText: "#85786C",
} as const;

export const C = colors;
export { radius, spacing };
