import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Avatar, Button, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAddCapsule } from '@/hooks/use-capsule';
import { useFamily } from '@/hooks/use-family';

export default function NewCapsule() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useAppTheme();
  const { related, selfId } = useFamily();
  const add = useAddCapsule();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [deliverAt, setDeliverAt] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  const toggle = (id: string) =>
    setRecipients((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  const valid = title.trim().length > 1 && message.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(deliverAt);

  const onSave = async () => {
    await add.mutateAsync({ title, message, deliverAt, recipientIds: recipients });
    router.back();
  };

  return (
    <StackScreen title={t('capsule.newCapsule')}>
      <TextField label={t('capsule.titleField')} value={title} onChangeText={setTitle} />
      <TextField
        label={t('capsule.message')}
        value={message}
        onChangeText={setMessage}
        multiline
        style={{ height: 120, textAlignVertical: 'top' }}
      />
      <TextField label={t('capsule.deliverAt')} placeholder="2036-01-01" value={deliverAt} onChangeText={setDeliverAt} autoCapitalize="none" />

      <View style={{ gap: spacing.sm }}>
        <AppText variant="label" tone="secondary" weight="medium">
          {t('capsule.recipients')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {related
            .filter((p) => p.id !== selfId)
            .map((p) => {
              const active = recipients.includes(p.id);
              return (
                <Pressable key={p.id} onPress={() => toggle(p.id)} style={{ alignItems: 'center', gap: 4, width: 64, opacity: active ? 1 : 0.6 }}>
                  <Avatar name={p.name} photoUrl={p.photoUrl} size={48} glow={active} />
                  <AppText variant="caption" numberOfLines={1}>
                    {p.name.split(' ')[0]}
                  </AppText>
                </Pressable>
              );
            })}
        </View>
      </View>

      <Button title={t('capsule.seal')} disabled={!valid} loading={add.isPending} onPress={onSave} />
    </StackScreen>
  );
}
