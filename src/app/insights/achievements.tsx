import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Avatar, Card, AppText } from '@/components/ui';
import { ACHIEVEMENTS } from '@/features/insights/data';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { spacing } = useAppTheme();
  const { people } = useFamily();

  return (
    <StackScreen title={t('insights.achievements')}>
      {ACHIEVEMENTS.map((a) => {
        const person = people.find((p) => p.id === a.personId);
        return (
          <Pressable key={a.id} onPress={() => router.push(`/family/${a.personId}`)}>
            <Card style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Avatar name={person?.name ?? '?'} photoUrl={person?.photoUrl} size={44} />
                <View style={{ flex: 1 }}>
                  <AppText variant="body" weight="semibold">
                    {a.emoji} {a.title}
                  </AppText>
                  <AppText variant="caption" tone="accent">
                    {person?.name} · {a.year}
                  </AppText>
                </View>
              </View>
              <AppText variant="label" tone="secondary" style={{ lineHeight: 20 }}>
                {a.story}
              </AppText>
            </Card>
          </Pressable>
        );
      })}
    </StackScreen>
  );
}
