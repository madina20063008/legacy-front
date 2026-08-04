import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { Button, Screen, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/store/auth';
import type { Gender } from '@/types/models';

const schema = z.object({
  name: z.string().min(2),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  profession: z.string().optional(),
  bio: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const GENDERS: Gender[] = ['male', 'female', 'other'];

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useAppTheme();
  const completeProfile = useAuth((s) => s.completeProfile);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } });

  const onSubmit = handleSubmit(async (values) => {
    await completeProfile(values);
    // Root auth gate redirects into the app once the profile is complete.
  });

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">{t('auth.profileTitle')}</AppText>
          <AppText variant="body" tone="secondary">
            {t('auth.profileSubtitle')}
          </AppText>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={t('auth.name')}
              value={value}
              onChangeText={onChange}
              error={errors.name && t('validation.nameShort')}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={{ gap: spacing.xs }}>
              <AppText variant="label" tone="secondary" weight="medium">
                {t('auth.gender')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {GENDERS.map((g) => {
                  const active = value === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => onChange(g)}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.md,
                        alignItems: 'center',
                        borderRadius: radius.md,
                        borderWidth: 1.5,
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? colors.surfaceSage : colors.surface,
                      }}
                    >
                      <AppText variant="label" tone={active ? 'accent' : 'secondary'}>
                        {t(`auth.${g}`)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={t('auth.dob')}
              placeholder="1996-07-14"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={t('profile.phone')}
              placeholder="+998 90 123 45 67"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="telegram"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={t('auth.telegram')}
              placeholder="@username"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="profession"
          render={({ field: { onChange, value } }) => (
            <TextField label={t('auth.profession')} value={value} onChangeText={onChange} />
          )}
        />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, value } }) => (
            <TextField
              label={t('auth.bio')}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              style={{ height: 88, textAlignVertical: 'top' }}
            />
          )}
        />

        <Button title={t('auth.finish')} loading={isSubmitting} onPress={onSubmit} />
      </View>
    </Screen>
  );
}
