import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { withTiming } from 'react-native-reanimated';
import { KeyboardAvoidingView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
	VStack,
	Text,
	theme,
	Button,
	HStack,
	Pressable,
	type DateInputRef,
} from '@components/atoms';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@navigation/root/root.types';
import { IconChevronLeft, IconChevronRight } from 'tabler-icons-react-native';
import {
	useRegisterForm,
	useStepNavigation,
} from '@features/(auth)/register/hooks';
import { PaginatorDot, StepForm, StoryPanel } from '@features/(auth)/register/components';
import { getRegisterConfig } from '@features/(auth)/register/config';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

interface Step {
	id: string;
	title: string;
	subtitle?: ReactNode;
}

const Register = memo(() => {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation('register');

	const { width } = useWindowDimensions();
	const config = getRegisterConfig();

	const {
		control,
		errors,
		isLoading,
		trigger,
		getValues,
		watch,
		setError,
		clearErrors,
		handleSubmit,
		onSubmit,
	} = useRegisterForm({ config });

	const watchedUsername = (watch('username') as string | undefined) ?? '';

	const flashListRef = useRef<FlashListRef<Step>>(null);

	const {
		currentStep,
		scrollX,
		pagerRef,
		handleNext,
		handleBack,
		steps,
		isUsernameAvailable,
		isCheckingUsername,
		isUsernameCheckFailed,
	} = useStepNavigation({
		trigger,
		username: watchedUsername,
		getValues,
		setError,
		clearErrors,
		handleSubmit,
		onSubmit,
		config,
	});

	useLayoutEffect(() => {
		pagerRef.current = {
			setPage: (index: number) => {
				flashListRef.current?.scrollToIndex({ index, animated: true });
			},
		};
	}, [pagerRef]);

	// The dots follow the step with an animation that runs on the UI thread: JS only sets where it ends, once per step, and
	// nothing runs on the JS thread while it plays (the list's scroll events used to write this on every frame).
	useEffect(() => {
		scrollX.value = withTiming(currentStep * width, { duration: 300 });
	}, [currentStep, width, scrollX]);

	const dateInputRef = useRef<DateInputRef>(null);

	const handleNextWithClose = useCallback(() => {
		dateInputRef.current?.close();
		handleNext();
	}, [handleNext]);

	const renderStep = useCallback(
		({ item, index }: { item: Step; index: number }) => (
			<StepForm
				item={{ ...item, subtitle: item.subtitle ?? null }}
				control={control}
				errors={errors}
				isLoading={isLoading}
				isUsernameAvailable={isUsernameAvailable}
				isCheckingUsername={isCheckingUsername}
				isUsernameCheckFailed={isUsernameCheckFailed}
				verificationMethod={config.verificationMethod}
				isActive={index === currentStep}
				hideTitle
				dateInputRef={dateInputRef}
				checkPasswordsMatch={function (): boolean {
					throw new Error('Function not implemented.');
				}}
			/>
		),
		[
			control,
			errors,
			isLoading,
			isUsernameAvailable,
			isCheckingUsername,
			isUsernameCheckFailed,
			config.verificationMethod,
			currentStep,
		],
	);

	const keyExtractor = useCallback((item: Step) => item.id, []);
	const isUsernameStep = steps[currentStep]?.id === 'username';
	const isUsernameUnavailable = isUsernameStep && isUsernameAvailable === false;

	return (
		<KeyboardAvoidingView behavior="padding" style={styles.screen}>
			<HStack
				items="center"
				justify="center"
				gap={theme.spacing.tiny}
				style={[styles.dotsRow, { marginTop: insets.top + theme.spacing.standard }]}
			>
				{steps.map((_, index) => (
					<PaginatorDot key={index} index={index} scrollX={scrollX} />
				))}
			</HStack>

			{/* The character asks the question at the top, under the dots; the field answers it below. */}
			<StoryPanel control={control} stepId={steps[currentStep]?.id} character={currentStep === 0 ? 'cat' : 'mouse'} />

		<FlashList
			ref={flashListRef as any}
			data={steps}
			extraData={errors}
			renderItem={renderStep}
			keyExtractor={keyExtractor}
			horizontal
			pagingEnabled
			scrollEnabled={false}
			removeClippedSubviews
			drawDistance={width * steps.length}
			showsHorizontalScrollIndicator={false}
		/>
			{/* Takes the room left, so the buttons stay at the bottom of the screen whatever the step above holds. */}
			<View style={styles.spacer} />
			<VStack
				padding={{
					paddingHorizontal: theme.spacing.large,
					paddingBottom: theme.spacing.large + insets.bottom,
				}}
				gap={theme.spacing.standard}
			>
				<HStack gap={theme.spacing.small} items="center" justify="space-between">
					{currentStep !== 0 && (
						<Button
							variant="default"
							size="lg"
							rounded
							style={styles.backButton}
							onPress={handleBack}
							disabled={isLoading}
						>
							<HStack
								items="center"
								justify="center"
								gap={theme.spacing.small}
							>
								<IconChevronLeft size={22} color={theme.pallate.neutral['05']} />
								<Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
									Kembali
								</Text>
							</HStack>
						</Button>
					)}
					<Button
						variant="primary"
						size="lg"
						rounded
						fill
						style={styles.nextButton}
						onPress={handleNextWithClose}
						disabled={
							isLoading || isUsernameUnavailable || (isUsernameStep && isCheckingUsername)
						}
					>
						{/* The label at the left and the chevron at the right edge; the last step has no chevron, so its label is centred. */}
						<HStack
							fill
							items="center"
							justify={currentStep < steps.length - 1 ? 'space-between' : 'center'}
						>
							<Text type="b1" weight="bold" color={theme.pallate.neutral['01']}>
								{currentStep === steps.length - 1
									? isLoading
										? t('actions.finishing')
										: t('actions.finish')
									: (t([`actions.next_${steps[currentStep]?.id}`, 'actions.next'] as never) as unknown as string)}
							</Text>
							{currentStep < steps.length - 1 && (
								<IconChevronRight size={20} color={theme.pallate.neutral['01']} />
							)}
						</HStack>
					</Button>
				</HStack>

				{currentStep === 0 && (
					<Button
						variant="link"
						size="sm"
						// Replaces this screen, so going back from the login screen lands on Home.
						onPress={() => navigation.replace('login')}
					>
						<Text type="b2" color={theme.pallate.neutral['04']}>
							Sudah punya akun?{' '}
							<Text
								type="b2"
								weight="semibold"
								color={theme.pallate.primary['03']}
							>
								Masuk
							</Text>
						</Text>
					</Button>
				)}
			</VStack>
		</KeyboardAvoidingView>
	);
});

Register.displayName = 'Register';

const styles = StyleSheet.create({
	container: {
		backgroundColor: theme.pallate.neutral['01'],
	},
	header: {
		paddingHorizontal: theme.spacing.large,
		paddingVertical: theme.spacing.standard,
	},
	dotsRow: {
		paddingVertical: theme.spacing.standard,
	},
	nextButton: {
		flex: 1,
		// More room at the sides than the default 22: the label and the chevron are pushed to the two ends.
		paddingHorizontal: theme.spacing.extraLarge,
	},
	backButton: {
		paddingHorizontal: theme.spacing.extraLarge,
	},
	screen: {
		flex: 1,
	},
	spacer: {
		flex: 1,
	},

});

export default Register;