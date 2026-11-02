import type * as KeychainModule from 'react-native-keychain';

type Keychain = typeof KeychainModule;

/**
 * The keychain library reads its native module as soon as it is imported, and throws when the app binary was built without
 * it (a build from before it was added). So it is loaded on first use, inside a try: such a build then simply has no Face ID
 * shortcut, instead of failing to start at all.
 */
let loaded: Keychain | null | undefined;
const keychain = (): Keychain | null => {
  if (loaded === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      loaded = require('react-native-keychain') as Keychain;
    } catch {
      loaded = null;
    }
  }
  return loaded;
};

/**
 * Face ID (or Touch ID) as a shortcut for the PIN. The PIN itself is kept in the device's keychain, readable only after the
 * face matches, and only on this device. Signing in then sends that PIN to the server like a typed one, so the server needs
 * nothing new. It is per phone number, so two accounts on one device do not share it.
 */
const service = (phone: string) => `wuzz.pin.${phone}`;

/** The kind of biometry this device has (Face ID, Touch ID...), or null when it has none set up. */
export const getBiometryType = async (): Promise<KeychainModule.BIOMETRY_TYPE | null> => {
  try {
    return (await keychain()?.getSupportedBiometryType()) ?? null;
  } catch {
    return null;
  }
};

/** Keeps the PIN behind the device's biometry. Throws nothing: a device without it simply gets no shortcut. */
export const saveBiometricPin = async (phone: string, pin: string): Promise<boolean> => {
  if (!(await getBiometryType())) return false;
  try {
    const lib = keychain();
    if (!lib) return false;
    const saved = await lib.setGenericPassword(phone, pin, {
      service: service(phone),
      accessControl: lib.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: lib.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    return !!saved;
  } catch {
    return false;
  }
};

/** Whether a PIN is kept for this number, without asking for the face. */
export const hasBiometricPin = async (phone: string): Promise<boolean> => {
  if (!(await getBiometryType())) return false;
  try {
    const services = (await keychain()?.getAllGenericPasswordServices()) ?? [];
    return services.includes(service(phone));
  } catch {
    return false;
  }
};

/** Asks for the face and returns the kept PIN, or null when it is declined or there is none. */
export const readBiometricPin = async (phone: string, prompt: string): Promise<string | null> => {
  try {
    const credentials = await keychain()?.getGenericPassword({
      service: service(phone),
      authenticationPrompt: { title: prompt },
    });
    return credentials ? credentials.password : null;
  } catch {
    return null;
  }
};

/** Forgets the kept PIN, when the PIN was changed or no longer works. */
export const clearBiometricPin = async (phone: string): Promise<boolean> => {
  try {
    return (await keychain()?.resetGenericPassword({ service: service(phone) })) ?? false;
  } catch {
    return false;
  }
};
