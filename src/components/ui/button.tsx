import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './text';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

/** Primary CTA uses the gold accent; secondary is a forest outline. */
export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const { colors, radius, spacing, shadows } = useAppTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? colors.accent : variant === 'secondary' ? 'transparent' : 'transparent';
  const border = variant === 'secondary' ? colors.borderStrong : 'transparent';
  const textTone = variant === 'primary' ? 'onAccent' : 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        Haptics.selectionAsync();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderRadius: radius.pill,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'center',
        },
        variant === 'primary' && shadows.sm,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {loading && <ActivityIndicator size="small" color={colors.textOnAccent} />}
        <AppText variant="label" tone={textTone} weight="semibold">
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
