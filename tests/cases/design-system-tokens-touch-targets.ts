import { componentSizes, iconSizes } from "../../src/theme/tokens";
import { assert } from "../support/assertions";

// 14. Design System Tokens & Touch Targets
console.log("\n14. Design System Tokens & Touch Targets:");
assert(componentSizes.primaryButtonHeight === 52, "Primary button height standardized to 52px");
assert(componentSizes.secondaryButtonHeight === 44, "Secondary button height standardized to 44px");
assert(componentSizes.minTouchTarget === 44, "Minimum touch target meets accessibility guideline (44px)");
assert(componentSizes.contentMaxWidth === 580, "Content max width standardized for tablets (580px)");
assert(iconSizes.md === 20, "Medium icon size standardized to 20px");

