import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, AppText } from '@/components/ui';
import { MemberForm, type MemberFormValues } from '@/features/familyMembers/MemberForm';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily, useUpdatePerson } from '@/hooks/use-family';

export default function EditMember() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { people } = useFamily();
  const update = useUpdatePerson();

  const person = people.find((p) => p.id === id);
  if (!person) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <AppText style={{ padding: spacing.lg }}>{t('profile.notFound')}</AppText>
      </SafeAreaView>
    );
  }

  const onSubmit = async (v: MemberFormValues) => {
    await update.mutateAsync({
      ...person,
      name: v.name,
      relation: v.relation,
      gender: v.gender,
      dateOfBirth: v.dateOfBirth,
      phone: v.phone,
      telegram: v.telegram,
      profession: v.profession,
      location: v.location,
      bio: v.bio,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {t('member.editTitle')}
        </AppText>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <MemberForm
          mode="edit"
          submitting={update.isPending}
          initial={{
            name: person.name,
            relation: person.relation,
            gender: person.gender,
            dateOfBirth: person.dateOfBirth,
            phone: person.phone,
            telegram: person.telegram,
            profession: person.profession,
            location: person.location,
            bio: person.bio,
          }}
          onSubmit={onSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
