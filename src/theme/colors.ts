/**
 * Legacy brand palette.
 *
 * Derived from the "tree of life" logo: golden tree on a deep dark-green field,
 * with sage/olive secondary surfaces and warm cream neutrals.
 *
 * Design language: Apple × Notion × FamilySearch — premium, warm, heritage-driven.
 */

/** Raw brand color ramps. Prefer the semantic `palette` export below in UI code. */
export const brand = {
  // Deep dark green — almost black-green. Splash, headers, immersive tree, AI.
  forest: {
    900: '#06180F',
    800: '#0B2E1E',
    700: '#123E29',
    600: '#1B5235',
  },
  // Gold / amber metallic accent. Branches, icons, active nav, primary CTAs.
  gold: {
    600: '#A8801C',
    500: '#C9A227',
    400: '#DDB84A',
    300: '#E8CE7B',
  },
  // Soft sage / olive — family tree backgrounds, profile cards, everyday UI.
  sage: {
    600: '#6E8B5A',
    500: '#8FA97A',
    400: '#B4C9A1',
    300: '#D6E4C8',
  },
  // Warm neutral surfaces — forms, text-heavy cards.
  cream: {
    100: '#FFFFFF',
    200: '#FBF8F0',
    300: '#F2ECDD',
    400: '#E6DcC5',
  },
  // Ink for text.
  ink: {
    900: '#14140F', // near-black
    700: '#2C2C26', // dark charcoal
    500: '#5A5A50',
  },
  status: {
    success: '#3E9C5F',
    warning: '#D9A441',
    error: '#C0492F',
    online: '#4CAF50',
  },
} as const;

/**
 * Semantic tokens, split by theme. Light is the primary everyday surface;
 * dark leans into the immersive forest aesthetic.
 */
export const palette = {
  light: {
    // Surfaces
    background: brand.cream[200],
    surface: brand.cream[100],
    surfaceAlt: brand.cream[300],
    surfaceSage: brand.sage[300],
    // Brand
    primary: brand.forest[800],
    accent: brand.gold[500],
    accentStrong: brand.gold[600],
    // Text
    text: brand.ink[900],
    textSecondary: brand.ink[500],
    textOnPrimary: brand.cream[200],
    textOnAccent: brand.forest[900],
    // Lines
    border: brand.cream[400],
    borderStrong: brand.sage[500],
    // Status
    ...brand.status,
  },
  dark: {
    background: brand.forest[900],
    surface: brand.forest[800],
    surfaceAlt: brand.forest[700],
    surfaceSage: brand.forest[600],
    primary: brand.forest[800],
    accent: brand.gold[400],
    accentStrong: brand.gold[500],
    text: brand.cream[200],
    textSecondary: brand.sage[400],
    textOnPrimary: brand.cream[200],
    textOnAccent: brand.forest[900],
    border: brand.forest[600],
    borderStrong: brand.gold[600],
    ...brand.status,
  },
} as const;

export type ThemeName = keyof typeof palette;
export type Palette = (typeof palette)[ThemeName];
