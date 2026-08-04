import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './text';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Labeled text input with error state. Pairs with React Hook Form controllers. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const { colors, radius, spacing, typography } = useAppTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <AppText variant="label" tone="secondary" weight="medium">
          {label}
        </AppText>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSecondary}
        style={[
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            borderWidth: 1.5,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            color: colors.text,
            fontSize: typography.size.md,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <AppText variant="caption" style={{ color: colors.error }}>
          {error}
        </AppText>
      )}
    </View>
  );
});
