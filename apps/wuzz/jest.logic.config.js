/**
 * For tests of plain TypeScript logic (no components, no native modules). The React Native preset in
 * jest.config.js cannot start under Jest 29 here (its setup file is ESM), so these run in plain Node with
 * the app's Babel config; anything from react-native or a native lib is mocked in the test itself.
 */
module.exports = {
  testEnvironment: 'node',
  transform: { '\\.[jt]sx?$': 'babel-jest' },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.[jt]s'],
};
