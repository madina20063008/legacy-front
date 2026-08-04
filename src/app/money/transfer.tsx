import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Icon, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';
import { useMoney, useTransfer } from '@/hooks/use-money';
import { formatUzs, parseUzs } from '@/utils/format';

export default function TransferScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { related, selfId } = useFamily();
  const { cards } = useMoney();
  const transfer = useTransfer();

  const recipients = related.filter((p) => p.id !== selfId);
  const [toId, setToId] = useState<string>();
  const [cardId, setCardId] = useState<string>();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const selectedCard = cards.find((c) => c.id === cardId) ?? cards[0];
  const quickNotes = [t('money.quickWedding'), t('money.quickBirthday'), t('money.quickThanks')];
  const amountTiyin = parseUzs(amount);
  const canSend = !!toId && !!selectedCard && amountTiyin > 0 && !transfer.isPending;

  const [error, setError] = useState<string>();

  const onSend = async () => {
    const recipient = recipients.find((p) => p.id === toId);
    if (!recipient || !selectedCard || amountTiyin <= 0) return;
    if (selectedCard.balance < amountTiyin) return setError(t('money.insufficient'));
    try {
      await transfer.mutateAsync({
        cardId: selectedCard.id,
        toId: recipient.id,
        toName: recipient.name,
        amount: amountTiyin,
        note: note || undefined,
      });
      // Show a receipt / confirmation.
      router.replace({
        pathname: '/money/receipt',
        params: {
          amount: String(amountTiyin),
          name: recipient.name,
          note: note || '',
          date: new Date().toLocaleString(),
        },
      });
    } catch (e) {
      setError(e instanceof Error && e.message === 'NO_CARD' ? t('money.needCard') : t('common.somethingWrong'));
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {t('money.transferTitle')}
        </AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {/* Recipient picker */}
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" tone="secondary" weight="medium">
            {t('money.recipient')}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {recipients.map((p) => {
              const active = toId === p.id;
              return (
                <Pressable key={p.id} onPress={() => setToId(p.id)} style={{ alignItems: 'center', gap: 4, width: 72, opacity: active ? 1 : 0.7 }}>
                  <Avatar name={p.name} photoUrl={p.photoUrl} size={56} glow={active} />
                  <AppText variant="caption" tone={active ? 'accent' : 'secondary'} numberOfLines={1}>
                    {p.name.split(' ')[0]}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Card picker */}
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" tone="secondary" weight="medium">
            {t('money.fromCard')}
          </AppText>
          {cards.length === 0 ? (
            <Pressable
              onPress={() => router.push('/money/add-card')}
              style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center' }}
            >
              <AppText variant="label" tone="accent">{t('money.needCard')}</AppText>
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {cards.map((c) => {
                const active = selectedCard?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCardId(c.id)}
                    style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, minWidth: 150, borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.surfaceSage : colors.surface }}
                  >
                    <AppText variant="label" weight="bold">{c.brand} •••• {c.last4}</AppText>
                    <AppText variant="caption" tone="secondary">{formatUzs(c.balance)}</AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Amount */}
        <View style={{ gap: spacing.xs }}>
          <TextField
            label={t('money.amount')}
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            style={{ fontSize: 22, fontWeight: '700' }}
          />
          {amountTiyin > 0 && (
            <AppText variant="caption" tone="accent">
              {formatUzs(amountTiyin)}
            </AppText>
          )}
        </View>

        {/* Note + quick chips */}
        <View style={{ gap: spacing.sm }}>
          <TextField label={t('money.note')} value={note} onChangeText={setNote} placeholder={t('money.notePlaceholder')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {quickNotes.map((q) => (
              <Pressable
                key={q}
                onPress={() => setNote(q)}
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.pill,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <AppText variant="caption" tone="accent">
                  {q}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {error && (
          <AppText variant="label" style={{ color: colors.error, textAlign: 'center' }}>
            {error}
          </AppText>
        )}
        <Button title={t('money.sendCta')} loading={transfer.isPending} disabled={!canSend} onPress={onSend} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
