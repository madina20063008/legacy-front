import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

const LOGO = require('@/images/image.png');

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useAppTheme();

  return (
    <Screen variant="forest" padded>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />

          <AppText variant="display" tone="onPrimary" weight="bold" style={styles.title}>
            {t('common.appName')}
          </AppText>
          <AppText variant="heading" tone="accent" weight="medium">
            {t('common.tagline')}
          </AppText>
        </View>

        <View style={{ gap: spacing.md }}>
          <AppText variant="body" tone="onPrimary" style={styles.body}>
            {t('onboarding.welcomeBody')}
          </AppText>
          <Button title={t('onboarding.getStarted')} onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 32 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  logo: { width: 180, height: 180, borderRadius: 24 },
  title: { letterSpacing: 1 },
  body: { textAlign: 'center', opacity: 0.9, lineHeight: 24 },
});
