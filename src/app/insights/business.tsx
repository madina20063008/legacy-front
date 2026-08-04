import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, Icon, AppText } from '@/components/ui';
import { BUSINESSES } from '@/features/insights/data';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

export default function BusinessScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { people } = useFamily();

  return (
    <StackScreen title={t('insights.business')}>
      {BUSINESSES.map((b) => {
        const owner = people.find((p) => p.id === b.ownerId);
        return (
          <Card key={b.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceSage, alignItems: 'center', justifyContent: 'center' }}>
                <AppText style={{ fontSize: 24 }}>{b.emoji}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="semibold">
                  {b.name}
                </AppText>
                <AppText variant="caption" tone="accent">
                  {b.category} · {b.location}
                </AppText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => router.push(`/family/${b.ownerId}`)}>
                <AppText variant="caption" tone="secondary">
                  {t('insights.owner')}: {owner?.name}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(`tel:${b.contact.replace(/\s/g, '')}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Icon name="phone" size={18} color={colors.accent} />
                <AppText variant="caption" tone="accent" weight="semibold">
                  {b.contact}
                </AppText>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </StackScreen>
  );
}
