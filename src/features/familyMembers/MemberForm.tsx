import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { Button, TextField, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Gender } from '@/types/models';

const schema = z.object({
  name: z.string().min(2),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  relation: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof schema>;

const GENDERS: Gender[] = ['male', 'female', 'other'];

interface Props {
  mode: 'add' | 'edit';
  initial?: Partial<MemberFormValues>;
  submitting?: boolean;
  onSubmit: (values: MemberFormValues) => void;
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[];
  value?: T;
  onChange: (v: T) => void;
  labelFor: (v: T) => string;
}) {
  const { colors, spacing, radius } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              borderWidth: 1.5,
              borderColor: active ? colors.accent : colors.border,
              backgroundColor: active ? colors.surfaceSage : colors.surface,
            }}
          >
            <AppText variant="label" tone={active ? 'accent' : 'secondary'}>
              {labelFor(opt)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MemberForm({ mode, initial, submitting, onSubmit }: Props) {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', ...initial },
  });

  return (
    <View style={{ gap: spacing.md, paddingBottom: spacing.xxl }}>
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
        name="relation"
        render={({ field: { onChange, value } }) => (
          <TextField
            label={t('member.relationToYou')}
            placeholder={t('member.relationPlaceholder')}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {mode === 'add' && (
        <AppText variant="caption" tone="secondary">
          {t('member.relationHint')}
        </AppText>
      )}

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: spacing.xs }}>
            <AppText variant="label" tone="secondary" weight="medium">
              {t('auth.gender')}
            </AppText>
            <Chips options={GENDERS} value={value} onChange={onChange} labelFor={(g) => t(`auth.${g}`)} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, value } }) => (
          <TextField label={t('auth.dob')} placeholder="1990-01-01" value={value} onChangeText={onChange} autoCapitalize="none" />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextField label={t('profile.phone')} keyboardType="phone-pad" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="telegram"
        render={({ field: { onChange, value } }) => (
          <TextField label={t('profile.telegram')} placeholder="@username" value={value} onChangeText={onChange} autoCapitalize="none" />
        )}
      />
      <Controller
        control={control}
        name="profession"
        render={({ field: { onChange, value } }) => (
          <TextField label={t('profile.profession')} value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, value } }) => (
          <TextField label={t('profile.location')} value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, value } }) => (
          <TextField
            label={t('profile.bio')}
            value={value}
            onChangeText={onChange}
            multiline
            style={{ height: 88, textAlignVertical: 'top' }}
          />
        )}
      />

      <Button title={t('common.save')} loading={submitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
