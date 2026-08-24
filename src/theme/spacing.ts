export const spacing = {
  xs: 4,      // Internal icon gap / tight micro space
  sm: 8,      // Small text gap
  md: 12,     // Label and title gap
  lg: 16,     // Content group gap
  xl: 20,     // Card section / internal item gap
  cardPad: 20,// Standard card padding
  xxl: 24,    // Large group gap / card padding
  section: 32,// Major section gap
  xxxl: 32,
} as const;

export type Spacing = typeof spacing;

