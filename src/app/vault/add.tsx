import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAddDoc } from '@/hooks/use-vault';
import { VAULT_CATEGORIES, type VaultCategory } from '@/services/api/vault-repo';

export default function AddDoc() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const add = useAddDoc();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultCategory>('passport');
  const [uri, setUri] = useState<string>();

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setUri(res.assets[0].uri);
  };

  const onSave = async () => {
    await add.mutateAsync({ title: title.trim(), category, uri });
    router.back();
  };

  return (
    <StackScreen title={t('vault.add')}>
      <Pressable onPress={pick}>
        <View style={{ height: 160, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.surface }}>
          {uri ? (
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <AppText style={{ fontSize: 36 }}>📎</AppText>
          )}
        </View>
      </Pressable>

      <TextField label={t('capsule.titleField')} value={title} onChangeText={setTitle} />

      <View style={{ gap: spacing.sm }}>
        <AppText variant="label" tone="secondary" weight="medium">
          {t('vault.category')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {VAULT_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
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
                  {t(`vault.cat.${c}`)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button title={t('common.save')} disabled={title.trim().length < 2} loading={add.isPending} onPress={onSave} />
    </StackScreen>
  );
}
