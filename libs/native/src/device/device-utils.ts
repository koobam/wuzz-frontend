import { Dimensions, NativeModules, PixelRatio, Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const IS_ANDROID = Platform.OS === 'android';
const IS_IOS = Platform.OS === 'ios';

const scale = Dimensions.get('screen').scale;
const { height, width } = Dimensions.get('window');

/**
 * Height of Android's navigation bar in dp, 0 on iOS. It comes from the `NavbarHeight` native module, which an app
 * has to provide itself; an app without it reads 0 instead of failing to start.
 */
export const NAVIGATION_BAR_HEIGHT =
  IS_ANDROID && NativeModules.NavbarHeight ? NativeModules.NavbarHeight.getNavigationBarHeight() / scale : 0;

const deviceUtils = (function () {
  const iPhone15ProHeight = 852,
    iPhone6Height = 667,
    iphoneSEHeight = 568,
    iPhoneXHeight = 812,
    iPhoneXWidth = 375,
    veryNarrowPhoneThreshold = 340;

  const isIOS14 = IS_IOS && parseFloat(Platform.Version as string) >= 14;
  const isAndroid12 = Platform.OS === 'android' && parseFloat(Platform.constants.Release as string) >= 12;

  return {
    dimensions: {
      height: initialWindowMetrics?.frame.height ?? height,
      width,
    },
    hasClipboardProtection: isIOS14 || isAndroid12,
    iPhone15ProHeight,
    iPhone6Height,
    iphoneSEHeight,
    iPhoneXHeight,
    iPhoneXWidth,
    isIOS14,
    isLargePhone: width >= iPhoneXWidth,
    isNarrowPhone: width < iPhoneXWidth,
    isSmallPhone: height <= iPhone6Height,
    isTallPhone: height >= iPhoneXHeight,
    isTinyPhone: height <= iphoneSEHeight,
    isVeryNarrowPhone: width < veryNarrowPhoneThreshold,
  };
})();

export function isUsingButtonNavigation() {
  if (!IS_ANDROID) return false;
  return NAVIGATION_BAR_HEIGHT > 40;
}

export const DEVICE_WIDTH = deviceUtils.dimensions.width;
export const DEVICE_HEIGHT = deviceUtils.dimensions.height;
export const PIXEL_RATIO = PixelRatio.get();
export default deviceUtils;
