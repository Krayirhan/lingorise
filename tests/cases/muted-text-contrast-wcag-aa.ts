import { C } from "../../src/theme/colors";
import { assert } from "../support/assertions";

// 60. Muted Text Contrast — WCAG AA (A11Y-QA-003 / GLOBAL-QA-026):
console.log("\n60. Muted Text Contrast — WCAG AA (A11Y-QA-003):");
{
  const relativeLuminance = (hex: string): number => {
    const clean = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
    const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const contrastRatio = (hexA: string, hexB: string): number => {
    const [l1, l2] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
    return (l1 + 0.05) / (l2 + 0.05);
  };

  const mutedVsCanvas = contrastRatio(C.muted, C.canvas);
  const mutedVsSurface = contrastRatio(C.muted, C.surface);
  assert(mutedVsCanvas >= 4.5, `C.muted meets WCAG AA (4.5:1) against C.canvas — actual ${mutedVsCanvas.toFixed(2)}:1 (was 4.10:1 before the fix)`);
  assert(mutedVsSurface >= 4.5, `C.muted meets WCAG AA (4.5:1) against C.surface — actual ${mutedVsSurface.toFixed(2)}:1`);
}

