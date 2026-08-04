import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, TextInput, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Avatar, Card, Icon, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';
import { isAdult } from '@/utils/relationships';

export default function SkillsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const { people, selfId } = useFamily();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .filter((p) => p.profession && isAdult(p.dateOfBirth))
      .filter((p) => !q || p.profession!.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
      .sort((a, b) => a.profession!.localeCompare(b.profession!));
  }, [people, query]);

  return (
    <StackScreen title={t('insights.skills')} scroll={false}>
      <View style={{ padding: spacing.lg, gap: spacing.md, flex: 1 }}>
        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 10 }]}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('insights.skillsSearch')}
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, color: colors.text, fontSize: 15 }}
          />
        </View>

        {results.length === 0 ? (
          <AppText tone="secondary" style={{ textAlign: 'center', padding: spacing.xl }}>
            {t('insights.noSkills')}
          </AppText>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {results.map((p) => (
              <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Pressable onPress={() => router.push(`/family/${p.id}`)}>
                  <Avatar name={p.name} photoUrl={p.photoUrl} size={44} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" weight="semibold">
                    {p.name}
                  </AppText>
                  <AppText variant="caption" tone="accent">
                    {p.profession}
                  </AppText>
                </View>
                {p.phone && (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${p.phone!.replace(/\s/g, '')}`)}
                    style={{ padding: 8 }}
                    accessibilityLabel={t('insights.call')}
                  >
                    <Icon name="phone" size={20} color={colors.accent} />
                  </Pressable>
                )}
                {p.id !== selfId && p.linkedUserId && (
                  <Pressable
                    onPress={() => router.push({ pathname: '/messages/[id]', params: { id: p.linkedUserId!, name: p.name } })}
                    style={{ padding: 8 }}
                    accessibilityLabel={t('insights.message')}
                  >
                    <Icon name="message" size={20} color={colors.accent} />
                  </Pressable>
                )}
              </Card>
            ))}
          </View>
        )}
      </View>
    </StackScreen>
  );
}
