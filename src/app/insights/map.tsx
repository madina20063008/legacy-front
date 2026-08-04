import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Avatar, Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';
import type { Person } from '@/types/models';

/**
 * Family Map (list-first). Groups members by the city they've chosen to share.
 * A full react-native-maps view is a follow-up (needs the native module +
 * platform map keys); this respects privacy by only showing shared locations.
 */
export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { people } = useFamily();

  const places = useMemo(() => {
    const byCity = new Map<string, Person[]>();
    for (const p of people) {
      if (!p.location) continue;
      if (!byCity.has(p.location)) byCity.set(p.location, []);
      byCity.get(p.location)!.push(p);
    }
    return [...byCity.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [people]);

  return (
    <StackScreen title={t('insights.map')}>
      {places.map(([city, residents]) => (
        <Card key={city} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="profile" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="semibold">
                {city}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {t('insights.peopleHere', { count: residents.length })}
              </AppText>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingTop: 4 }}>
            {residents.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/family/${p.id}`)} style={{ alignItems: 'center', gap: 4, width: 64 }}>
                <Avatar name={p.name} photoUrl={p.photoUrl} size={48} online={p.online} />
                <AppText variant="caption" numberOfLines={1}>
                  {p.name.split(' ')[0]}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </Card>
      ))}
    </StackScreen>
  );
}
