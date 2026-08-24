export const typography = {
  fontSizes: {
    badge: 11,
    caption: 13,
    sm: 13,
    body: 15,
    md: 15,
    cardTitle: 18,
    lg: 18,
    sectionTitle: 21,
    xl: 21,
    pageTitle: 27,
    xxl: 27,
    display: 31,
    hero: 36,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },
  styles: {
    display: {
      fontSize: 31,
      fontWeight: "700" as const,
      lineHeight: 36,
      letterSpacing: -0.4,
    },
    pageTitle: {
      fontSize: 27,
      fontWeight: "700" as const,
      lineHeight: 33,
      letterSpacing: -0.3,
    },
    sectionTitle: {
      fontSize: 21,
      fontWeight: "700" as const,
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      lineHeight: 23,
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      lineHeight: 21,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: "500" as const,
      lineHeight: 21,
    },
    caption: {
      fontSize: 13,
      fontWeight: "500" as const,
      lineHeight: 18,
    },
    badge: {
      fontSize: 11,
      fontWeight: "700" as const,
      lineHeight: 14,
    },
  },
} as const;

export type Typography = typeof typography;

