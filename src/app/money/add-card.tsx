import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAddCard } from '@/hooks/use-money';
import type { CardBrand } from '@/types/money';
import { parseUzs } from '@/utils/format';

const BRANDS: CardBrand[] = ['HUMO', 'UZCARD', 'VISA'];

export default function AddCardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const addCard = useAddCard();

  const [brand, setBrand] = useState<CardBrand>('HUMO');
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [balance, setBalance] = useState('');

  const digits = cardNumber.replace(/\D/g, '');
  const valid = digits.length === 16 && holder.trim().length > 1;

  // Format as groups of 4 (1234 5678 9012 3456), max 16 digits.
  const onNumberChange = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 16);
    setCardNumber(d.replace(/(.{4})/g, '$1 ').trim());
  };

  const onSave = async () => {
    // The full 16-digit number is stored; the UI only ever shows the last 4.
    await addCard.mutateAsync({ brand, number: digits, holder: holder.trim().toUpperCase(), balance: parseUzs(balance) });
    router.back();
  };

  return (
    <StackScreen title={t('money.addCardTitle')}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="label" tone="secondary" weight="medium">
          {t('money.cardBrand')}
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {BRANDS.map((b) => {
            const active = brand === b;
            return (
              <Pressable
                key={b}
                onPress={() => setBrand(b)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  alignItems: 'center',
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.surfaceSage : colors.surface,
                }}
              >
                <AppText variant="label" weight="bold" tone={active ? 'accent' : 'secondary'}>
                  {b}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField label={t('money.cardNumber')} keyboardType="number-pad" maxLength={19} value={cardNumber} onChangeText={onNumberChange} placeholder="1234 5678 9012 3456" />
      <TextField label={t('money.cardHolder')} autoCapitalize="characters" value={holder} onChangeText={setHolder} placeholder="MADINA BATOSHOVA" />
      <TextField label={t('money.cardBalance')} keyboardType="number-pad" value={balance} onChangeText={setBalance} placeholder="0" />

      <Button title={t('common.save')} disabled={!valid} loading={addCard.isPending} onPress={onSave} />
    </StackScreen>
  );
}
