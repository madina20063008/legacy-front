import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Card, Icon, Screen, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { setLanguage, type AppLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import { resetMockFamily } from '@/services/api/family-repo';
import { useAuth } from '@/store/auth';

const LANG_LABEL: Record<AppLanguage, string> = {
  en: 'settings.languageEnglish',
  ru: 'settings.languageRussian',
  uz: 'settings.languageUzbek',
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();
  const signOut = useAuth((s) => s.signOut);
  const qc = useQueryClient();

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <AppText variant="title">{t('settings.title')}</AppText>

        {/* Language */}
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" tone="secondary" weight="medium">
            {t('settings.language')}
          </AppText>
          <Card style={{ padding: spacing.xs }}>
            {SUPPORTED_LANGUAGES.map((lng, i) => {
              const active = i18n.language === lng;
              return (
                <Pressable
                  key={lng}
                  onPress={() => setLanguage(lng)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.sm,
                    borderBottomWidth: i < SUPPORTED_LANGUAGES.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <AppText variant="body" tone={active ? 'accent' : 'default'} weight={active ? 'semibold' : 'regular'}>
                    {t(LANG_LABEL[lng])}
                  </AppText>
                  {active && <Icon name="chevronRight" size={18} color={colors.accent} />}
                </Pressable>
              );
            })}
          </Card>
        </View>

        {/* Account actions */}
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" tone="secondary" weight="medium">
            {t('settings.account')}
          </AppText>
          <Card>
            <Pressable
              onPress={async () => {
                await resetMockFamily();
                qc.invalidateQueries();
              }}
              style={{ paddingVertical: spacing.sm }}
            >
              <AppText variant="body">{t('settings.resetDemo')}</AppText>
            </Pressable>
          </Card>
        </View>

        <Button title={t('settings.logout')} variant="secondary" onPress={signOut} />
      </View>
    </Screen>
  );
}
