import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useDeletePerson, useRelatedPerson } from '@/hooks/use-family';
import { ageFromDob, isAdult } from '@/utils/relationships';

function Row({ label, value }: { label: string; value?: string }) {
  const { colors, spacing } = useAppTheme();
  if (!value) return null;
  return (
    <View style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <AppText variant="caption" tone="secondary" weight="medium">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const person = useRelatedPerson(id);
  const del = useDeletePerson();

  if (!person) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <AppText style={{ padding: spacing.lg }}>{t('profile.notFound')}</AppText>
      </SafeAreaView>
    );
  }

  const age = ageFromDob(person.dateOfBirth);
  const showProfession = isAdult(person.dateOfBirth) && !!person.profession;

  const doDelete = async () => {
    await del.mutateAsync(person.id);
    router.back();
  };

  const confirmDelete = () => {
    // RN-Web's Alert.alert doesn't invoke button callbacks, so use the browser
    // confirm on web and the native dialog everywhere else.
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(t('profile.deleteBody', { name: person.name }))) {
        void doDelete();
      }
      return;
    }
    Alert.alert(t('profile.deleteTitle'), t('profile.deleteBody', { name: person.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.delete'), style: 'destructive', onPress: () => void doDelete() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {person.isSelf ? t('profile.myProfile') : person.relationLabel}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Pressable onPress={() => router.push(`/family/edit/${person.id}`)} hitSlop={10}>
            <Icon name="edit" size={24} color={colors.accent} />
          </Pressable>
          {!person.isSelf && (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Icon name="trash" size={24} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {/* Identity */}
        <View style={styles.identity}>
          <Avatar name={person.name} photoUrl={person.photoUrl} size={112} glow online={person.online} />
          <AppText variant="title" style={{ marginTop: spacing.sm }}>
            {person.name}
          </AppText>
          {!person.isSelf && (
            <AppText variant="label" tone="accent" weight="semibold">
              {person.relationLabel}
            </AppText>
          )}
          {person.status && (
            <AppText variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              {person.status}
            </AppText>
          )}
        </View>

        {/* Contact */}
        <Card tone="sage">
          <AppText variant="label" weight="semibold" style={{ marginBottom: spacing.xs }}>
            {t('profile.contactDetails')}
          </AppText>
          <Row label={t('profile.phone')} value={person.phone} />
          <Row label={t('profile.telegram')} value={person.telegram} />
          <Row label={t('profile.location')} value={person.location} />
        </Card>

        {/* Details */}
        <Card>
          <Row label={t('profile.bio')} value={person.bio} />
          <Row label={t('profile.age')} value={age !== undefined ? t('profile.years', { count: age }) : undefined} />
          {showProfession && <Row label={t('profile.profession')} value={person.profession} />}
          <Row label={t('profile.status')} value={person.status} />
        </Card>

        {/* Actions */}
        <View style={{ gap: spacing.sm }}>
          {!person.isSelf && (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={t('profile.message')}
                  variant="secondary"
                  onPress={() =>
                    person.linkedUserId
                      ? router.push({ pathname: '/messages/[id]', params: { id: person.linkedUserId, name: person.name } })
                      : Alert.alert(t('profile.message'), t('messages.notLinked', { name: person.name.split(' ')[0] }))
                  }
                />
              </View>
              {person.phone ? (
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('profile.call')}
                    variant="secondary"
                    onPress={() => Linking.openURL(`tel:${person.phone!.replace(/\s/g, '')}`)}
                  />
                </View>
              ) : null}
            </View>
          )}
          <Button
            title={t('profile.askAi', { name: person.name.split(' ')[0] })}
            onPress={() => router.push({ pathname: '/ai', params: { about: person.id } })}
          />
          <Button
            title={t('ai.generateBio')}
            variant="ghost"
            onPress={() => router.push(`/ai/biography/${person.id}`)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { alignItems: 'center', gap: 2 },
});
