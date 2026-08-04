import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

interface ScreenProps {
  children: ReactNode;
  /** Immersive forest background (headers, tree, AI) vs everyday light surface. */
  variant?: 'light' | 'forest';
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
}

/** Safe-area-aware screen wrapper with theme-driven background. */
export function Screen({
  children,
  variant = 'light',
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();
  const backgroundColor = variant === 'forest' ? colors.primary : colors.background;
  const pad = padded ? { padding: spacing.lg } : undefined;

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[pad, { paddingBottom: 120 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, pad, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor }]} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
