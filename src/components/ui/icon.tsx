import Svg, { Circle, Path } from 'react-native-svg';

import { useAppTheme } from '@/hooks/use-app-theme';

export type IconName =
  | 'tree'
  | 'wallet'
  | 'bell'
  | 'message'
  | 'cart'
  | 'settings'
  | 'sparkle'
  | 'profile'
  | 'plus'
  | 'chevronRight'
  | 'phone'
  | 'edit'
  | 'send'
  | 'mic'
  | 'search'
  | 'trash'
  | 'grid'
  | 'back';

// 24×24 line-icon paths. Stroked, rounded — matches the warm, organic look.
const PATHS: Record<IconName, string> = {
  tree: 'M12 3c-2.5 0-4 1.8-4 4 0 1.5.8 2.6 1.8 3.3M12 3c2.5 0 4 1.8 4 4 0 1.5-.8 2.6-1.8 3.3M12 3v18M8 7c-2 0-3.2 1.4-3.2 3.2 0 1.7 1.3 3 3 3.1M16 7c2 0 3.2 1.4 3.2 3.2 0 1.7-1.3 3-3 3.1M12 21c-1.6 0-2.8-.5-3.6-1.3M12 21c1.6 0 2.8-.5 3.6-1.3',
  wallet: 'M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H5a2 2 0 0 0 0 4h14v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm13 3.5h.01',
  bell: 'M6 9a6 6 0 0 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Zm3.5 9a2.5 2.5 0 0 0 5 0',
  message: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20 8H6M9 20h.01M17 20h.01',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.2-1.3L15 2H9l-.3 2.1a8 8 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.4 2.4-1c.7.5 1.4 1 2.2 1.3L9 22h6l.3-2.1c.8-.3 1.5-.8 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z',
  sparkle:
    'M12 3l1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3ZM19 14l.9 2.1 2.1.9-2.1.9L19 20l-.9-2.1-2.1-.9 2.1-.9L19 14Z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  plus: 'M12 5v14M5 12h14',
  chevronRight: 'M9 6l6 6-6 6',
  phone:
    'M6 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z',
  edit: 'M4 20h4L18 10l-4-4L4 16v4ZM14 6l4 4',
  send: 'M4 12l16-8-6 16-3-6-7-2Z',
  mic: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12l4 4',
  grid: 'M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5ZM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4Z',
  trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13',
  back: 'M15 6l-6 6 6 6',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

export function Icon({ name, size = 24, color, strokeWidth = 1.8, filled }: IconProps) {
  const { colors } = useAppTheme();
  const stroke = color ?? colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'profile' && filled && <Circle cx={12} cy={8} r={4} fill={stroke} />}
      <Path
        d={PATHS[name]}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled && name === 'sparkle' ? stroke : 'none'}
      />
    </Svg>
  );
}
