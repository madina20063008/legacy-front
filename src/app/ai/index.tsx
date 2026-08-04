import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';
import { askAssistant } from '@/services/ai/assistant';
import { makeId } from '@/utils/id';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function AiAssistant() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { people, graph, selfId } = useFamily();
  const { about } = useLocalSearchParams<{ about?: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !graph || pending) return;
    setInput('');
    setMessages((m) => [...m, { id: makeId('m'), role: 'user', text: trimmed }]);
    setPending(true);
    try {
      const reply = await askAssistant(trimmed, { people, graph, selfId }, t);
      setMessages((m) => [...m, { id: makeId('m'), role: 'assistant', text: reply }]);
    } finally {
      setPending(false);
    }
  };

  // If opened from a profile ("Ask AI about X"), seed the first question.
  useEffect(() => {
    if (about && graph) {
      const person = people.find((p) => p.id === about);
      if (person) send(t('ai.aboutPerson', { name: person.name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [about, graph]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, pending]);

  const suggestions =
    messages.length === 0
      ? [
          t('ai.suggestions.whoDoctors'),
          t('ai.suggestions.whoLivesIn', { place: 'Tashkent' }),
        ]
      : [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View style={styles.titleRow}>
          <Icon name="sparkle" size={22} color={colors.accent} filled />
          <AppText variant="heading" tone="onPrimary" weight="semibold">
            {t('ai.title')}
          </AppText>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <AppText tone="accent" weight="semibold">
            {t('common.cancel')}
          </AppText>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={[styles.body, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
                <AppText variant="body" tone="secondary">
                  {t('ai.greeting')}
                </AppText>
                <View style={{ gap: spacing.sm }}>
                  {suggestions.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => send(s)}
                      style={{
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <AppText variant="label" tone="accent">
                        {s}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                {
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: item.role === 'user' ? colors.accent : colors.surfaceSage,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <AppText variant="body" tone={item.role === 'user' ? 'onAccent' : 'default'}>
                {item.text}
              </AppText>
            </View>
          )}
          ListFooterComponent={
            pending ? (
              <View style={[styles.bubble, { alignSelf: 'flex-start', backgroundColor: colors.surfaceSage, borderRadius: radius.lg, flexDirection: 'row', gap: 8 }]}>
                <ActivityIndicator size="small" color={colors.accent} />
                <AppText tone="secondary">{t('ai.thinking')}</AppText>
              </View>
            ) : null
          }
        />

        {/* Composer — stays above the keyboard */}
        <View style={[styles.composer, { borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('ai.placeholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: radius.pill }]}
            onSubmitEditing={() => send(input)}
            onFocus={() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => send(input)}
            style={[styles.sendBtn, { backgroundColor: colors.accent, borderRadius: radius.full }]}
            accessibilityLabel="Send"
          >
            <Icon name="send" size={20} color={colors.textOnAccent} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16 },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
