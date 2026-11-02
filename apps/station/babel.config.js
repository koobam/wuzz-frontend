module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['react-native-worklets/plugin'],
    [
      'module-resolver',
      {
        alias: {
          '@core': './src/core',
          '@features': './src/features',
          '@pages': './src/pages',
          '@navigation': './src/navigation',
          '@services': './src/services',
        },
      },
    ],
  ],
};
