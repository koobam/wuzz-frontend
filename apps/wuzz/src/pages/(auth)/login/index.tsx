import React, { memo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller } from 'react-hook-form';
import {
  VStack,
  Text,
  theme,
  Input,
  Button,
  GlassBlur,
  glassSurface,
  HStack,
  Pressable,
} from '@components/atoms';
import { RootStackParamList } from '@navigation/root/root.types';
import { useLoginController } from '@features/(auth)/login/hooks';
import { LoginBanner } from '@features/(bottom)/home/components';
import { ArrowDown2, ArrowLeft2, Global } from 'iconsax-react-native';
import { useTranslation } from 'react-i18next';
// WebP at @2x/@3x of the drawn size (see the register story bubble).
const ANDI = require('../../../../assets/illustrations/andi.webp');
const KOCHENG = require('../../../../assets/illustrations/kocheng.webp');
import { ChangeLanguageModal, CountryCodeModal, CreatePinModal, PinModal, VerificationModal } from '@components/molecules/modals';
import { LanguageFlag } from '@components/atoms/language-flag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Room kept above the form when there is no banner, for the back button. */
const HEADER_SPACER = 56;

/** The form is a card laid over the bottom of the banner: how far up it reaches, and how round its top corners are. */
const SHEET_OVERLAP = 32;
const SHEET_RADIUS = 32;

/** Measurements of the service detail's glass pills (PILL_HEIGHT and the 16 corner in the laundry header). */
const BACK_BUTTON_HEIGHT = 50;
const BACK_BUTTON_RADIUS = 16;

type LoginProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

/** The login screen: it only draws. What it does lives in useLoginController. */
const Login = memo(({ navigation }: LoginProps) => {
  const { t } = useTranslation('login');
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const {
    control,
    errors,
    submit,
    isSending,
    isLoading,
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
    languageFlag,
    languageLabel,
    hasBanner,
    scrollY,
    handleScroll,
    handleClose,
    handleSignUpPress,
    handleLanguagePress,
    handleCountryPress,
    handleSimulateLogin,
  } = useLoginController(navigation);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Animated.ScrollView
          // Without this iOS adds its own safe-area inset and parks the resting offset at a small negative number
          // instead of 0, which the banner would read as over-scroll and sit permanently zoomed.
          contentInsetAdjustmentBehavior="never"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {hasBanner ? (
            <LoginBanner screenWidth={screenWidth} scrollY={scrollY} dotsBottomInset={SHEET_OVERLAP} />
          ) : (
            <View style={{ height: insets.top + HEADER_SPACER }} />
          )}

          {/* The mascot leans in from the right edge, behind the card. */}
          {hasBanner ? (
            <View style={styles.mascot} pointerEvents="none">
              <Image source={ANDI} style={{ width: MASCOT_WIDTH, height: MASCOT_HEIGHT }} resizeMode="contain" />
            </View>
          ) : null}
          <VStack
            gap={theme.spacing.large}
            padding={{ paddingVertical: theme.spacing.large, paddingHorizontal: theme.spacing.large }}
            style={hasBanner ? styles.sheet : undefined}
          >
            <VStack>
              <Text type="h3" weight="bold" color={theme.pallate.neutral['05']}>
                {t('title')}
              </Text>
              <Text type="b2" color={theme.pallate.neutral['04']}>
                {t('subtitle')}
              </Text>
            </VStack>

            <VStack gap={theme.spacing.standard}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="812 3456 7890"
                    leftIcon={
                      <Pressable onPress={handleCountryPress} style={styles.countryButton} disabled={isLoading}>
                        <LanguageFlag flag={country.flag} width={24} />
                        <Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
                          +{country.dial}
                        </Text>
                        <ArrowDown2 size={14} color={theme.pallate.neutral['04']} />
                      </Pressable>
                    }
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message ? t(errors.phone.message as never) : undefined}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    variant="filled"
                    spacing="none"
                    size="md"
                    returnKeyType="send"
                    onSubmitEditing={submit}
                  />
                )}
              />

              {/* The cat peeks over the button's top right corner from behind it (it comes first, so the button is drawn over it). The
                  gap above the button is unchanged: the cat reaches up over the field's bottom edge. */}
              <View>
                <View style={styles.cat} pointerEvents="none">
                  <Image source={KOCHENG} style={{ width: CAT_WIDTH, height: CAT_HEIGHT }} resizeMode="contain" />
                </View>
                <Button
                  variant="primary"
                  size="lg"
                  rounded
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Text type="b1" weight="bold" color={theme.pallate.neutral['01']}>
                    {isSending ? t('sendingCode') : t('sendCode')}
                  </Text>
                </Button>
              </View>

              {__DEV__ && (
                <Button
                  variant="default"
                  size="md"
                  rounded
                  onPress={handleSimulateLogin}
                  disabled={isLoading}
                >
                  <Text type="b2" color={theme.pallate.neutral['05']}>
                    Simulate login
                  </Text>
                </Button>
              )}
            </VStack>

            <HStack self="center" items="baseline" gap={theme.spacing.small}>
              <Text type="b2" color={theme.pallate.neutral['05']}>
                {t('noAccount')}
              </Text>
              <Pressable onPress={handleSignUpPress}>
                <Text
                  type="b2"
                  weight="medium"
                  color={theme.pallate.primary['03']}
                  text={t('register')}
                />
              </Pressable>
            </HStack>
          </VStack>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Over the banner, so they stay where a thumb expects them however far the page is pulled. Frosted glass pills like
          the back and help pills of the service detail (the laundry header): same height, corner, padding, icon and text.
          Back on the left, the language on the right, in one row. */}
      <View
        style={[styles.topRow, { top: insets.top + theme.spacing.standard }]}
        pointerEvents="box-none"
      >
        <Pressable onPress={handleClose} style={styles.glassButton}>
          <GlassBlur />
          <ArrowLeft2 size={18} color={theme.pallate.neutral['05']} />
          <Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
            {t('back', { ns: 'common' })}
          </Text>
        </Pressable>
        <Pressable onPress={handleLanguagePress} style={styles.glassButton}>
          <GlassBlur />
          {languageFlag ? <LanguageFlag flag={languageFlag} width={20} /> : <Global size={18} color={theme.pallate.neutral['05']} />}
          <Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
            {languageLabel}
          </Text>
        </Pressable>
      </View>
      <ChangeLanguageModal ref={languageSheet} />
      <PinModal ref={pinSheet} phone={verificationPhone} onSignedIn={finishSignIn} onForgot={handleForgotPin} />
      <VerificationModal ref={verificationSheet} phone={verificationPhone} onVerified={handleVerified} />
      <CreatePinModal ref={createPinSheet} phone={verificationPhone} onDone={finishSignIn} />
      <CountryCodeModal ref={countrySheet} value={country} onSelect={setCountry} />
    </View>
  );
});

