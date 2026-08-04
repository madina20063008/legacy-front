import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Providers } from '@/components/providers';
import '@/i18n';
import { restoreLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

/** Redirects between the auth flow and the app based on session status. */
function useAuthGate() {
  const status = useAuth((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'signedIn' && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (status === 'needsProfile') {
      router.replace('/(auth)/profile-setup');
    } else if (status === 'signedOut' && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [status, segments, router]);
}

function RootNavigator() {
  useAuthGate();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="family/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="family/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="family/edit/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="messages/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="money/transfer" options={{ presentation: 'modal' }} />
      <Stack.Screen name="money/add-card" options={{ presentation: 'modal' }} />
      <Stack.Screen name="money/add-fund" options={{ presentation: 'modal' }} />
      <Stack.Screen name="money/receipt" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="market/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="market/cart" options={{ presentation: 'card' }} />
      <Stack.Screen name="market/checkout" options={{ presentation: 'card' }} />
      <Stack.Screen name="market/orders" options={{ presentation: 'card' }} />
      <Stack.Screen name="market/order-success" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="insights/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="ai/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ai/restore" options={{ presentation: 'card' }} />
      <Stack.Screen name="ai/biography/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="capsule/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="capsule/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="vault/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="vault/add" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Color scheme is read so the app re-renders on light/dark switches.
  useColorScheme();
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    restoreLanguage();
    hydrate().finally(() => SplashScreen.hideAsync());
  }, [hydrate]);

  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
