import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './text';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: number;
  online?: boolean;
  /** Gold glow ring — used for the selected node and premium moments. */
  glow?: boolean;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Circular avatar node with initials fallback, online dot, and optional glow. */
export function Avatar({ name, photoUrl, size = 56, online, glow }: AvatarProps) {
  const { colors, shadows } = useAppTheme();
  const dot = Math.max(10, size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.accent,
            backgroundColor: colors.surfaceSage,
          },
          glow && shadows.glow,
        ]}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            contentFit="cover"
          />
        ) : (
          <AppText weight="semibold" style={{ fontSize: size * 0.36, color: colors.primary }}>
            {initials(name)}
          </AppText>
        )}
      </View>
      {online && (
        <View
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: colors.online,
              borderColor: colors.surface,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
  dot: { position: 'absolute', bottom: 0, right: 0, borderWidth: 2 },
});
