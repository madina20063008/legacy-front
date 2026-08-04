import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useMoney } from '@/hooks/use-money';
import type { Fund, Transaction } from '@/types/money';
import { formatUzs } from '@/utils/format';

export default function MoneyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius, shadows } = useAppTheme();
  const { cards, funds, transactions, totalBalance } = useMoney();

  return (
    <Screen scroll padded={false}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <AppText variant="title">{t('money.title')}</AppText>

        {/* Total balance hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary, borderRadius: radius.xl }, shadows.md]}>
          <AppText variant="label" tone="accent" weight="semibold">
            {t('money.totalBalance')}
          </AppText>
          <AppText variant="display" tone="onPrimary" weight="bold" style={{ fontSize: 34 }}>
            {formatUzs(totalBalance)}
          </AppText>
          <Button title={t('money.send')} onPress={() => router.push('/money/transfer')} fullWidth={false} />
        </View>

        {/* Cards */}
        <SectionHeader title={t('money.cards')} action={t('money.addCard')} onAdd={() => router.push('/money/add-card')} />
        {cards.length === 0 ? (
          <AppText variant="caption" tone="secondary">{t('money.noCards')}</AppText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {cards.map((c) => (
              <View
                key={c.id}
                style={[styles.card, { backgroundColor: colors.surfaceSage, borderRadius: radius.lg, borderColor: colors.borderStrong }]}
              >
                <View style={styles.cardTop}>
                  <AppText variant="label" weight="bold">{c.brand}</AppText>
                  <Icon name="wallet" size={22} color={colors.accentStrong} />
                </View>
                <AppText variant="heading" weight="semibold">{formatUzs(c.balance)}</AppText>
                <AppText variant="caption" tone="secondary">•••• •••• •••• {c.last4}</AppText>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Family funds */}
        <SectionHeader title={t('money.funds')} action={t('money.addFund')} onAdd={() => router.push('/money/add-fund')} />
        {funds.length === 0 ? (
          <AppText variant="caption" tone="secondary">{t('money.noFunds')}</AppText>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {funds.map((f) => (
              <FundCard key={f.id} fund={f} />
            ))}
          </View>
        )}

        {/* Recent transactions */}
        <AppText variant="label" tone="secondary" weight="medium">
          {t('money.recentTx')}
        </AppText>
        <Card>
          {transactions.length === 0 ? (
            <AppText tone="secondary">{t('money.noTx')}</AppText>
          ) : (
            transactions.map((tx, i) => (
              <TxRow key={tx.id} tx={tx} last={i === transactions.length - 1} />
            ))
          )}
        </Card>

        <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          {t('money.securityNote')}
        </AppText>
      </View>
    </Screen>
  );
}

function SectionHeader({ title, action, onAdd }: { title: string; action: string; onAdd: () => void }) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <AppText variant="label" tone="secondary" weight="medium">
        {title}
      </AppText>
      <Pressable
        onPress={onAdd}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.accent }}
        hitSlop={6}
      >
        <Icon name="plus" size={14} color={colors.accent} />
        <AppText variant="caption" tone="accent" weight="semibold">
          {action}
        </AppText>
      </Pressable>
    </View>
  );
}

function FundCard({ fund }: { fund: Fund }) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();
  const pct = fund.goal ? Math.min(1, fund.balance / fund.goal) : 0;
  return (
    <Card tone="sage">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <AppText variant="body" weight="semibold">
            {fund.name}
          </AppText>
        </View>
        <AppText variant="body" weight="bold" tone="accent">
          {formatUzs(fund.balance)}
        </AppText>
      </View>
      {fund.goal && (
        <View style={{ marginTop: spacing.sm, gap: 4 }}>
          <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
            <View style={{ width: `${pct * 100}%`, height: 6, backgroundColor: colors.accent }} />
          </View>
          <AppText variant="caption" tone="secondary">
            {t('money.goal')}: {formatUzs(fund.goal)}
          </AppText>
        </View>
      )}
    </Card>
  );
}

function TxRow({ tx, last }: { tx: Transaction; last: boolean }) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const incoming = tx.type === 'received' || tx.type === 'topup';
  const label =
    tx.type === 'sent'
      ? t('money.sent', { name: tx.counterpartyName ?? '' })
      : tx.type === 'received'
        ? t('money.received', { name: tx.counterpartyName ?? '' })
        : tx.type === 'order'
          ? (tx.note ?? t('money.topup'))
          : t('money.topup');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <AppText variant="body">{label}</AppText>
        {tx.note ? (
          <AppText variant="caption" tone="secondary">
            {tx.note}
          </AppText>
        ) : null}
      </View>
      <AppText variant="body" weight="semibold" style={{ color: incoming ? colors.success : colors.text }}>
        {incoming ? '+' : '−'}
        {formatUzs(tx.amount)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, gap: 8, alignItems: 'flex-start' },
  card: { width: 200, padding: 16, gap: 6, borderWidth: 1 },
  addCard: { width: 130, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', gap: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
