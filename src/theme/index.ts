/**
 * Legacy design tokens — the single source of truth for colors, typography,
 * spacing, radius, shadows, and animation timings.
 *
 * Business/UI code should import from here, never hardcode raw values.
 */

import { Platform } from 'react-native';

import { brand, palette } from './colors';

export { brand, palette } from './colors';
export type { Palette, ThemeName } from './colors';

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radii — rounded, organic feel. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
  full: 9999,
} as const;

export const typography = {
  family: Platform.select({
    ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
    android: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
    default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  })!,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 40,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },
} as const;

/** Soft, warm shadows. Cross-platform (elevation on Android). */
export const shadows = {
  none: {},
  sm: {
    shadowColor: brand.ink[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: brand.ink[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  glow: {
    // Gold glow used for premium interactions and avatar nodes.
    shadowColor: brand.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

/** Animation timings (ms) and easing hints. Keep motion gentle and performant. */
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  treeGrow: 900,
} as const;

/** Convenience bundle. */
export const theme = {
  palette,
  spacing,
  radius,
  typography,
  shadows,
  motion,
} as const;

export type Theme = typeof theme;
