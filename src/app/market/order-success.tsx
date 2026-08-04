import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button, Card, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatUzs } from '@/utils/format';

function Row({ label, value }: { label: string; value?: string }) {
  const { colors, spacing } = useAppTheme();
  if (!value) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <AppText variant="label" tone="secondary">{label}</AppText>
      <AppText variant="label" weight="semibold" style={{ flex: 1, textAlign: 'right' }} numberOfLines={1}>{value}</AppText>
    </View>
  );
}

export default function OrderSuccess() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useAppTheme();
  const { total, count, address } = useLocalSearchParams<{ total: string; count: string; address: string }>();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.primary }]}>
      <View style={styles.body}>
        <View style={[styles.check, { backgroundColor: colors.accent }, shadows.glow]}>
          <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={colors.textOnAccent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 12l5 5L20 6" />
          </Svg>
        </View>
        <AppText variant="title" tone="onPrimary" style={{ textAlign: 'center' }}>
          {t('market.orderPlaced')}
        </AppText>
        <AppText variant="body" tone="accent" style={{ textAlign: 'center' }}>
          {t('market.orderPlacedBody')}
        </AppText>

        <Card style={{ alignSelf: 'stretch', marginTop: spacing.lg, borderRadius: radius.lg }}>
          <Row label={t('market.orderTotal')} value={formatUzs(parseInt(total ?? '0', 10))} />
          <Row label={t('market.items')} value={count} />
          <Row label={t('market.address')} value={address} />
        </Card>
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Button title={t('market.orders')} variant="secondary" onPress={() => { router.dismissAll(); router.push('/market/orders'); }} />
        <Button title={t('money.done')} onPress={() => router.dismissAll()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  check: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
