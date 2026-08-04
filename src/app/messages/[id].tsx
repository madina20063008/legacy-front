import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSendMessage, useThread } from '@/hooks/use-messages';
import { myUserId, type DirectMessage } from '@/services/api/messages-repo';

/** Private chat with another user (id = their account id). */
export default function ThreadScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const insets = useSafeAreaInsets();

  const me = myUserId();
  const { data: messages } = useThread(id);
  const send = useSendMessage(id);

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<DirectMessage>>(null);

  useEffect(() => {
    if (messages?.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages?.length]);

  const onSend = () => {
    const body = input.trim();
    if (!body) return;
    setInput('');
    send.mutate(body);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.headerId}>
          <Avatar name={name ?? '?'} size={36} />
          <AppText variant="label" weight="semibold" numberOfLines={1}>
            {name}
          </AppText>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={messages ?? []}
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item }) => {
            const mine = item.senderId === me;
            return (
              <View
                style={[
                  styles.bubble,
                  {
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    backgroundColor: mine ? colors.accent : colors.surfaceSage,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <AppText variant="body" tone={mine ? 'onAccent' : 'default'}>
                  {item.body}
                </AppText>
              </View>
            );
          }}
        />

        <View style={[styles.composer, { borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('messages.inputPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: radius.lg }]}
            onFocus={() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 250)}
          />
          <Pressable
            onPress={onSend}
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
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  headerId: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 8 },
  bubble: { maxWidth: '80%', paddingVertical: 10, paddingHorizontal: 14 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 8, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
