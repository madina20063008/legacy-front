import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { config } from '@/services/api/config';

/**
 * Google sign-in button. Rendered ONLY when Google is configured, because
 * `useIdTokenAuthRequest` throws if no platform client id is provided — so the
 * hook must not run in the unconfigured case.
 */
export function GoogleButton({
  disabled,
  onToken,
  onError,
}: {
  disabled?: boolean;
  onToken: (googleIdToken: string) => void;
  onError?: () => void;
}) {
  const { t } = useTranslation();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: config.google.webClientId || undefined,
    iosClientId: config.google.iosClientId || undefined,
    androidClientId: config.google.androidClientId || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      onToken(response.params.id_token);
    } else if (response?.type === 'error') {
      onError?.();
    }
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Button
      title={t('auth.google')}
      variant="secondary"
      disabled={!request || disabled}
      onPress={() => promptAsync()}
    />
  );
}
