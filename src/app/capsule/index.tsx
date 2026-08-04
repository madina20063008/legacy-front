import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCapsules } from '@/hooks/use-capsule';
import { isOpenable } from '@/services/api/capsule-repo';

export default function CapsuleList() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { data: capsules } = useCapsules();

  const daysUntil = (iso: string) =>
    Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

  return (
    <StackScreen
      title={t('capsule.title')}
      right={
        <Pressable onPress={() => router.push('/capsule/new')} hitSlop={10}>
          <Icon name="plus" size={24} color={colors.accent} />
        </Pressable>
      }
    >
      {!capsules || capsules.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl }}>
          <AppText style={{ fontSize: 36 }}>⏳</AppText>
          <AppText tone="secondary" style={{ textAlign: 'center' }}>
            {t('capsule.empty')}
          </AppText>
          <Button title={t('capsule.newCapsule')} fullWidth={false} onPress={() => router.push('/capsule/new')} />
        </Card>
      ) : (
        capsules.map((c) => {
          const open = isOpenable(c);
          return (
            <Card key={c.id} style={{ gap: spacing.sm, borderWidth: open ? 1.5 : 0, borderColor: colors.accent }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppText style={{ fontSize: 22 }}>{open ? '📬' : '🔒'}</AppText>
                <AppText variant="body" weight="semibold" style={{ flex: 1 }}>
                  {c.title}
                </AppText>
                <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: open ? colors.accent : colors.surfaceSage }}>
                  <AppText variant="caption" tone={open ? 'onAccent' : 'secondary'} weight="semibold">
                    {open ? t('capsule.ready') : t('capsule.opensIn', { count: daysUntil(c.deliverAt) })}
                  </AppText>
                </View>
              </View>
              {open ? (
                <AppText variant="body" style={{ lineHeight: 22 }}>
                  {c.message}
                </AppText>
              ) : (
                <AppText variant="caption" tone="secondary">
                  {t('capsule.sealedUntil', { date: c.deliverAt })}
                </AppText>
              )}
            </Card>
          );
        })
      )}
      <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
        {t('capsule.note')}
      </AppText>
    </StackScreen>
  );
}
