import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, AppText } from '@/components/ui';
import { upcomingBirthdays } from '@/features/notifications/derive';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';
import { useCart, useProducts } from '@/hooks/use-market';
import { CATEGORIES, type CategoryKey, type Product } from '@/types/market';
import { formatUzs } from '@/utils/format';

export default function MarketScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useAppTheme();
  const products = useProducts();
  const { count } = useCart();
  const { people } = useFamily();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryKey | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const nextBirthday = useMemo(() => upcomingBirthdays(people)[0], [people]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header: search + cart */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('market.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, color: colors.text, fontSize: 15 }}
          />
        </View>
        <Pressable onPress={() => router.push('/market/orders')} hitSlop={8}>
          <Icon name="grid" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push('/market/cart')} hitSlop={8}>
          <Icon name="cart" size={26} color={colors.text} />
          {count > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <AppText variant="caption" tone="onAccent" weight="bold" style={{ fontSize: 10 }}>
                {count}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            {/* Gift recommendation tied to upcoming birthdays */}
            {nextBirthday && (
              <Pressable
                onPress={() => setCategory('gifts')}
                style={[styles.giftBanner, { backgroundColor: colors.primary, borderRadius: radius.lg, marginHorizontal: spacing.lg }, shadows.md]}
              >
                <AppText style={{ fontSize: 28 }}>🎁</AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" tone="onPrimary" weight="semibold">
                    {t('market.giftFor', { name: nextBirthday.name.split(' ')[0] })}
                  </AppText>
                  <AppText variant="caption" tone="accent">
                    {t('market.giftSub', { count: nextBirthday.daysUntil })}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={20} color={colors.accent} />
              </Pressable>
            )}

            {/* Category chips */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['all', ...CATEGORIES] as (CategoryKey | 'all')[]}
              keyExtractor={(c) => c}
              contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
              renderItem={({ item }) => {
                const active = category === item;
                return (
                  <Pressable
                    onPress={() => setCategory(item)}
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.pill,
                      borderWidth: 1.5,
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.surfaceSage : colors.surface,
                    }}
                  >
                    <AppText variant="label" tone={active ? 'accent' : 'secondary'}>
                      {item === 'all' ? t('market.all') : t(`market.cat.${item}`)}
                    </AppText>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <AppText tone="secondary" style={{ textAlign: 'center', padding: spacing.xl }}>
            {t('market.noResults')}
          </AppText>
        }
        renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(`/market/${item.id}`)} />}
      />
    </SafeAreaView>
  );
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const { colors, spacing, radius, shadows } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.lg }, shadows.sm]}
    >
      <View style={[styles.thumb, { backgroundColor: colors.surfaceSage, borderRadius: radius.md }]}>
        <AppText style={{ fontSize: 48 }}>{product.emoji}</AppText>
      </View>
      <AppText variant="label" weight="semibold" numberOfLines={1} style={{ marginTop: spacing.sm }}>
        {product.name}
      </AppText>
      <AppText variant="body" tone="accent" weight="bold">
        {formatUzs(product.price)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1.5 },
  badge: { position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  giftBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  card: { flex: 1, padding: 10 },
  thumb: { aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center' },
});
