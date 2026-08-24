import { colors } from "./colors";

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const componentSizes = {
  primaryButtonHeight: 52,
  secondaryButtonHeight: 44,
  chipHeight: 36,
  cardPadding: 16,
  cardPaddingLg: 20,
  minTouchTarget: 44,
  headerHeight: 56,
  bottomNavHeight: 64,
  contentMaxWidth: 580,
} as const;

export const shadows = {
  subtle: {
    shadowColor: "#462A37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: "#462A37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#462A37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
};

