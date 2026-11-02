# Shared packages

Everything here is consumed as source by the apps (no build step). Import from the entry point you need, so an app
only loads what it uses.

| Package | For | What is in it |
|---|---|---|
| `@wuzz/native` | React Native apps (wuzz, station) | See below |
| `@wuzz/api` | React Native apps | `request` with token refresh, `apiUrl`, API error types |
| `@wuzz/web-ui` | Browser apps (backoffice, POS) | Page frame, tables, selects, form fields |

## `@wuzz/native`

| Import | Gives you |
|---|---|
| `@wuzz/native/components` | Layout primitives: `Box`, `Flex`, `HStack`, `VStack`, `ZStack`, `Divider`, responsive helpers, `breakpoints` |
| `@wuzz/native/device` | `deviceUtils`, `DEVICE_WIDTH`, `DEVICE_HEIGHT`, `PIXEL_RATIO`, `NAVIGATION_BAR_HEIGHT` |
| `@wuzz/native/query` | The shared `queryClient` and the MMKV `queryPersister` |
| `@wuzz/native/sentry` | `initSentry()` (does nothing without `SENTRY_DSN`) and `wrap` |
| `@wuzz/native/storage` | The session MMKV instance and the token keys the refresh flow uses |

`@wuzz/native` itself re-exports all of them; prefer the entry point of what you need.

An app that imports these needs the native modules they use linked: `react-native-reanimated` and
`react-native-worklets` (components), `react-native-mmkv` (storage, query), `react-native-config` and
`@sentry/react-native` (sentry), `react-native-safe-area-context` (device). Add them to the app's `package.json`,
run `pod install`, and keep `react-native-worklets/plugin` in its `babel.config.js`.

## Native modules (`packages/`)

`wuzz-shimmer` and `wuzz-nitro-text` are Nitro modules with their own iOS and Android code; keep them out of `libs/`.

## Rules

- A shared package declares every module it imports as a `peerDependency`; the apps provide them.
- Code that only one app uses stays in that app. Move it here when a second app needs it.
- Every package type-checks on its own: `pnpm --filter @wuzz/native typecheck`.
