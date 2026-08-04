import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Screen, TextField, AppText } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ApiError } from '@/services/api/client';
import { useAuth } from '@/store/auth';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { signIn, signUp, googleLogin, googleEnabled } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onGoogleToken = (idToken: string) => {
    setLoading(true);
    googleLogin(idToken)
      .catch(() => setError(t('common.somethingWrong')))
      .finally(() => setLoading(false));
  };

  const isSignup = mode === 'signup';

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('auth.emailInvalid'));
    if (isSignup && password.length < 6) return setError(t('auth.passwordShort'));
    if (!password) return setError(t('auth.passwordShort'));
    setError(undefined);
    setLoading(true);
    try {
      if (isSignup) await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
      // Root auth gate handles navigation from here.
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setError(t('auth.errEmailTaken'));
      else if (e instanceof ApiError && e.status === 401) setError(t('auth.errInvalid'));
      else setError(t('common.somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.xs, marginTop: spacing.xl }}>
          <AppText variant="title">{t(isSignup ? 'auth.signUpTitle' : 'auth.signInTitle')}</AppText>
          <AppText variant="body" tone="secondary">
            {t(isSignup ? 'auth.signUpSubtitle' : 'auth.signInSubtitle')}
          </AppText>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextField
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label={t('auth.password')}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            error={error}
          />
        </View>

        <Button title={t(isSignup ? 'auth.signUp' : 'auth.signIn')} loading={loading} onPress={submit} />

        {googleEnabled && (
          <>
            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <AppText variant="caption" tone="secondary">
                {t('auth.orDivider')}
              </AppText>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>
            <GoogleButton disabled={loading} onToken={onGoogleToken} onError={() => setError(t('common.somethingWrong'))} />
          </>
        )}

        <Pressable onPress={() => { setError(undefined); setMode(isSignup ? 'signin' : 'signup'); }} style={styles.toggle}>
          <AppText variant="label" tone="accent" weight="semibold">
            {t(isSignup ? 'auth.toSignIn' : 'auth.toSignUp')}
          </AppText>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
  toggle: { alignItems: 'center', paddingVertical: 8 },
});
