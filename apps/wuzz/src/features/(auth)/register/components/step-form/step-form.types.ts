import type { ReactNode, RefObject } from 'react';
import type { Control } from 'react-hook-form';
import type { RegisterFormData } from '../../hooks';
import type { VerificationMethod } from '../../config';
import type { DateInputRef } from '@components/atoms';

export type StepFormStep = {
  id: string;
  title: string;
  subtitle: ReactNode;
};

export type StepFormProps = {
  item: StepFormStep;
  control: Control<RegisterFormData>;
  errors: Record<string, { message?: string } | undefined>;
  isLoading: boolean;
  checkPasswordsMatch: () => boolean;
  isUsernameAvailable?: boolean;
  isCheckingUsername?: boolean;
  /** The username availability request failed (no answer from the server). */
  isUsernameCheckFailed?: boolean;
  verificationMethod: VerificationMethod;
  isActive?: boolean;
  dateInputRef?: RefObject<DateInputRef | null>;
  /** The step's question is asked elsewhere (the story bubble), so only its hint shows. */
  hideTitle?: boolean;
};
