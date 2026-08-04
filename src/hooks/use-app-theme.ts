/**
 * Resolves the active Legacy palette from the device color scheme.
 * Everyday UI is light-first; dark mode leans into the immersive forest look.
 */
import { useColorScheme } from 'react-native';

import { motion, palette, radius, shadows, spacing, typography } from '@/theme';
import type { Palette } from '@/theme';

export function useAppTheme(): {
  colors: Palette;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  motion: typeof motion;
} {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? palette.dark : palette.light,
    isDark,
    spacing,
    radius,
    typography,
    shadows,
    motion,
  };
}
