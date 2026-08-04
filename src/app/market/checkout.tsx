import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, Card, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCart } from '@/hooks/use-market';
import { useMoney } from '@/hooks/use-money';
import { usePlaceOrder } from '@/hooks/use-orders';
import { getProduct } from '@/services/api/market-repo';
import type { OrderItem } from '@/types/order';
import { formatUzs } from '@/utils/format';

export default function Checkout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { cart, total } = useCart();
  const { cards } = useMoney();
  const placeOrder = usePlaceOrder();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [promo, setPromo] = useState('');
  const [cardId, setCardId] = useState<string>();
  const [error, setError] = useState<string>();

  const selectedCard = cards.find((c) => c.id === cardId) ?? cards[0];

  const items = useMemo<OrderItem[]>(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const p = getProduct(id);
          return p ? { productId: p.id, name: p.name, emoji: p.emoji, price: p.price, qty } : null;
        })
        .filter(Boolean) as OrderItem[],
    [cart],
  );

  const valid = address.trim().length > 2 && phone.trim().length > 4 && items.length > 0;

  const onPlace = async () => {
    if (selectedCard && selectedCard.balance < total) return setError(t('money.insufficient'));
    setError(undefined);
    try {
      await placeOrder.mutateAsync({
        address: address.trim(),
        phone: phone.trim(),
        promo: promo.trim() || undefined,
        cardId: selectedCard?.id,
        items,
      });
      router.replace({
        pathname: '/market/order-success',
        params: {
          total: String(total),
          count: String(items.reduce((s, i) => s + i.qty, 0)),
          address: address.trim(),
        },
      });
    } catch {
      setError(t('common.somethingWrong'));
    }
  };

  return (
    <StackScreen title={t('market.checkoutTitle')}>
      {/* Summary */}
      <Card style={{ gap: spacing.xs }}>
        {items.map((i) => (
          <View key={i.productId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {i.emoji} {i.name} × {i.qty}
            </AppText>
            <AppText variant="label" weight="semibold">{formatUzs(i.price * i.qty)}</AppText>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="body" weight="bold">{t('market.orderTotal')}</AppText>
          <AppText variant="body" weight="bold" tone="accent">{formatUzs(total)}</AppText>
        </View>
      </Card>

      <TextField label={t('market.address')} value={address} onChangeText={setAddress} placeholder="Tashkent, Chilonzor 12-45" />
      <TextField label={t('market.phone')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="+998 90 123 45 67" />
      <TextField label={t('market.promo')} autoCapitalize="characters" value={promo} onChangeText={setPromo} placeholder="FAMILY10" />

      {/* Card picker */}
      <View style={{ gap: spacing.sm }}>
        <AppText variant="label" tone="secondary" weight="medium">{t('market.payWith')}</AppText>
        {cards.length === 0 ? (
          <Pressable onPress={() => router.push('/money/add-card')} style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center' }}>
            <AppText variant="label" tone="accent">{t('money.addCard')}</AppText>
          </Pressable>
        ) : (
          cards.map((c) => {
            const active = selectedCard?.id === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCardId(c.id)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.surfaceSage : colors.surface }}
              >
                <AppText variant="label" weight="bold">{c.brand} •••• {c.last4}</AppText>
                <AppText variant="caption" tone="secondary">{formatUzs(c.balance)}</AppText>
              </Pressable>
            );
          })
        )}
      </View>

      {error && <AppText variant="label" style={{ color: colors.error, textAlign: 'center' }}>{error}</AppText>}
      <Button title={t('market.placeOrderCta', { total: formatUzs(total) })} disabled={!valid} loading={placeOrder.isPending} onPress={onPlace} />
    </StackScreen>
  );
}
