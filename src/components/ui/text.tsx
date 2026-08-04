import { Text as RNText, type TextProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'default' | 'secondary' | 'accent' | 'onPrimary' | 'onAccent';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/** Themed text primitive. All copy in the app flows through this. */
export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  style,
  ...rest
}: AppTextProps) {
  const { colors, typography } = useAppTheme();

  const sizes: Record<Variant, number> = {
    display: typography.size.display,
    title: typography.size.xxl,
    heading: typography.size.lg,
    body: typography.size.md,
    label: typography.size.sm,
    caption: typography.size.xs,
  };
  const defaultWeight: Record<Variant, AppTextProps['weight']> = {
    display: 'bold',
    title: 'bold',
    heading: 'semibold',
    body: 'regular',
    label: 'medium',
    caption: 'regular',
  };
  const toneColor: Record<Tone, string> = {
    default: colors.text,
    secondary: colors.textSecondary,
    accent: colors.accent,
    onPrimary: colors.textOnPrimary,
    onAccent: colors.textOnAccent,
  };

  return (
    <RNText
      style={[
        {
          fontSize: sizes[variant],
          color: toneColor[tone],
          fontWeight: typography.weight[weight ?? defaultWeight[variant] ?? 'regular'] as never,
        },
        style,
      ]}
      {...rest}
    />
  );
}
