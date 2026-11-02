import { theme } from '@components/atoms';
import { memo } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import {
  WAVES_PATH_D,
  WAVES_PATH_STROKE_WIDTH,
} from '../../utils/search';
import type { MenuSearchWavesOverlayProps } from './menu-search-waves-overlay.types';

const styles = StyleSheet.create({
  wavesOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    overflow: 'hidden',
  },
  wavesSvg: {
    marginTop: -WAVES_PATH_STROKE_WIDTH,
    marginLeft: -WAVES_PATH_STROKE_WIDTH * 5,
  },
  sprinkleSvg: {
    marginTop: -70,
    marginLeft: -WAVES_PATH_STROKE_WIDTH * 5,
  },
});

const SPRINKLE_PATHS = (
  <>
    <Path fill={theme.pallate.coffee['03']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M290.062 73.3125C297.999 72.062 306.807 74.6285 315.022 79.666C323.226 84.6967 330.743 92.1375 336.064 100.464C346.695 117.198 348.68 137.507 344.038 155.779C339.399 174.041 328.15 190.217 311.386 200.473L311.384 200.474C294.482 210.852 272.101 215.259 252.551 208.087C242.821 204.499 233.762 198.003 227.094 190.165C220.419 182.32 216.2 173.208 216.007 164.404C215.813 155.607 219.633 146.94 225.429 138.178C231.228 129.411 238.897 120.701 246.278 111.763C253.66 102.824 260.608 93.8399 267.773 86.7363C274.939 79.6326 282.178 74.5637 290.063 73.3135L290.062 73.3125Z" />
    <Path fill={theme.pallate.coffee['03']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M1251.54 97.8447C1256.57 92.7873 1261.56 89.6279 1266.22 90.0352L1266.23 90.0361C1268.53 90.2164 1270.88 91.2836 1273.36 93.0361C1275.84 94.7871 1278.38 97.1682 1281.04 99.8779C1286.33 105.251 1292.13 111.927 1298.7 116.935L1298.71 116.938C1305.31 121.914 1312.74 125.234 1319.76 128.496C1326.83 131.778 1333.46 134.996 1338.74 139.779C1344 144.554 1347.92 150.941 1349.71 157.502C1351.49 164.064 1351.13 170.723 1347.95 176.133L1347.94 176.136C1344.73 181.646 1338.59 186.005 1331.6 190.458C1324.68 194.858 1316.96 199.327 1311.02 205.014C1305.06 210.667 1300.87 217.507 1296.95 223.784C1292.99 230.117 1289.33 235.822 1284.4 239.541C1274.58 246.954 1259.48 246.591 1249.41 239.039L1249.4 239.036C1244.33 235.267 1240.49 229.721 1237.35 223.56C1234.2 217.397 1231.8 210.711 1229.54 204.688C1225.16 193.011 1221.59 184.484 1219.58 175.413L1219.39 174.533C1217.51 165.152 1217.32 155.227 1220.17 145.726L1220.16 145.725C1223.11 136.304 1229.11 127.331 1237.52 115.415C1241.78 109.455 1246.56 102.851 1251.54 97.8447Z" />
    <Path fill={theme.pallate.coffee['04']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M834.6 190.568C854.188 189.036 872.414 190.215 887.151 198.916V198.917C901.81 207.732 913.112 224.178 918.118 240.839C923.138 257.547 921.73 274.077 911.575 283.361C906.429 287.97 898.992 290.867 890.12 292.538C881.257 294.207 871.058 294.636 860.488 294.385C839.314 293.882 816.921 290.668 800.908 289.351H800.909C768.902 286.514 763.034 291.199 731.136 296.615C715.142 299.331 692.535 302.242 672.036 302.268C661.784 302.28 652.099 301.571 644.048 299.771C636.221 298.02 630.083 295.27 626.418 291.291L626.071 290.902C622.489 286.705 621.381 281.059 622.314 274.529C623.25 267.99 626.226 260.656 630.68 253.258C639.588 238.46 654.279 223.621 669.743 214.642L669.747 214.64C685.176 205.581 701.476 202.427 718.888 201.072C727.599 200.394 736.563 200.168 745.837 199.872C755.101 199.576 764.663 199.21 774.521 198.249C784.374 197.289 794.515 195.749 804.618 194.261C814.733 192.771 824.815 191.334 834.6 190.568Z" />
    <Path fill={theme.pallate.coffee['04']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M-18.3486 194.693C-11.7324 189.491 -4.30844 186.424 2.53711 187.09V187.091C9.43402 187.757 15.9992 192.198 22.957 198.808C29.9205 205.422 37.0428 213.963 45.2031 222.678C53.3057 231.384 62.159 239.984 68.7686 248.149C72.0642 252.221 74.7548 256.13 76.4854 259.825C78.2154 263.519 78.951 266.924 78.4473 270.027C77.9187 273.129 76.1198 276.074 73.2998 278.856C70.4802 281.638 66.6897 284.207 62.2891 286.55C53.4873 291.235 42.3962 294.936 32.1787 297.628L32.1748 297.629C21.963 300.369 12.7005 302.047 4.66504 302.195C-3.37235 302.343 -10.1058 300.959 -15.332 297.65L-15.334 297.648C-20.5043 294.393 -24.2992 289.088 -27.2695 282.58C-30.2394 276.073 -32.3462 268.452 -34.1934 260.664L-34.1953 260.658C-37.9923 245.071 -40.5048 229.366 -33.9512 214.498L-33.9521 214.497C-30.6196 207.101 -24.9478 199.882 -18.3486 194.693Z" />
    <Path fill={theme.pallate.coffee['04']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M1370.02 295.24C1379.06 293.205 1390.57 292.703 1401.83 293.151C1413.13 293.6 1424.11 294.944 1433.52 297.81C1442.94 300.677 1450.7 305.039 1455.67 311.464C1460.6 317.839 1462.84 326.382 1463.24 336.019C1463.64 345.648 1462.18 356.278 1459.79 366.729C1455 387.692 1446.47 407.414 1431.06 416.389L1431.06 416.39C1423.3 420.926 1413.79 422.791 1405.1 422.081C1396.39 421.37 1388.67 418.091 1384.35 412.539C1380.02 406.964 1378.97 398.949 1378.26 389.404C1377.57 379.961 1377.21 369.148 1374.02 358.467L1374.02 358.465C1370.84 347.848 1364.82 337.405 1360.08 328.303C1357.69 323.724 1355.63 319.494 1354.35 315.698C1353.07 311.889 1352.63 308.653 1353.33 306.011C1354.02 303.431 1355.88 301.258 1358.76 299.455C1361.65 297.648 1365.5 296.258 1370.02 295.24Z" />
    <Path fill={theme.pallate.coffee['03']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M1063.35 301.095C1073.64 294.676 1084.88 291.816 1093.45 293.452V293.453C1101.88 295.073 1107.88 301.174 1112.68 309.747C1117.49 318.328 1120.98 329.196 1124.49 340.071V340.072C1127.95 350.999 1131.31 361.692 1132.24 371.366C1133.16 381.014 1131.64 389.481 1125.51 396.091C1119.32 402.767 1108.32 407.697 1096.2 409.19C1084.09 410.682 1071.05 408.723 1060.8 401.841L1060.8 401.839L1060.32 401.513C1050.25 394.579 1042.79 382.819 1038.94 369.689C1035.03 356.355 1034.87 341.73 1039.38 329.519C1043.89 317.363 1053.07 307.5 1063.35 301.095Z" />
    <Path fill={theme.pallate.coffee['05']} stroke={theme.pallate.neutral['01']} strokeWidth={5} d="M386.582 287.17C400.917 285.179 416.665 285.111 430.089 291.97L430.092 291.971C443.642 298.844 454.913 312.791 457.356 328.137L457.358 328.144C459.899 343.387 453.739 360.191 443.597 371.814C433.361 383.33 419.27 389.751 403.825 396.871C396.108 400.429 388.219 404.124 380.354 406.626C372.492 409.127 364.738 410.407 357.306 409.192C342.381 406.754 328.515 394.331 325.016 380.041L325.014 380.035L324.854 379.365C323.27 372.431 324.044 365.003 325.915 357.496C327.847 349.743 330.92 342.009 333.68 334.733L333.679 334.732C336.437 327.512 338.869 320.915 341.658 315.126C344.356 309.526 347.36 304.748 351.25 300.97L351.63 300.607C359.895 292.829 372.332 289.063 386.576 287.17H386.582Z" />
  </>
);

export const MenuSearchWavesOverlay = memo(function MenuSearchWavesOverlay(
  props: MenuSearchWavesOverlayProps,
) {
  const {
    wavesSvgWidth,
    wavesSvgHeight,
    sprinkleSvgWidth,
    sprinkleSvgHeight,
    wavesOverlayHeight,
    searchProgress,
    scrollY,
  } = props;

  const wavesOverlayScrollStyle = useAnimatedStyle(() => {
    'worklet';
    const scrollCollapse = -Math.min(
      Math.max(0, scrollY.value),
      wavesOverlayHeight,
    );
    return { transform: [{ translateY: scrollCollapse }] };
  });

  const wavesEnterStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: -wavesSvgHeight * (1 - searchProgress.value) },
      ],
    };
  });

  const sprinkleEnterStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: -sprinkleSvgHeight * (1 - searchProgress.value) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wavesOverlay,
        { height: wavesOverlayHeight },
        wavesOverlayScrollStyle,
      ]}
    >
      <Animated.View style={wavesEnterStyle}>
        <Svg
          width={wavesSvgWidth}
          height={wavesSvgHeight}
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMid meet"
          style={styles.wavesSvg}
        >
          <Path
            fill={theme.pallate.coffee['03']}
            fillOpacity={1}
            strokeWidth={WAVES_PATH_STROKE_WIDTH}
            stroke={theme.pallate.neutral['01']}
            d={WAVES_PATH_D}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={sprinkleEnterStyle}>
        <Svg
          width={sprinkleSvgWidth}
          height={sprinkleSvgHeight}
          viewBox="0 0 1440 492"
          preserveAspectRatio="xMidYMid meet"
          style={styles.sprinkleSvg}
        >
          <G>{SPRINKLE_PATHS}</G>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
});

export type { MenuSearchWavesOverlayProps } from './menu-search-waves-overlay.types';