Login.displayName = 'Login';

/** The mascot's width; its height follows the drawing's 375:442 ratio. */
const MASCOT_WIDTH = 130;
const MASCOT_HEIGHT = Math.round((MASCOT_WIDTH * 442) / 375);
/** How far the figure goes past the screen's right edge (the edge hides its feet), and the share of it above the card's top. */
const MASCOT_BLEED = Math.round(MASCOT_WIDTH * 0.2);
const MASCOT_ABOVE_CARD = 0.75;
/** The cat beside it: its width, and its height by the drawing's 275:233 ratio. */
const CAT_WIDTH = 90;
const CAT_HEIGHT = Math.round((CAT_WIDTH * 233) / 275);
/** How much of the cat shows above the send button; the rest of it is behind the button. */
const CAT_PEEK = 58;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.pallate.neutral['01'],
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Behind the card (the card has zIndex 1), in the right corner and pushed past the screen's right edge. The card
  // cuts it from the top edge down, and the screen's edge cuts what goes past it. It takes no room in the page.
  mascot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: -MASCOT_BLEED,
    height: MASCOT_HEIGHT,
    marginBottom: -MASCOT_HEIGHT,
    zIndex: 0,
    top: -(SHEET_OVERLAP + MASCOT_HEIGHT * MASCOT_ABOVE_CARD),
  },
  // The cat, in the button's right corner: CAT_PEEK of it above the button, the rest behind it. It takes no room of its own.
  cat: {
    position: 'absolute',
    right: 0,
    top: -CAT_PEEK,
    width: CAT_WIDTH,
    height: CAT_HEIGHT,
  },
  // Over the banner's bottom edge, with round top corners, on the page's own colour.
  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingTop: theme.spacing.medium,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderCurve: 'continuous',
    // A thin edge, as on the sheets: it keeps the card's outline clear against the banner and the mascot behind it.
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.pallate.neutral['03'],
    zIndex: 1,
    backgroundColor: theme.pallate.neutral['01'],
  },
  // The country button inside the phone field: the flag, the calling code and a chevron.
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  // The row of glass buttons over the banner.
  topRow: {
    position: 'absolute',
    left: theme.spacing.large,
    right: theme.spacing.large,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Frosted glass over the banner: the shared surface with the blur as its first child, like the home header's buttons. No shadow.
  glassButton: {
    ...glassSurface,
    flexDirection: 'row',
    borderRadius: BACK_BUTTON_RADIUS,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    height: BACK_BUTTON_HEIGHT,
    paddingHorizontal: theme.spacing.medium,
    gap: theme.spacing.tiny,
  },
});

export default Login;
