import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { AppText } from '@/components/ui';
import { TIMELINE } from '@/features/insights/data';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TimelineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const events = [...TIMELINE].sort((a, b) => a.year - b.year);

  return (
    <StackScreen title={t('insights.timeline')}>
      <View>
        {events.map((ev, i) => (
          <Pressable
            key={ev.id}
            disabled={!ev.personId}
            onPress={() => ev.personId && router.push(`/family/${ev.personId}`)}
            style={{ flexDirection: 'row', gap: spacing.md }}
          >
            {/* Year + spine */}
            <View style={{ alignItems: 'center', width: 56 }}>
              <AppText variant="label" tone="accent" weight="bold">
                {ev.year}
              </AppText>
              <View style={{ flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 }} />
            </View>
            {/* Node + card */}
            <View style={{ flex: 1, paddingBottom: i === events.length - 1 ? 0 : spacing.lg }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <AppText style={{ fontSize: 22 }}>{ev.emoji}</AppText>
                <AppText variant="body" style={{ flex: 1 }}>
                  {ev.title}
                </AppText>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </StackScreen>
  );
}
