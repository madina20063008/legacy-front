import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, AppText } from '@/components/ui';
import { FamilyTreeCanvas } from '@/features/familyTree/FamilyTreeCanvas';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFamily } from '@/hooks/use-family';

export default function FamilyTreeHome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { related, relationships, selfId, isLoading, isError, refetch } = useFamily();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.primary }]} edges={['top']}>
      {/* Header: profile (left) + title + AI sparkle (right) */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.headerCluster}>
          <Pressable
            onPress={() => router.push(`/family/${selfId}`)}
            hitSlop={10}
            accessibilityLabel={t('home.profile')}
          >
            <Icon name="profile" size={26} color={colors.accent} filled />
          </Pressable>
          <Pressable
            onPress={() => router.push('/insights')}
            hitSlop={10}
            accessibilityLabel={t('insights.title')}
          >
            <Icon name="grid" size={24} color={colors.accent} />
          </Pressable>
        </View>

        <View style={styles.titleWrap}>
          <AppText variant="heading" tone="onPrimary" weight="semibold">
            {t('home.familyTree')}
          </AppText>
          {related.length > 1 && (
            <AppText variant="caption" tone="accent">
              {t('home.membersCount', { count: related.length })}
            </AppText>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/ai')}
          hitSlop={10}
          accessibilityLabel={t('home.aiAssistant')}
        >
          <Icon name="sparkle" size={26} color={colors.accent} filled />
        </Pressable>
      </View>

      {/* Tree */}
      <View style={[styles.body, { backgroundColor: colors.surfaceSage }]}>
        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.center} />
        ) : isError ? (
          <Pressable onPress={refetch} style={styles.center}>
            <AppText tone="secondary">{t('common.somethingWrong')}</AppText>
            <AppText tone="accent" weight="semibold">
              {t('common.retry')}
            </AppText>
          </Pressable>
        ) : related.length <= 1 ? (
          <View style={styles.center}>
            <AppText style={{ fontSize: 40 }}>🌳</AppText>
            <AppText tone="secondary" style={{ textAlign: 'center', maxWidth: 260, marginTop: 8 }}>
              {t('home.emptyTree')}
            </AppText>
          </View>
        ) : (
          <FamilyTreeCanvas
            people={related}
            relationships={relationships}
            onSelect={(id) => router.push(`/family/${id}`)}
          />
        )}

        {/* Add family member */}
        <Pressable
          onPress={() => router.push('/family/add')}
          style={[styles.fab, { backgroundColor: colors.accent }]}
          accessibilityLabel={t('member.addTitle')}
        >
          <Icon name="plus" size={28} color={colors.textOnAccent} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCluster: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  titleWrap: { alignItems: 'center' },
  body: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
