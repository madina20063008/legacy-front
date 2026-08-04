import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOrders } from '@/hooks/use-orders';
import { formatUzs } from '@/utils/format';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();
  const { data: orders } = useOrders();

  return (
    <StackScreen title={t('market.ordersTitle')}>
      {!orders || orders.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <AppText style={{ fontSize: 34 }}>📦</AppText>
          <AppText tone="secondary">{t('market.noOrders')}</AppText>
        </Card>
      ) : (
        orders.map((o) => (
          <Card key={o.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <AppText variant="body" weight="semibold">
                  {t('market.orderNumber')} · {o.items.reduce((s, i) => s + i.qty, 0)} {t('market.items')}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {new Date(o.createdAt).toLocaleString()}
                </AppText>
              </View>
              <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceSage }}>
                <AppText variant="caption" tone="accent" weight="semibold">{t('market.orderStatus')}</AppText>
              </View>
            </View>
            <View style={{ gap: 2 }}>
              {o.items.map((i) => (
                <AppText key={i.productId} variant="caption" tone="secondary">
                  {i.emoji} {i.name} × {i.qty}
                </AppText>
              ))}
            </View>
            <AppText variant="body" weight="bold" tone="accent">{formatUzs(o.total)}</AppText>
          </Card>
        ))
      )}
    </StackScreen>
  );
}
