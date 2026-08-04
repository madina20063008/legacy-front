import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, TextField } from '@/components/ui';
import { useAddFund } from '@/hooks/use-money';
import { parseUzs } from '@/utils/format';

export default function AddFundScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const addFund = useAddFund();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const onSave = async () => {
    const g = parseUzs(goal);
    await addFund.mutateAsync({ name: name.trim(), goal: g > 0 ? g : undefined });
    router.back();
  };

  return (
    <StackScreen title={t('money.addFundTitle')}>
      <TextField label={t('money.fundName')} value={name} onChangeText={setName} placeholder="Kapalak" />
      <TextField label={t('money.fundGoal')} keyboardType="number-pad" value={goal} onChangeText={setGoal} placeholder="5 000 000" />
      <Button title={t('common.save')} disabled={name.trim().length < 2} loading={addFund.isPending} onPress={onSave} />
    </StackScreen>
  );
}
