import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCart, useSetCartQty } from '@/hooks/use-market';
import { getProduct } from '@/services/api/market-repo';
import { formatUzs } from '@/utils/format';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { cart } = useCart();
  const setQty = useSetCartQty();

  const product = getProduct(id);
  if (!product) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <AppText style={{ padding: spacing.lg }}>{t('market.noResults')}</AppText>
      </SafeAreaView>
    );
  }

  const inCart = (cart[product.id] ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push('/market/cart')} hitSlop={10}>
          <Icon name="cart" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceSage, borderRadius: radius.xl }]}>
          <AppText style={{ fontSize: 96 }}>{product.emoji}</AppText>
        </View>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">{product.name}</AppText>
          <AppText variant="heading" tone="accent" weight="bold">
            {formatUzs(product.price)}
          </AppText>
          <AppText variant="body" tone="secondary" style={{ marginTop: spacing.sm, lineHeight: 22 }}>
            {product.description}
          </AppText>
        </View>
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        {inCart ? (
          <View style={styles.qtyWrap}>
            <View style={[styles.qtyRow, { borderColor: colors.accent, borderRadius: radius.pill }]}>
              <Pressable
                onPress={() => setQty.mutate({ productId: product.id, qty: (cart[product.id] ?? 0) - 1 })}
                style={styles.qtyBtn}
                hitSlop={10}
              >
                <AppText variant="heading" tone="accent" weight="bold">−</AppText>
              </Pressable>
              <View style={{ alignItems: 'center', minWidth: 52 }}>
                <AppText variant="caption" tone="secondary">{t('market.inCart')}</AppText>
                <AppText variant="heading" weight="bold">{cart[product.id]}</AppText>
              </View>
              <Pressable
                onPress={() => setQty.mutate({ productId: product.id, qty: (cart[product.id] ?? 0) + 1 })}
                style={styles.qtyBtn}
                hitSlop={10}
              >
                <AppText variant="heading" tone="accent" weight="bold">+</AppText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Button
            title={t('market.addToCart')}
            onPress={() => setQty.mutate({ productId: product.id, qty: 1 })}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { aspectRatio: 1.3, alignItems: 'center', justifyContent: 'center' },
  qtyWrap: { alignItems: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});

