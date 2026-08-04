import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './text';
import { Screen } from './screen';

interface ComingSoonProps {
  title: string;
  icon?: string;
}

/** Polished placeholder for features that are intentionally out of the Phase 1 MVP. */
export function ComingSoon({ title, icon = '✦' }: ComingSoonProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: colors.accent,
            backgroundColor: colors.surfaceSage,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 36, color: colors.accent }}>{icon}</AppText>
        </View>
        <AppText variant="title">{title}</AppText>
        <AppText variant="label" tone="accent" weight="semibold">
          {t('common.comingSoon')}
        </AppText>
        <AppText variant="body" tone="secondary" style={{ textAlign: 'center', maxWidth: 300 }}>
          {t('common.comingSoonBody')}
        </AppText>
      </View>
    </Screen>
  );
}
