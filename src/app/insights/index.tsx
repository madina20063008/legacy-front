import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, Icon, type IconName, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

interface HubItem {
  key: string;
  icon: IconName;
  emoji: string;
  href: Href;
}

const ITEMS: HubItem[] = [
  { key: 'timeline', icon: 'tree', emoji: '📜', href: '/insights/timeline' },
  { key: 'genealogy', icon: 'tree', emoji: '🧬', href: '/insights/genealogy' },
  { key: 'map', icon: 'profile', emoji: '🗺️', href: '/insights/map' },
  { key: 'statistics', icon: 'grid', emoji: '📊', href: '/insights/statistics' },
  { key: 'achievements', icon: 'sparkle', emoji: '🏆', href: '/insights/achievements' },
  { key: 'skills', icon: 'search', emoji: '🛠️', href: '/insights/skills' },
  { key: 'business', icon: 'wallet', emoji: '🏢', href: '/insights/business' },
  { key: 'restore', icon: 'sparkle', emoji: '🖼️', href: '/ai/restore' },
  { key: 'capsule', icon: 'sparkle', emoji: '⏳', href: '/capsule' },
  { key: 'vault', icon: 'wallet', emoji: '🔐', href: '/vault' },
];

export default function InsightsHub() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();

  return (
    <StackScreen title={t('insights.title')}>
      <View style={{ gap: spacing.md }}>
        {ITEMS.map((item) => (
          <Pressable key={item.key} onPress={() => router.push(item.href)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceSage,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText style={{ fontSize: 24 }}>{item.emoji}</AppText>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="body" weight="semibold">
                  {t(`insights.${item.key}`)}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {t(`insights.${item.key}Sub`)}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={colors.textSecondary} />
            </Card>
          </Pressable>
        ))}
      </View>
    </StackScreen>
  );
}
