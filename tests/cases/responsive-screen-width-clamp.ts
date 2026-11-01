import { componentSizes } from "../../src/theme/tokens";
import { assert } from "../support/assertions";

// 18. Responsive Layout & Screen Clamp Verification
console.log("\n18. Responsive Screen Width Clamp:");
export const mobileWidth = 360;
export const tabletWidth = 1024;
export const getLayoutWidth = (w: number) => Math.min(w, componentSizes.contentMaxWidth);
assert(getLayoutWidth(mobileWidth) === 360, "Mobile screen width (360px) stays full width");
assert(getLayoutWidth(tabletWidth) === 580, "Tablet screen width (1024px) cleanly clamped to 580px max");

