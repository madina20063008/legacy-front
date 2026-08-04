import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Icon, TextField, AppText } from '@/components/ui';
import { MemberForm, type MemberFormValues } from '@/features/familyMembers/MemberForm';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAddRelationship, useCreatePerson, useFamily } from '@/hooks/use-family';
import { lookupUser, type FoundUser } from '@/services/api/users-repo';
import type { RelationType } from '@/types/models';

// Map a free-text relation to a tree edge (display label stays the exact text).
function inferEdge(relation: string): RelationType {
  const r = relation.toLowerCase();
  if (/(father|mother|parent|dad|mom|grand|bob|buv|ota|ona|дед|бабуш|отец|мать|родит)/.test(r)) return 'parent';
  if (/(son|daughter|child|kid|farzand|o.?g.?il|qiz|сын|доч|ребен|внук)/.test(r)) return 'child';
  if (/(wife|husband|spouse|xotin|er|turmush|жен|муж|супруг)/.test(r)) return 'spouse';
  return 'sibling';
}

export default function AddMember() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { selfId } = useFamily();
  const createPerson = useCreatePerson();
  const addRel = useAddRelationship();

  const [manual, setManual] = useState(false);
  const [username, setUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<FoundUser | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [relation, setRelation] = useState('');

  const search = async () => {
    const u = username.trim().replace(/^@/, '');
    if (!u) return;
    setSearching(true);
    setFound(null);
    setNotFound(false);
    try {
      const res = await lookupUser(u);
      if (res) setFound(res);
      else setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const linkAndClose = async (person: { name: string; phone?: string; telegram: string; relation: string }) => {
    const created = await createPerson.mutateAsync({
      name: person.name,
      phone: person.phone,
      telegram: person.telegram,
      relation: person.relation,
    });
    if (person.relation.trim()) {
      const type = inferEdge(person.relation);
      const edge = type === 'parent' ? { fromId: created.id, toId: selfId, type } : { fromId: selfId, toId: created.id, type };
      await addRel.mutateAsync(edge);
    }
    router.back();
  };

  const addFound = async () => {
    if (!found || !relation.trim()) return;
    await linkAndClose({ name: found.name, phone: found.phone ?? undefined, telegram: `@${found.username}`, relation });
  };

  // Manual (non-registered relative) fallback.
  const onManualSubmit = async (v: MemberFormValues) => {
    await linkAndClose({ name: v.name, phone: v.phone, telegram: v.telegram ?? '', relation: v.relation ?? '' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Icon name="back" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="heading" weight="semibold">
          {t('member.addTitle')}
        </AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {manual ? (
          <>
            <Pressable onPress={() => setManual(false)}>
              <AppText variant="label" tone="accent" weight="semibold">
                ← {t('member.findByUsername')}
              </AppText>
            </Pressable>
            <MemberForm mode="add" submitting={createPerson.isPending || addRel.isPending} onSubmit={onManualSubmit} />
          </>
        ) : (
          <>
            <AppText variant="label" tone="secondary" weight="medium">
              {t('member.findByUsername')}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {t('member.addByUsernameHint')}
            </AppText>
            <View style={styles.searchRow}>
              <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill }]}>
                <Icon name="search" size={18} color={colors.textSecondary} />
                <TextInput
                  value={username}
                  onChangeText={(v) => { setUsername(v); setFound(null); setNotFound(false); }}
                  placeholder={t('member.usernamePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={search}
                  style={{ flex: 1, color: colors.text, fontSize: 15 }}
                />
              </View>
              <Button title={t('member.search')} fullWidth={false} loading={searching} onPress={search} />
            </View>

            {notFound && (
              <AppText variant="label" style={{ color: colors.error }}>
                {t('member.notFound')}
              </AppText>
            )}

            {found && (
              <Card tone="sage" style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Avatar name={found.name} photoUrl={found.photoUrl ?? undefined} size={52} glow />
                  <View style={{ flex: 1 }}>
                    <AppText variant="body" weight="semibold">{found.name}</AppText>
                    <AppText variant="caption" tone="accent">@{found.username}</AppText>
                  </View>
                  <Icon name="message" size={20} color={colors.accent} />
                </View>
                <TextField label={t('member.relationToYou')} placeholder={t('member.relationPlaceholder')} value={relation} onChangeText={setRelation} />
                <Button title={t('member.addToFamily')} disabled={!relation.trim()} loading={createPerson.isPending || addRel.isPending} onPress={addFound} />
              </Card>
            )}

            <Pressable onPress={() => setManual(true)} style={{ paddingVertical: spacing.sm, alignItems: 'center' }}>
              <AppText variant="label" tone="secondary">
                {t('member.addManual')}
              </AppText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5 },
});
