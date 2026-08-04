import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, AppText } from '@/components/ui';
import { NODE } from '@/features/familyTree/layout';
import type { RelatedPerson } from '@/types/models';

interface PersonNodeProps {
  person: RelatedPerson;
  onPress: (id: string) => void;
}

/** A single avatar node in the tree: photo/initials, name, and relation label. */
export function PersonNode({ person, onPress }: PersonNodeProps) {
  return (
    <Pressable
      onPress={() => onPress(person.id)}
      style={styles.node}
      accessibilityRole="button"
      accessibilityLabel={`${person.name}, ${person.relationLabel}`}
    >
      <Avatar
        name={person.name}
        photoUrl={person.photoUrl}
        size={NODE}
        online={person.online}
        glow={person.isSelf}
      />
      <View style={styles.labels}>
        <AppText variant="caption" weight="semibold" numberOfLines={1} style={styles.name}>
          {person.name.split(' ')[0]}
        </AppText>
        <AppText variant="caption" tone="accent" numberOfLines={1}>
          {person.relationLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  node: { width: 96, alignItems: 'center', gap: 4 },
  labels: { alignItems: 'center' },
  name: { textAlign: 'center' },
});
