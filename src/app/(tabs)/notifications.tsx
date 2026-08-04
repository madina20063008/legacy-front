import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Avatar, Card, Icon, Screen, AppText } from '@/components/ui';
import { upcomingBirthdays } from '@/features/notifications/derive';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { people } = useFamily();

  const reminders = useMemo(() => upcomingBirthdays(people), [people]);

  const dateFmt = (d: Date) =>
    d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <AppText variant="title">{t('notifications.title')}</AppText>

        {reminders.length === 0 ? (
          <Card>
            <AppText tone="secondary">{t('notifications.empty')}</AppText>
          </Card>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="label" tone="secondary" weight="medium">
              {t('notifications.birthdaysSection')}
            </AppText>
            {reminders.map((r) => {
              const isToday = r.daysUntil === 0;
              const person = people.find((p) => p.id === r.personId);
              return (
                <Pressable key={r.personId} onPress={() => router.push(`/family/${r.personId}`)}>
                  <Card
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: colors.accent,
                    }}
                  >
                    <Avatar name={r.name} photoUrl={person?.photoUrl} size={48} glow={isToday} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="body" weight="semibold">
                        {isToday
                          ? t('notifications.birthdayToday', { name: r.name })
                          : t('notifications.birthdayIn', { name: r.name, count: r.daysUntil })}
                      </AppText>
                      <AppText variant="caption" tone="secondary">
                        {t('notifications.turns', { age: r.turningAge, date: dateFmt(r.date) })}
                      </AppText>
                    </View>
                    {isToday ? (
                      <View
                        style={{
                          paddingHorizontal: spacing.sm,
                          paddingVertical: 4,
                          borderRadius: radius.pill,
                          backgroundColor: colors.accent,
                        }}
                      >
                        <AppText variant="caption" tone="onAccent" weight="semibold">
                          {t('notifications.today')}
                        </AppText>
                      </View>
                    ) : (
                      <Icon name="chevronRight" size={18} color={colors.textSecondary} />
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}
