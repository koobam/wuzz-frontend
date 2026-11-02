import React, { memo } from 'react';
import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { RegisterFormData } from '../../hooks';
import { StoryBubble, type StoryCharacter } from '../story-bubble';

type StoryPanelProps = {
  control: Control<RegisterFormData>;
  /** The id of the step on screen: it decides what is asked and what was answered just before. */
  stepId: string | undefined;
  character: StoryCharacter;
};

/**
 * The conversation for the step on screen: the character's line, and the person's previous answer above it. It watches the
 * form itself, so typing re-renders only this small panel and not the whole register screen (and so costs the JS thread as
 * little as it can); the animations it starts run on the UI thread.
 */
export const StoryPanel = memo(({ control, stepId, character }: StoryPanelProps) => {
  const { t, i18n } = useTranslation('register');
  const fullName = ((useWatch({ control, name: 'fullName' }) as string | undefined) ?? '').trim();
  const rawBirthDate = useWatch({ control, name: 'birthDate' }) as string | undefined;
  const username = (useWatch({ control, name: 'username' }) as string | undefined) ?? '';

  if (!stepId) return null;

  const firstName = fullName.split(/\s+/)[0] ?? '';
  // The birthday as a date in the language in use.
  const birthDate =
    rawBirthDate && rawBirthDate.length === 10
      ? new Date(`${rawBirthDate}T00:00:00`).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

  // The person's answer to the step before this one, shown as their own bubble above the character's line.
  const replies: Record<string, string> = {
    birthDate: fullName,
    username: birthDate,
    phone: username ? `@${username}` : '',
    email: username ? `@${username}` : '',
  };

  // The line with the name when there is one for this step (`_named`), else the plain line.
  const line = t(
    (firstName ? [`story.${stepId}_named`, `story.${stepId}`] : `story.${stepId}`) as never,
    { name: firstName, birthDate, username } as never,
  ) as unknown as string;

  return <StoryBubble line={line} reply={replies[stepId]} character={character} />;
});

StoryPanel.displayName = 'StoryPanel';
