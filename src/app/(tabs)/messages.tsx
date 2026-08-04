import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

import { Avatar, Card, Icon, Screen, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useConversations } from '@/hooks/use-messages';

export default function MessagesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { data: conversations } = useConversations();

  return (
    <Screen padded={false}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <AppText variant="title">{t('messages.title')}</AppText>
      </View>
      {!conversations || conversations.length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }}>
            <AppText style={{ fontSize: 34 }}>💬</AppText>
            <AppText tone="secondary" style={{ textAlign: 'center' }}>
              {t('messages.empty')}
            </AppText>
          </Card>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.userId}
          contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => {
            const preview = item.lastMessage
              ? `${item.fromMe ? `${t('messages.you')}: ` : ''}${item.lastMessage}`
              : (item.username ? `@${item.username}` : t('messages.startWith'));
            return (
              <Pressable
                onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.userId, name: item.name } })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Avatar name={item.name} photoUrl={item.photoUrl ?? undefined} size={52} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold" numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText variant="label" tone="secondary" numberOfLines={1}>
                    {preview}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textSecondary} />
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
