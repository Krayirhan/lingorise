import { C } from "../../src/theme/colors";
import * as fs from "fs";
import * as path from "path";
import { assert } from "../support/assertions";

// 57. Automated Accessibility Scanner & reduceMotion Audit (ACC-001):
console.log("\n57. Automated Accessibility Scanner & reduceMotion Audit (ACC-001):");
{
  const srcRoot = path.join(__dirname, "..", "..", "src");

  // A. Check that all Onboarding components have accessibility tags & roles
  const onboardingFiles = [
    "screens/OnboardingScreen.tsx",
    "screens/OnboardingStepScreens.tsx",
    "features/onboarding/components/WelcomeStep.tsx",
    "features/onboarding/components/GoalStep.tsx",
    "features/onboarding/components/LevelStep.tsx",
    "features/onboarding/components/ReadyStep.tsx",
  ];

  for (const relPath of onboardingFiles) {
    const fullPath = path.join(srcRoot, relPath);
    assert(fs.existsSync(fullPath), `Onboarding file exists: ${relPath}`);
    const content = fs.readFileSync(fullPath, "utf-8");

    if (relPath.includes("WelcomeStep.tsx")) {
      assert(content.includes("accessibilityRole=\"button\""), "WelcomeStep skip button has accessibilityRole button");
      assert(content.includes("accessible={false}"), "WelcomeStep mascot image is marked accessible={false}");
    }
    if (relPath.includes("GoalStep.tsx")) {
      assert(content.includes("accessibilityRole=\"radio\""), "GoalStep options have accessibilityRole radio");
      assert(content.includes("accessibilityState"), "GoalStep options declare accessibilityState");
    }
    if (relPath.includes("ReadyStep.tsx")) {
      assert(content.includes("accessibilityRole=\"switch\""), "ReadyStep notification switch has accessibilityRole switch");
      assert(content.includes("accessible={false}"), "ReadyStep mascot is marked accessible={false}");
    }
    if (relPath.includes("OnboardingStepScreens.tsx")) {
      assert(content.includes("accessibilityRole=\"button\""), "Onboarding back button has accessibilityRole button");
      assert(content.includes("accessibilityLabel={`"), "Onboarding step counter has accessibilityLabel");
    }
  }

  // B. Check LevelPromotionModal TalkBack attributes
  const promoModalPath = path.join(srcRoot, "features/home/components/LevelPromotionModal.tsx");
  assert(fs.existsSync(promoModalPath), "LevelPromotionModal exists");
  const promoContent = fs.readFileSync(promoModalPath, "utf-8");
  assert(promoContent.includes("accessibilityViewIsModal={true}"), "LevelPromotionModal traps focus with accessibilityViewIsModal");
  assert(promoContent.includes("accessibilityRole=\"alert\""), "LevelPromotionModal announces itself with accessibilityRole alert");
  assert(promoContent.includes("accessibilityLiveRegion=\"assertive\""), "LevelPromotionModal has accessibilityLiveRegion assertive");
  assert(promoContent.includes("accessibilityLabel="), "LevelPromotionModal buttons have explicit accessibilityLabels");
  assert(promoContent.includes("reduceMotion ? \"none\" : \"fade\""), "LevelPromotionModal respects reduceMotion animationType");

  // C. Check SkeletonLoader reduceMotion support
  const skeletonPath = path.join(srcRoot, "components/SkeletonLoader.tsx");
  assert(fs.existsSync(skeletonPath), "SkeletonLoader exists");
  const skeletonContent = fs.readFileSync(skeletonPath, "utf-8");
  assert(skeletonContent.includes("isReduceMotionEnabled"), "SkeletonLoader checks system AccessibilityInfo.isReduceMotionEnabled");
  assert(skeletonContent.includes("isMotionReduced"), "SkeletonLoader respects isMotionReduced by stopping infinite pulsing loop");
}

