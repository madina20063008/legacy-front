import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

/**
 * Bottom tabs. The Family Tree is the Home tab (leftmost, tree mark). Heights
 * account for the device's bottom safe-area inset so labels never clip.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const barHeight = 58 + insets.bottom;

  const tab = (name: IconName, focused: boolean) => (
    <Icon name={name} color={focused ? colors.accent : colors.textSecondary} size={24} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: barHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 2 : 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarItemStyle: { paddingHorizontal: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: ({ focused }) => tab('tree', focused) }}
      />
      <Tabs.Screen
        name="money"
        options={{ title: t('tabs.money'), tabBarIcon: ({ focused }) => tab('wallet', focused) }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.notifications'),
          tabBarIcon: ({ focused }) => tab('bell', focused),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ focused }) => tab('message', focused),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{ title: t('tabs.market'), tabBarIcon: ({ focused }) => tab('cart', focused) }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused }) => tab('settings', focused),
        }}
      />
    </Tabs>
  );
}
