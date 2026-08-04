import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

interface CardProps {
  children: ReactNode;
  tone?: 'surface' | 'sage';
  style?: ViewStyle;
  elevated?: boolean;
}

/** Rounded, soft-shadowed surface used across the app. */
export function Card({ children, tone = 'surface', style, elevated = true }: CardProps) {
  const { colors, radius, spacing, shadows } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tone === 'sage' ? colors.surfaceSage : colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        elevated && shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}
