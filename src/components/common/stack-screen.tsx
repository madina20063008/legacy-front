import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

interface StackScreenProps {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  right?: ReactNode;
  contentStyle?: ViewStyle;
}

/** Pushed screen with a back button + centered title. Keyboard-aware. */
export function StackScreen({ title, children, scroll = true, right, contentStyle }: StackScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: spacing.lg, gap: spacing.md, paddingBottom: 120 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {title}
        </AppText>
        <View style={{ minWidth: 26, alignItems: 'flex-end' }}>{right}</View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={56}>
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});
