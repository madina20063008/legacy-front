import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Button, Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { restorePhoto } from '@/services/ai/photo';

export default function RestoreScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();

  const [original, setOriginal] = useState<string>();
  const [restored, setRestored] = useState<string>();
  const [processing, setProcessing] = useState(false);

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setOriginal(result.assets[0].uri);
      setRestored(undefined);
    }
  };

  const run = async () => {
    if (!original) return;
    setProcessing(true);
    try {
      const res = await restorePhoto(original);
      setRestored(res.uri);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <StackScreen
      title={t('ai.restoreTitle')}
      right={
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.accent }}>
          <AppText variant="caption" tone="onAccent" weight="bold" style={{ fontSize: 10 }}>
            {t('ai.premium')}
          </AppText>
        </View>
      }
    >
      {/* Picker / preview */}
      {!original ? (
        <Pressable onPress={pick}>
          <Card style={{ height: 220, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.border }}>
            <AppText style={{ fontSize: 40 }}>🖼️</AppText>
            <AppText tone="secondary">{t('ai.restorePick')}</AppText>
          </Card>
        </Pressable>
      ) : (
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                {t('ai.restoreBefore')}
              </AppText>
              <Image source={{ uri: original }} style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md }} contentFit="cover" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="caption" tone="accent" weight="semibold" style={{ textAlign: 'center' }}>
                {t('ai.restoreAfter')}
              </AppText>
              <View style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceSage, alignItems: 'center', justifyContent: 'center' }}>
                {restored ? (
                  <Image source={{ uri: restored }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <Icon name="sparkle" size={28} color={colors.accent} filled />
                )}
              </View>
            </View>
          </View>

          <Button title={processing ? t('ai.restoreProcessing') : t('ai.restoreRun')} loading={processing} onPress={run} />
          <Button title={t('ai.restorePick')} variant="ghost" onPress={pick} />
        </View>
      )}

      <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
        {t('ai.restoreNote')}
      </AppText>
    </StackScreen>
  );
}
