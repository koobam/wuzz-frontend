import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { devLogin } from '@api/auth/dev-login';
import { getMeInformation } from '@api/auth/user';
import {
  ACCESS_TOKEN_STORAGE,
  REFRESH_TOKEN_STORAGE,
  VERIFICATION_COUNTDOWN_STORAGE,
  storage,
} from '@core/http/storage';
import { useAuthAction } from '@hooks/utils/useAuth';
import { useFetchLoginBanners } from '@hooks/apis/banners';
import { useLoginMutation } from '@services/mutations';
import { useSelectedOutlet } from '@services/contexts';
import { languages } from '@services/index';
import { DEFAULT_COUNTRY, type Country } from '@services/consts';
import { RootStackParamList } from '@navigation/root/root.types';
import { ROOT_ROUTES } from '@navigation/root/_routes';
import type { VerifyOtpDataResponse } from '@core/api/auth/verify-otp.types';
import { loginSchema, LoginFormData, toInternationalPhone } from '../schemas';

/** The local demo customer (scripts/seed-member-local.sql in wuzz-backend). */
const DEV_LOGIN_PHONE = '6281299900001';

/** How long the code screen makes the customer wait before asking for another code. */
const RESEND_AFTER_MS = 60_000;

export type LoginNavigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Everything the login screen does, so the page itself only draws: the phone form and its submit, the country and language
 * sheets, the banner's scroll offset, and the buttons' handlers. Give it the screen's `navigation`.
 */
export const useLoginController = (navigation: LoginNavigation) => {
  const { setUser } = useAuthAction();
  const { i18n, t } = useTranslation('login');
  const loginMutation = useLoginMutation();
  const [isSimulating, setIsSimulating] = useState(false);

  // The language sheet, and the language in use: its flag and its name (English, Bahasa Indonesia), from the same list as
  // the sheet's.
  const languageSheet = useRef<BottomSheetModal>(null);
  const language = languages.find(item => item.value === i18n.language);

  // The country whose calling code the number starts with (+62, +1, ...), chosen in its own sheet.
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const countrySheet = useRef<BottomSheetModal>(null);

  // The code sheet, opened once the code is sent, and the number it was sent to.
  const verificationSheet = useRef<BottomSheetModal>(null);
  const [verificationPhone, setVerificationPhone] = useState<string>();

  // The PIN sheet, for a customer who has a PIN, and the sheet that makes one after a code signed them in. `forgotPin` marks
  // a sign-in that came from "Lupa PIN?": it ends by making a new PIN.
  const pinSheet = useRef<BottomSheetModal>(null);
  const createPinSheet = useRef<BottomSheetModal>(null);
  const forgotPin = useRef(false);

  // The page scroll offset, which stretches the banner when the page is pulled down.
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // The login carousel's own list (one request, the cache is shared with the carousel), only to know whether there is a
  // banner to put at the top: with none, the form starts lower and the back button still has room.
  const { selectedOutlet } = useSelectedOutlet();
  const banners = useFetchLoginBanners({ outlet_id: selectedOutlet?.id ?? undefined });
  const hasBanner = banners.isPending || (banners.data?.length ?? 0) > 0;

  const resolver = useMemo(() => zodResolver(loginSchema), []);
  const form = useForm<LoginFormData>({
    resolver,
    defaultValues: { phone: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSignUpPress = useCallback(() => {
    // Replaces this screen, so going back from the register screen lands on Home, not on a login the person just left.
    navigation.replace('register');
  }, [navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLanguagePress = useCallback(() => {
    languageSheet.current?.present();
  }, []);

  const handleCountryPress = useCallback(() => {
    countrySheet.current?.present();
  }, []);

  // On to the app: a sign-in is over, whichever way it went.
  const finishSignIn = useCallback(() => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: ROOT_ROUTES.BOTTOM }] }));
  }, [navigation]);

  // The server says how this sign-in goes on: the PIN (no SMS was sent), or the code it just sent.
  const sendLogin = useCallback(
    (phone: string, forceOtp: boolean) => {
      forgotPin.current = forceOtp;
      loginMutation.mutate(
        { phone, force_otp: forceOtp || undefined },
        {
          onSuccess: response => {
            Keyboard.dismiss();
            setVerificationPhone(phone);
            if (response.data?.method === 'pin') {
              pinSheet.current?.present();
              return;
            }
            storage.set(VERIFICATION_COUNTDOWN_STORAGE, Date.now() + RESEND_AFTER_MS);
            Toast.show({
              type: 'success',
              text1: t('verification.sentTitle'),
              text2: t('verification.sentDescription', { phone }),
            });
            verificationSheet.current?.present();
          },
        },
      );
    },
    [loginMutation, t],
  );

  const handleSubmit = useCallback(
    (data: LoginFormData) => sendLogin(toInternationalPhone(country.dial, data.phone), false),
    [country.dial, sendLogin],
  );

  const handleForgotPin = useCallback(() => {
    if (verificationPhone) sendLogin(verificationPhone, true);
  }, [verificationPhone, sendLogin]);

  // A code was accepted: a customer with no PIN (or one who forgot it) makes one before going on.
  const handleVerified = useCallback(
    (data: VerifyOtpDataResponse) => {
      if (!data.user.has_pin || forgotPin.current) {
        createPinSheet.current?.present();
        return;
      }
      finishSignIn();
    },
    [finishSignIn],
  );

  const submit = useCallback(() => {
    form.handleSubmit(handleSubmit)();
  }, [form, handleSubmit]);

  // Signs in as the seeded local demo customer through the backend's development-only endpoint, so the app holds a real
  // session (tokens included) and every authenticated screen loads real data.
  const handleSimulateLogin = useCallback(async () => {
    setIsSimulating(true);
    try {
      const login = await devLogin(DEV_LOGIN_PHONE);
      if (!login.success || !login.data) {
        throw login;
      }
      storage.set(ACCESS_TOKEN_STORAGE, login.data.access_token);
      storage.set(REFRESH_TOKEN_STORAGE, login.data.refresh_token);

      const me = await getMeInformation();
      if (!me.success || !me.data) {
        throw me;
      }
      setUser(me.data);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: ROOT_ROUTES.BOTTOM }],
        }),
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Simulate login gagal',
        text2:
          (error as { message?: string } | undefined)?.message ??
          'Pastikan backend lokal berjalan.',
      });
    } finally {
      setIsSimulating(false);
    }
  }, [setUser, navigation]);

  return {
    // The phone form.
    control: form.control,
    errors: form.formState.errors,
    submit,
    isSending: loginMutation.isPending,
    isLoading: loginMutation.isPending || isSimulating,
    // The country and language sheets and what their buttons show.
    country,
    setCountry,
    countrySheet,
    languageSheet,
    verificationSheet,
    verificationPhone,
    pinSheet,
    createPinSheet,
    handleVerified,
    handleForgotPin,
    finishSignIn,
    languageFlag: language?.flag,
    languageLabel: language?.label ?? i18n.language.toUpperCase(),
    // The banner at the top.
    hasBanner,
    scrollY,
    handleScroll,
    // The buttons.
    handleClose,
    handleSignUpPress,
    handleLanguagePress,
    handleCountryPress,
    handleSimulateLogin,
  };
};
