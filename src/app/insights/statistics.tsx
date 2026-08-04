import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, AppText } from '@/components/ui';
import { computeStats } from '@/features/insights/stats';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();
  const { people } = useFamily();
  const stats = useMemo(() => computeStats(people), [people]);

  const tiles = [
    { label: t('insights.statMembers'), value: String(stats.members) },
    { label: t('insights.statCities'), value: String(stats.cities.length) },
    { label: t('insights.statProfessions'), value: String(stats.professions.length) },
  ];

  const maxCount = stats.professions[0]?.count ?? 1;

  return (
    <StackScreen title={t('insights.statistics')}>
      {/* Stat tiles */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {tiles.map((tile) => (
          <Card key={tile.label} tone="sage" style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <AppText variant="display" weight="bold" tone="accent" style={{ fontSize: 30 }}>
              {tile.value}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {tile.label}
            </AppText>
          </Card>
        ))}
      </View>

      {/* Oldest / youngest */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {stats.oldest && (
          <Card style={{ flex: 1, gap: 2 }}>
            <AppText variant="caption" tone="secondary">
              {t('insights.statOldest')}
            </AppText>
            <AppText variant="body" weight="semibold">
              {stats.oldest.person.name}
            </AppText>
            <AppText variant="caption" tone="accent">
              {t('profile.years', { count: stats.oldest.age })}
            </AppText>
          </Card>
        )}
        {stats.youngest && (
          <Card style={{ flex: 1, gap: 2 }}>
            <AppText variant="caption" tone="secondary">
              {t('insights.statYoungest')}
            </AppText>
            <AppText variant="body" weight="semibold">
              {stats.youngest.person.name}
            </AppText>
            <AppText variant="caption" tone="accent">
              {t('profile.years', { count: stats.youngest.age })}
            </AppText>
          </Card>
        )}
      </View>

      {/* Profession distribution */}
      <AppText variant="label" tone="secondary" weight="medium">
        {t('insights.statProfessions')}
      </AppText>
      <Card style={{ gap: spacing.sm }}>
        {stats.professions.map((p) => (
          <View key={p.profession} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="label">{p.profession}</AppText>
              <AppText variant="label" tone="secondary">
                {p.count}
              </AppText>
            </View>
            <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
              <View style={{ width: `${(p.count / maxCount) * 100}%`, height: 6, backgroundColor: colors.accent }} />
            </View>
          </View>
        ))}
      </Card>
    </StackScreen>
  );
}
