import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StackScreen } from '@/components/common/stack-screen';
import { Card, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

interface Step {
  genLabel: string;
  location: string;
  names: string[];
}

function genKey(generation: number): string {
  if (generation <= -2) return 'grandparents';
  if (generation === -1) return 'parents';
  if (generation === 0) return 'me';
  return 'children';
}

export default function GenealogyScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { related } = useFamily();

  const steps = useMemo<Step[]>(() => {
    // Group members by generation, pick the most common shared location per generation.
    const gens = [...new Set(related.map((p) => p.generation))].sort((a, b) => a - b);
    const out: Step[] = [];
    for (const g of gens) {
      const members = related.filter((p) => p.generation === g && p.location);
      if (members.length === 0) continue;
      const counts = new Map<string, string[]>();
      for (const m of members) {
        if (!counts.has(m.location!)) counts.set(m.location!, []);
        counts.get(m.location!)!.push(m.name.split(' ')[0]);
      }
      const [location, names] = [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0];
      // Skip consecutive duplicates to read as a migration path.
      if (out.length && out[out.length - 1].location === location) {
        out[out.length - 1].names.push(...names);
      } else {
        out.push({ genLabel: t(`home.generations.${genKey(g)}`), location, names });
      }
    }
    return out;
  }, [related, t]);

  return (
    <StackScreen title={t('insights.genealogyTitle')}>
      <AppText variant="body" tone="secondary" style={{ lineHeight: 22 }}>
        {t('ai.genealogyIntro')}
      </AppText>

      <View style={{ marginTop: spacing.md }}>
        {steps.map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ alignItems: 'center', width: 24 }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent }} />
              {i < steps.length - 1 && <View style={{ flex: 1, width: 2, backgroundColor: colors.border }} />}
            </View>
            <Card style={{ flex: 1, marginBottom: spacing.md, gap: 2 }}>
              <AppText variant="body" weight="semibold">
                {step.location}
              </AppText>
              <AppText variant="caption" tone="accent">
                {step.genLabel}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {step.names.join(', ')}
              </AppText>
            </Card>
          </View>
        ))}
      </View>
    </StackScreen>
  );
}
