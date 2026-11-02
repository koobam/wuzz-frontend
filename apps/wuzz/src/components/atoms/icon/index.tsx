import React, { memo } from 'react';
import IcoMoon, { IconProps as IcoMoonProps } from 'react-icomoon';
import { FasterImageView } from '@candlefinance/faster-image';
import { Svg, Path } from 'react-native-svg';
import icoMoonConfig from '@icons/selection.json';
import { Image, StyleProp, ViewStyle, ImageStyle } from 'react-native';

interface IconProps extends Omit<IcoMoonProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

/**
 * The multi-colour service icons, pre-rendered to WebP at @2x/@3x (from public/icons/selection.json, 64pt).
 * Every path in them has its own fill, so `color` never applied: a bitmap draws them the same for the cost of one image
 * instead of a tree of up to 67 SVG paths. An icon not listed here still draws from the IcoMoon set.
 */
const WEBP_ICONS: Record<string, number> = {
  bag: require('../../../../public/icons/webp/bag.webp'),
  bed: require('../../../../public/icons/webp/bed.webp'),
  dry: require('../../../../public/icons/webp/dry.webp'),
  fold: require('../../../../public/icons/webp/fold.webp'),
  iron: require('../../../../public/icons/webp/iron.webp'),
  kiloan: require('../../../../public/icons/webp/kiloan.webp'),
  wash: require('../../../../public/icons/webp/wash.webp'),
};

export const Icon = memo(({ style, ...props }: IconProps) => {
  const picture = WEBP_ICONS[props.icon];
  if (picture != null) {
    const size = props.size ?? 24;
    return (
      <Image
        source={picture}
        style={[{ width: size as number, height: size as number }, style as StyleProp<ImageStyle>]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <IcoMoon
      native
      style={style as any}
      SvgComponent={Svg}
      PathComponent={Path}
      iconSet={icoMoonConfig}
      {...props}
    />
  );
});

Icon.displayName = 'Icon';

type ServiceIconProps = {
  /** The service's picture from the back office, when it has one. */
  uri?: string;
  /** The named icon, drawn when there is no picture. */
  icon: string;
  size: number;
  color?: string;
};

/**
 * A service's icon: the picture uploaded for it in the back office when there is one (cached by FasterImage), else the named icon
 * from the app's own set.
 */
export const ServiceIcon = memo(({ uri, icon, size, color }: ServiceIconProps) =>
  uri ? (
    <FasterImageView
      source={{ url: uri, resizeMode: 'contain', transitionDuration: 0.15 }}
      style={{ width: size, height: size }}
    />
  ) : (
    <Icon icon={icon} size={size} color={color} />
  ),
);

ServiceIcon.displayName = 'ServiceIcon';
export default Icon;
