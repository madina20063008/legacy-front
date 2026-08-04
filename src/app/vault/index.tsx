import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRemoveDoc, useVault } from '@/hooks/use-vault';
import type { VaultCategory } from '@/services/api/vault-repo';

const EMOJI: Record<VaultCategory, string> = {
  passport: '🛂',
  diploma: '🎓',
  certificate: '📜',
  will: '📃',
  other: '📁',
};

export default function VaultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { data: docs } = useVault();
  const remove = useRemoveDoc();

  return (
    <StackScreen
      title={t('vault.title')}
      right={
        <Pressable onPress={() => router.push('/vault/add')} hitSlop={10}>
          <Icon name="plus" size={24} color={colors.accent} />
        </Pressable>
      }
    >
      {/* Security banner */}
      <Card tone="sage" style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <AppText style={{ fontSize: 20 }}>🔐</AppText>
        <AppText variant="caption" tone="secondary" style={{ flex: 1 }}>
          {t('vault.note')}
        </AppText>
      </Card>

      {!docs || docs.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <AppText tone="secondary">{t('vault.empty')}</AppText>
        </Card>
      ) : (
        docs.map((d) => (
          <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceSage, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {d.uri ? (
                <Image source={{ uri: d.uri }} style={{ width: 48, height: 48 }} contentFit="cover" />
              ) : (
                <AppText style={{ fontSize: 24 }}>{EMOJI[d.category]}</AppText>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="semibold">
                {d.title}
              </AppText>
              <AppText variant="caption" tone="accent">
                {t(`vault.cat.${d.category}`)}
              </AppText>
            </View>
            <Pressable onPress={() => remove.mutate(d.id)} hitSlop={8} style={{ padding: 6 }}>
              <Icon name="trash" size={20} color={colors.textSecondary} />
            </Pressable>
          </Card>
        ))
      )}
    </StackScreen>
  );
}
