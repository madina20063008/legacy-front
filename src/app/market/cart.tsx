import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCart, useSetCartQty } from '@/hooks/use-market';
import { getProduct } from '@/services/api/market-repo';
import { formatUzs } from '@/utils/format';

export default function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { cart, total } = useCart();
  const setQty = useSetCartQty();

  const entries = Object.entries(cart);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {t('market.cart')}
        </AppText>
        <View style={{ width: 26 }} />
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <AppText style={{ fontSize: 40 }}>🛒</AppText>
          <AppText tone="secondary">{t('market.emptyCart')}</AppText>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            {entries.map(([id, qty]) => {
              const p = getProduct(id);
              if (!p) return null;
              return (
                <View key={id} style={[styles.row, { borderBottomColor: colors.border }]}>
                  <View style={[styles.thumb, { backgroundColor: colors.surfaceSage, borderRadius: radius.md }]}>
                    <AppText style={{ fontSize: 28 }}>{p.emoji}</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" weight="semibold" numberOfLines={1}>
                      {p.name}
                    </AppText>
                    <AppText variant="body" tone="accent" weight="bold">
                      {formatUzs(p.price * qty)}
                    </AppText>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable onPress={() => setQty.mutate({ productId: id, qty: qty - 1 })} style={[styles.stepBtn, { borderColor: colors.border }]}>
                      <AppText weight="bold">−</AppText>
                    </Pressable>
                    <AppText variant="body" weight="semibold" style={{ minWidth: 20, textAlign: 'center' }}>
                      {qty}
                    </AppText>
                    <Pressable onPress={() => setQty.mutate({ productId: id, qty: qty + 1 })} style={[styles.stepBtn, { borderColor: colors.border }]}>
                      <AppText weight="bold">+</AppText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, padding: spacing.lg }]}>
            <View style={styles.totalRow}>
              <AppText variant="body" tone="secondary">
                {t('market.total')}
              </AppText>
              <AppText variant="title" weight="bold">
                {formatUzs(total)}
              </AppText>
            </View>
            <Button title={t('market.checkout')} onPress={() => router.push('/market/checkout')} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1 },
  thumb: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footer: { borderTopWidth: 1, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
