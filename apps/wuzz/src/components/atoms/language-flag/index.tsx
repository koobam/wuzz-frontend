import { memo } from 'react';
import Image from '@components/atoms/image';

/**
 * Drawn like the back office's language switch: a 4:3 flag with a small corner and no border. 16 wide there; the language
 * sheet draws it larger.
 */
export const LanguageFlag = memo(({ flag, width = 16 }: { flag: string; width?: number }) => (
  <Image
    uri={`https://flagcdn.com/80x60/${flag}.png`}
    resizeMode="cover"
    style={{ width, height: (width * 3) / 4, borderRadius: width >= 24 ? 4 : 2 }}
  />
));
LanguageFlag.displayName = 'LanguageFlag';
