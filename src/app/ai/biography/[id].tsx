import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Avatar, Button, Card, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily, useRelatedPerson } from '@/hooks/use-family';
import { generateBiography } from '@/services/ai/biography';

export default function BiographyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const person = useRelatedPerson(id);
  const { people, graph, selfId } = useFamily();

  const [bio, setBio] = useState<string>();
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!person || !graph) return;
    setLoading(true);
    try {
      const text = await generateBiography(person, { people, graph, selfId }, t);
      setBio(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (person && graph && !bio && !loading) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, graph]);

  return (
    <StackScreen title={t('ai.biography')}>
      {person && (
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Avatar name={person.name} photoUrl={person.photoUrl} size={88} glow />
          <AppText variant="heading" weight="semibold">
            {person.name}
          </AppText>
          <AppText variant="label" tone="accent">
            {person.relationLabel}
          </AppText>
        </View>
      )}

      <Card style={{ minHeight: 120, justifyContent: 'center' }}>
        {loading ? (
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <ActivityIndicator />
            <AppText tone="secondary">{t('ai.bioGenerating')}</AppText>
          </View>
        ) : (
          <AppText variant="body" style={{ lineHeight: 24 }}>
            {bio}
          </AppText>
        )}
      </Card>

      <Button title={t('ai.generateBio')} variant="secondary" loading={loading} onPress={run} />
    </StackScreen>
  );
}
